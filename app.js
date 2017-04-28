var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var favicon = require("serve-favicon");
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
require('./models/db');

var index = require('./routes/index');
var admin = require('./routes/admin');
var setuppassport = require('./setuppassport');
var app = express();
var adminapp = express();
var userapp = express();
setuppassport();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/user',session({
  secret: "JHGF>,./?;;LJ8#$?,KL:>>>,,KJJJDHE",
  resave: true,
  saveUninitialized: true
}));
adminapp.use('/admin',session({
  name: 'admin.sid',
  secret: "JHGF>,./?;;LJ8#$?,KL:>>>,,KJJJDHE",
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
adminapp.use('/admin',passport.initialize());
adminapp.use('/admin',passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, "public/images/favicon.ico")));

adminapp.use('/admin', admin);
app.use('/user', index);
app.use(adminapp);



app.all('*', function(req, res) {
  res.redirect("/user");
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
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

module.exports = app;
