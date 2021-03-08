var mongoose = require('mongoose');

var RecipeIngredientSchema = new mongoose.Schema({
  name: String,
  amount: {type: Number, default: 0},
  amountUnit: String
});

var RecipeSchema = new mongoose.Schema({
  title: String,
  stars: {type: Number, default: 1},
  ingredientsPerPerson: [RecipeIngredientSchema],
  steps: [{ type: String }]
}, {timestamps: true});

RecipeSchema.methods.updateStars = function(stars) {
  var recipe = this;

  recipe.stars = stars;

  return recipe.save();
};

RecipeSchema.methods.toJSONFor = function(){
  return {
    id: this._id,
    title: this.title,
    stars: this.stars,
    createdAt: this.createdAt
  };
};

mongoose.model('Recipe', RecipeSchema);
