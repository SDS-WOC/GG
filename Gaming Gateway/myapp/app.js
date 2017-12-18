var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req, res, next) {
  res.render('index');
});

app.get('/dota',function(req, res, next) {
  res.render('game', { Game: 'Dota' });
});

app.get('/cs',function(req, res, next) {
  res.render('game', { Game: 'CounterStrike' });
});

app.get('/aoe',function(req, res, next) {
  res.render('game', { Game: 'AOE' });
});

app.get('/fifa',function(req, res, next) {
  res.render('game', { Game: 'FIFA' });
});

app.get('/league',function(req, res, next) {
  res.render('game', { Game: 'League' });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});


module.exports = app;
port = process.env.PORT || 5000;
var server = app.listen(port, function() {
  console.log('Magic is happening on port ' + port);
});
