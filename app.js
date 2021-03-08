var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');

var app = express();

app.use(cors());

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'recipesApp', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

app.use(errorhandler());

mongoose.connect('mongodb://localhost/recipesApp');
mongoose.set('debug', true);

require('./models/Recipe');
require('./models/RecipeIngredient');

app.use(require('./routes'));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({'errors': {
    message: err.message,
    error: err
  }});
});

var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
