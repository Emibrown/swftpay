var express = require('express');

var User = require('../models/user');
var Admin = require('../models/admin');
var Pandingpay = require('../models/pandingpay');
var Confirmpay = require('../models/confirmpay');
var passport = require('passport');
var moment = require('moment');

var routeradmin = express.Router();


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
   next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/admin/login");
  }
};



routeradmin.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

/* GET home page. */

routeradmin.get('/login', function(req, res) {
  res.render('adminlogin');
});

routeradmin.get("/stock/:username", ensureAuthenticated, function(req, res, next) {
  Pandingpay.find({}, function(err, stocks) {
  if (err) { return next(err); }
  if (!stocks) { return next(404); }
  res.render("adminstock", { stocks: stocks });
  });
});

routeradmin.post('/stock/:username', ensureAuthenticated, function(req, res, next) {
  if(!req.body.name || !req.body.value){
    req.flash("error", "Please all the fields are very important");
    return res.redirect("/admin/stock/" + req.params.username);
  }else{
     var pandingpay = new Pandingpay();
        pandingpay.name = req.body.name;
        pandingpay.value = req.body.value;
        pandingpay.save(function(err) {
          if (err) {
           return next(err);
          } else {
           var confirmpay = new Confirmpay();
               confirmpay.name = req.body.name;
               confirmpay.value = req.body.value;
               confirmpay.save(function(err){
                 if (err) {
                 return next(err);
                } else{
                  console.log(pandingpay);
                  console.log(confirmpay);
                   req.flash("info", "Stock add successfully");
                   res.redirect("/admin/stock/" + req.params.username);
                }
               });
          }
        });
  }
});

routeradmin.get("/removestock/:username/:name", ensureAuthenticated, function(req, res, next) {
 Pandingpay.findOneAndRemove({name: req.params.name}, function(err){
      if (err) { 
        return next(err); 
      }else{
        Confirmpay.findOneAndRemove({name: req.params.name}, function(err){
            if (err) { 
              return next(err); 
            }else{
              return res.redirect("/admin/stock/" + req.params.username);
            }
       });
      }
 });
});


routeradmin.get("/allusers/:username", ensureAuthenticated, function(req, res, next) {
  User.find({}, function(err, users) {
  if (err) { return next(err); }
  if (!users) { return next(404); }
  res.render("adminallusers", { users: users });
  });
});

routeradmin.get("/userdetails/:username", ensureAuthenticated, function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return next(404); }
  res.render("adminuserdetails", { user: user });
  });
});





routeradmin.get("/stockusers/:id", ensureAuthenticated, function(req, res, next) {
  Pandingpay.findOne({_id: req.params.id})
  .populate('users.user')
  .exec(function(err, stock) {
  if (err) { return next(err); }
  if (!stock) { return next(404); }
  res.render("adminstockusers", { stock: stock });
  console.log(stock);
  });
});

routeradmin.get('/logout', function(req, res) {
 req.logout();
 res.redirect('/admin/login');
});

routeradmin.post('/login', function(req, res, next) {
      passport.authenticate('admin-local', {failureFlash:true}, function(err, user, info) {
       if(!req.body.password || !req.body.username){
          req.flash("error", "Please enter your username and password");
          return res.redirect("/admin/login");
        }
       if (err) { return next(err); }
       if (!user) { 
          req.flash("error", "Sorry  username or password is invalied!");
          return res.redirect('/admin/login'); 
        }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/admin/allusers/' + user.username);
     });
    })(req, res, next);
    });

routeradmin.post('/register', function(req, res, next) {
  if(!req.body.password || !req.body.username ){
     console.log('fields required');
     return;
  }
  var username = req.body.username;
  var password = req.body.password;

Admin.findOne({username : username}, function(err, admin){
  if(err){
    console.log('err err');
    return next(err)
  }
  if(admin){
      console.log('admin already exist');
      return;
  }
  else{
          var newadmin = new Admin({
            username : username,
            password : password
          });
          newadmin.save();
          console.log('saved saved');
          console.log(newadmin);
      }
    });
});
module.exports = routeradmin;
