var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection  = require('express-myconnection');
var session = require('express-session');
var app = express();
var server = require('http').createServer(app);
//var io = require('socket.io').listen(server);
var port = process.env.PORT || 5000;

server.listen(port, function () {
  console.log('Magic is happening at port %d', port);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "Your secret key"}));

app.use(
    connection(mysql,{

        host: 'localhost',
        user: 'root',
        password : 'lel',
        port : 3306, //port mysql
        database:'users'
},'pool')
);


app.get('/',function(req, res, next) {
  res.render('index',{username:req.session.user});
});

/*io.sockets.on('connect', function(socket){
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  // Disconnect
sockets.on('disconnect',function(data){
 connections.splice(connections.indexOf(socket), 1);
  console.log('Disconnected: %s sockets connected' , connections.length);
});
});*/

app.get('/home/:page',function(req,res){
   page = req.params.page;
   res.render(page);
});

app.get('/game/:name',function(req, res, next) {
  var name = req.params.name;
  req.getConnection(function(err,connection){
    var query = connection.query('SELECT * FROM users',function(err,rows){
            if(err)
              console.log("Error Selecting : %s ",err );
  res.render('game', { Game:  name , data:rows ,username:req.session.user});
});
 });
});


app.post('/myaction', function(req, res) {
  req.getConnection(function(err,connection){
	console.log('req.body');
	console.log(req.body);
	var record = {username: req.body.username, email: req.body.email, password: req.body.password};

	//connection.connect();
  connection.query('INSERT INTO users SET username=? , email = ?, password = ?' ,[record['username'],record['email'], record['password']], function(err,res){
          if(err) throw err;
        console.log('Last record insert id:', res.insertId);
	});
});
	res.redirect('/home/login');
	//connection.end();

res.end();
});

app.post('/verifyuser', function(req,res){
req.getConnection(function(err,connection){
  console.log('checking user in database');
	console.log(req.body.password);
	var selectString = 'SELECT COUNT(username) FROM users WHERE username="'+req.body.username+'" AND password="'+req.body.password+'" ';

	connection.query(selectString, function(err, results) {

        console.log(results);
        var string=JSON.stringify(results);
        console.log(string);
        //this is a walkaround of checking if the email pass combination is 1 or not it will fail if wrong pass is given
        if (string === '[{"COUNT(username)":1}]') {
      req.session.user = { hi : req.body.username };
      res.redirect('/');

	        }
        if (string === '[{"COUNT(username)":0}]')  {
        	res.redirect('/home/login');

        }
});
});
});
app.get('/logout', function(req, res){
   req.session.destroy();
  res.redirect('/');
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
