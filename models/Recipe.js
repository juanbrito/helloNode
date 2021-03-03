var mongoose = require('mongoose');

var RecipeSchema = new mongoose.Schema({
  title: String,
  stars: {type: Number, default: 1},
  ingredientsPerPerson: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeIngredient' }],
  steps: [{ type: String }]
}, {timestamps: true});


RecipeSchema.methods.updateStars = function(stars) {
  var recipe = this;

  recipe.stars = stars;

  return recipe.save();
};

RecipeSchema.methods.toJSONFor = function(){
  return {
    slug: this.slug,
    title: this.title,
    stars: this.stars,
    ingredientsPerPerson: this.ingredientsPerPerson,
    steps: this.steps,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

mongoose.model('Recipe', RecipeSchema);
