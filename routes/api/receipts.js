var router = require('express').Router();
var mongoose = require('mongoose');
var Receipt = mongoose.model('Receipt');
var ReceiptIngredient = mongoose.model('ReceiptIngredient');
var auth = require('../auth');

// Preload receipt objects on routes with ':receipt'
router.param('receipt', function(req, res, next, id) {
  Receipt.findById(id)
    .then(function (receipt) {
      if (!receipt) { return res.sendStatus(404); }

      req.receipt = receipt;

      return next();
    }).catch(next);
});

router.param('receiptIngredient', function(req, res, next, id) {
  ReceiptIngredient.findById(id).then(function(receiptIngredient){
    if(!receiptIngredient) { return res.sendStatus(404); }

    req.receiptIngredient = receiptIngredient;

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
    Receipt.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort(req.query.byStars ? {stars: req.query.byStarsAsc ? 'asc' : 'desc'} : {createdAt: 'desc'})
      .exec()
  ]).then(function(results){
    var receipts = results[0];

    return res.json({
      receipts: receipts.map(function(receipt){
        return receipt.toJSONFor();
      })
    });
  }).catch(next);
});


router.get('/:receipt', auth.optional, function(req, res, next) {
  return res.json({receipt: req.receipt.toJSONFor()});
});

router.put('/:receipt/stars', auth.required, function(req, res, next) {
  if(typeof req.body.stars !== 'undefined'){
    req.receipt.stars = req.body.stars;
  }

  req.receipt.save().then(function(receipt){
    return res.json({receipt: receipt.toJSONFor()});
  }).catch(next);
});

router.get('/:receipt/receiptIngredients', auth.optional, function(req, res, next){
  return req.receipt.populate({
    path: 'receiptIngredients',
    options: {
      sort: {
        createdAt: 'desc'
      }
    }
  }).execPopulate().then(function(receipt) {
    return res.json({receiptIngredients: req.receipt.receiptIngredients.map(function(receiptIngredient){
      return receiptIngredient.toJSONFor();
    })});
  }).catch(next);
});

module.exports = router;
