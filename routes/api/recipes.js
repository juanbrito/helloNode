var router = require('express').Router();
var mongoose = require('mongoose');
const { ObjectID } = require( 'mongodb' )
var Recipe = mongoose.model('Recipe');
var RecipeIngredient = mongoose.model('RecipeIngredient');
var auth = require('../auth');

// Preload recipe objects on routes with ':recipe'
router.param('recipe', function(req, res, next, id) {
  Recipe.findById(id)
    .then(function (recipe) {
      if (!recipe) { return res.sendStatus(404); }

      req.recipe = recipe;

      return next();
    }).catch(next);
});

router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  
  if(req.query.term !== 'undefined'){
    query = { $or:[ 
      { 'title' : { '$regex': req.query.term, "$options": "i" } },
      { 'ingredientsPerPerson.name' : { '$regex': req.query.term, "$options": "i" } } 
    ] };
  }

  Recipe.find(query)
      .sort((req.query.byStars !== 'undefined' && req.query.byStars) ? {stars: ((req.query.byStarsAsc !== 'undefined' && req.query.byStarsAsc) ? 'asc' : 'desc')} : {createdAt: 'desc'})
      .exec()
  .then(function(recipes){
    return res.json({
      recipes: recipes.map(function(recipe){
        return recipe.toJSONFor();
      })
    });
  }).catch(next);
});

router.get('/:recipe', auth.optional, function(req, res, next) {
  return res.json({recipe: req.recipe.toJSONFor()});
});

router.put('/:recipe/stars', auth.required, function(req, res, next) {
  if(typeof req.body.stars !== 'undefined'){
    req.recipe.stars = req.body.stars;
  }

  req.recipe.save().then(function(recipe){
    return res.json({recipe: recipe.toJSONFor()});
  }).catch(next);
});

router.get('/:recipe/ingredients', auth.optional, function(req, res, next){
  return req.recipe.populate('ingredientsPerPerson').execPopulate().then(async function(recipe) {
        var ingredientsPerPerson = await Promise.all(recipe.populated('ingredientsPerPerson').map(async function(ingredientPerPersonObjectId){
          var a = await RecipeIngredient.findById(ingredientPerPersonObjectId.toString());

          return await RecipeIngredient.findById(ingredientPerPersonObjectId.toString());
        }));

      return res.json({recipeIngredients: ingredientsPerPerson.map(function(ingredientPerPerson){  
          ingredientPerPerson.amount = ingredientPerPerson.amount * (req.query.dinersCount !== 'undefined' ? req.query.dinersCount : 1);

          return ingredientPerPerson.toJSONFor();
      })});
  }).catch(next);
});

router.get('/:recipe/steps', auth.optional, function(req, res, next){
  return res.json(
    {
      steps: req.recipe.steps.map(function(step) {
        return step;
      })
    } 
  )
});

module.exports = router;
