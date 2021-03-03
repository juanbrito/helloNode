var mongoose = require('mongoose');

var ReceiptSchema = new mongoose.Schema({
  title: String,
  stars: {type: Number, default: 1},
  ingredientsPerPerson: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReceiptIngredient' }],
  steps: [{ type: String }]
}, {timestamps: true});


ReceiptSchema.methods.updateStars = function(stars) {
  var receipt = this;

  receipt.stars = stars;

  return receipt.save();
};

ReceiptSchema.methods.toJSONFor = function(){
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

mongoose.model('Receipt', ReceiptSchema);
