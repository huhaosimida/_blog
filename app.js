var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var Cookies = require('cookies');
var bodyParser = require('body-parser');
var moment = require('moment');
var ejs= require('ejs');
var mongoose = require('mongoose');
var User = require('./models/User');
var Category = require('./models/Category');



var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
//创建app应用
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//设置cookie
app.locals.moment = require('moment');  
app.use(function (req,res,next) {
    req.cookies=new Cookies(req,res);
    req.userInfo1 = {};
    if( req.cookies.get('userInfo1') ){
        try{
          req.userInfo1 = JSON.parse( req.cookies.get('userInfo1') );
          User.findById(req.userInfo1._id).then(function(userInfo1){
                req.userInfo1.isAdmin = Boolean( userInfo1.isAdmin );
                next();
              });
        }catch(e){
          next();
        }
    }else{
          next();
        }
});

app.use('/', index);
app.use('/users', users);
app.use('/admin',admin);

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
  res.render('error');
});
mongoose.connect('mongodb://localhost:27017/blog',function(err){
	if(err){
		console.log('数据库连接失败')
	}	else{
		console.log('数据库链连接成功')
	}
});

module.exports = app;
