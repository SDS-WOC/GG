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
var io = require('socket.io').listen(server);
var sharedsession = require("express-socket.io-session");
var port = process.env.PORT || 5000;
var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
var bcrypt = require('bcrypt');
games = ["Dota","AOE","League","CounterStrike","FIFA"];
pages = ["login","signup"];

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
app.use(session);
io.use(sharedsession(session, {
    autoSave:true
}));


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
if(req.session.user){
  res.render('index',{username:req.session.user,lel:req.session.user.hi});
}else{res.render('index',{username:req.session.user});}
});

io.sockets.on('connection' , function(socket) {
  socket.on('create' , function(room) {
    socket.join(room);
    users=[];
    socket.username =   socket.handshake.session.user.hi;
  var clients = io.sockets.adapter.rooms[room].sockets;
  for (var clientId in clients ) {
     var clientSocket = io.sockets.connected[clientId].username;
     users.push(clientSocket);
console.log(clientSocket);
     }
     updateUsernames();


  // Disconnect
socket.on('disconnect', function(data){
 socket.leave(room);
updateUsernames();
});
      function updateUsernames(){
          io.sockets.in(room).emit('get users', users );
        }

  // Mesgswgsa
  socket.on('send message', function(data){
  console.log(data);
    io.sockets.in(room).emit('new message',{msg: data , user:socket.username} );
  });
});
  });

app.get('/home/:page',function(req,res){
   page = req.params.page;
if(pages.includes(page))
{
   if(req.session.user){
     res.redirect('/');
      } else {
        res.render(page);
      }
    }else{
      res.redirect('/');
      }
  });



  app.get('/game/:name',function(req, res, next) {
    var name = req.params.name;
  if( games.includes(name))
  {
  if(req.session.user){
    req.getConnection(function(err,connection){
      var query = connection.query('SELECT * FROM users WHERE '+[name]+'=1',function(err,rows){
              if(err)
                console.log("Error Selecting : %s ",err );
  res.render('game', { Game:  name , data:rows ,username:req.session.user,lel:req.session.user.hi});
  });
});
}else{res.redirect('/home/login');}
}  else{res.redirect('/');
}
});




app.post('/myaction', function(req, res) {
  req.getConnection(function(err,connection){
	console.log('req.body');
	console.log(req.body);
	var record = {username: req.body.username, email: req.body.email, password:bcrypt.hashSync(req.body.password, 10)};
var selectString = 'SELECT COUNT(username) FROM users WHERE username="'+[req.body.username]+'"';
connection.query(selectString, function(err, results) {
  var string=JSON.stringify(results);
   if (string === '[{"COUNT(username)":0}]')  {
	//connection.connect();
  connection.query('INSERT INTO users SET username=? , email = ?, password = ?' ,[record['username'],record['email'], record['password']], function(error,res){
          if(error) throw error;
        console.log('Last record insert id:', res.insertId);
        res.redirect('/home/login');
	});
}else{res.redirect('/home/signup');}
});

	//connection.end();
});
});

app.post('/verifyuser', function(req,res){
req.getConnection(function(err,connection){
  console.log('checking user in database');
	console.log(req.body.password);
var password = req.body.password;
  connection.query('SELECT * FROM users WHERE username = ?',[req.body.username], function (error, results, fields) {
console.log(results);
if (error) {
      res.redirect('/home/login');
}else{

  if(results.length >0){
        bcrypt.compare(req.body.password, results[0].password ,function(err, ress) {
     if(!ress){
       res.redirect('/home/login');
      }else{
      req.session.user = { hi : req.body.username };
      res.redirect('/');
    }
  });
}else{
  res.redirect('/home/login');
}
}
});
});
});


app.post('/addcommunity',function(req,res){
req.getConnection(function(err,connection){
  console.log(req.body.lol);
  connection.query('UPDATE users SET '+[req.body.lol]+'=1 WHERE username="'+[req.session.user.hi]+'"')
if(err) throw err;
});
res.redirect('/');
res.end();
});
app.get('/logout', function(req, res){
   req.session.destroy();
  res.redirect('/');
});

app.post('/leavecommunity',function(req,res){
req.getConnection(function(err,connection){
  console.log(req.body.lul);
  connection.query('UPDATE users SET '+[req.body.lul]+'=0 WHERE username="'+[req.session.user.hi]+'"')
if(err) throw err;
});
res.redirect('/');
res.end();
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
