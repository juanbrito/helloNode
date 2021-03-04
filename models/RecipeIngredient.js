var mongoose = require('mongoose');

var RecipeIngredientSchema = new mongoose.Schema({
  name: String,
  amount: {type: Number, default: 0},
  amountUnit: String
});

RecipeIngredientSchema.methods.toJSONFor = function(){
  return {
    id: this._id,
    name: this.name,
    amount: this.amount,
    amountUnit: this.amountUnit,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

mongoose.model('RecipeIngredient', RecipeIngredientSchema, 'recipeIngredients');
