var router = require('express').Router();
var mongoose = require('mongoose');
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

router.param('recipeIngredient', function(req, res, next, id) {
  RecipeIngredient.findById(id).then(function(recipeIngredient){
    if(!recipeIngredient) { return res.sendStatus(404); }

    req.recipeIngredient = recipeIngredient;

    return next();
  }).catch(next);
});

router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  if( typeof req.query.name !== 'undefined' ){
    query.name = {"$in" : [req.query.name]};
  }

  Promise.all([
    Recipe.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort(req.query.byStars ? {stars: req.query.byStarsAsc ? 'asc' : 'desc'} : {createdAt: 'desc'})
      .exec()
  ]).then(function(results){
    var recipes = results[0];

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
  return req.recipe.populate({
    path: 'recipeIngredients',
    options: {
      sort: {
        createdAt: 'desc'
      }
    }
  }).execPopulate().then(function(recipe) {
    return res.json({recipeIngredients: req.recipe.recipeIngredients.map(function(recipeIngredient){
      return recipeIngredient.toJSONFor();
    })});
  }).catch(next);
});

module.exports = router;
