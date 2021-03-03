var mongoose = require('mongoose');

var ReceiptIngredientSchema = new mongoose.Schema({
  name: String,
  amount: {type: Number, default: 0},
  amountUnit: String
}, {timestamps: true});

ReceiptIngredientSchema.methods.toJSONFor = function(){
  return {
    slug: this.slug,
    name: this.name,
    amount: this.amount,
    amountUnit: this.amountUnit,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

mongoose.model('ReceiptIngredient', ReceiptIngredientSchema);
