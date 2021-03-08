var router = require('express').Router();
var mongoose = require('mongoose');
const { ObjectID } = require( 'mongodb' )
var Recipe = mongoose.model('Recipe');

router.param('recipe', function(req, res, next, id) {
  Recipe.findById(id)
    .then(function (recipe) {
      if (!recipe) { return res.sendStatus(404); }

      req.recipe = recipe;

      return next();
    }).catch(next);
});

router.get('/', async function(req, res, next) {
  var query = {};
  
  if(req.query.term !== 'undefined'){
    query = { $or:[ 
      { 'title' : { '$regex': req.query.term, "$options": "i" } },
      { 'ingredientsPerPerson.name' : { '$regex': req.query.term, "$options": "i" } } 
    ] };
  }

  Recipe.find(query)
      .sort(
        (
          req.query.byStars !== 'undefined' && req.query.byStars) ? 
            {stars: (req.query.byStarsAscDesc !== 'undefined' ? req.query.byStarsAscDesc : 'desc')} :
            {createdAt: 'desc'}
        )
      .exec()
  .then(function(recipes){
    return res.json({
      recipes: recipes.map(function(recipe){
        return recipe.toJSONFor();
      })
    });
  }).catch(next);
});

router.get('/:recipe', function(req, res, next) {
  return res.json({recipe: req.recipe.toJSONFor()});
});

router.put('/:recipe/stars', function(req, res, next) {
  if(typeof req.body.stars !== 'undefined'){
    req.recipe.stars = req.body.stars;
  }

  req.recipe.save().then(function(recipe){
    return res.json({recipe: recipe.toJSONFor()});
  }).catch(next);
});

router.get('/:recipe/ingredients', function(req, res, next){
  return res.json(
    {
      recipeIngredients: req.recipe.ingredientsPerPerson.map(function(ingredientPerPerson) {  
        return {
          name: ingredientPerPerson.name,
          amountUnit: ingredientPerPerson.amountUnit,
          amount: ingredientPerPerson.amount = ingredientPerPerson.amount * (req.query.dinersCount !== 'undefined' ? req.query.dinersCount : 1)
        };
      })
    }
  )
});

router.get('/:recipe/steps', function(req, res, next){
  return res.json(
    {
      steps: req.recipe.steps.map(function(step) {
        return step;
      })
    } 
  )
});

module.exports = router;
