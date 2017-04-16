var express = require('express');

var User = require('../models/user');
var Admin = require('../models/admin');
var Pandingpay = require('../models/pandingpay');
var Confirmpay = require('../models/confirmpay');
var passport = require('passport');

var router = express.Router();


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
   next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
};

function Authenticated(req, res, next) {
  if (req.isAuthenticated()) {
       res.redirect('/dashboard/' + req.user.username);
  }else {
     next();
  }
};

router.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

/* GET home page. */
router.get('/', Authenticated, function(req, res) {
  res.render('index',{
        title: 'Home'
    });
});

/* GET home page. */
router.get('/register', function(req, res) {
  res.render('register',{
        title: 'register'
    });
});

router.get('/login', function(req, res) {
  res.render('login', {
        title: 'Login'
    });
});

router.get('/recovery', function(req, res) {
  res.render('recovery');
});

router.get('/about', function(req, res) {
  res.render('about',{
        title: 'About'
    });
});
router.get('/contact', function(req, res) {
  res.render('contact');
});
router.get('/admin/login', function(req, res) {
  res.render('adminlogin');
});

router.get("/paytrack/:username/:userid", ensureAuthenticated, function(req, res, next) {
   Pandingpay.find({ users: { $elemMatch: { user: req.params.userid } } }, function(err, pendingstock){
      if (err) { return next(err); }
      if (pendingstock.length > 0) { 
        console.log(pendingstock);
        return  res.render('paytrack1', {pendingstock: pendingstock});
       }else{
          Confirmpay.find({ users: { $elemMatch: { user: req.params.userid } } }, function(err, confirmstock){
              if (err) { return next(err); }
              if (confirmstock.length > 0) { 
                   return  res.render('paytrack2');
               }else{
                 return  res.render('paytrack3');
               }
         });
       }
  });
});

router.get('/dashboard/:username', ensureAuthenticated, function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return next(404); }
  res.render("dashboard", { user: user });
  });
});


router.get("/profile/:username", ensureAuthenticated, function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return next(404); }
  res.render("profile", { user: user });
  });
});

router.get("/payout/:username", ensureAuthenticated, function(req, res, next) {
  Pandingpay.find({}, function(err, stock) {
  if (err) { return next(err); }
  if (!stock) { return next(404); }
  res.render("payout", { stock: stock });
  });
});

router.post("/edit/profile/detials", ensureAuthenticated, function(req, res, next) {
  req.user.fullname = req.body.fullname;
  req.user.country = req.body.country;
  req.user.contact = req.body.contact;
  req.user.contact2 = req.body.contact2;
  req.user.save(function(err) {
    if (err) {
    next(err);
    return;
  }
  req.flash("info", "User detials updated!");
  res.redirect('/profile/' + req.user.username);
  });
});

router.post("/edit/profile/bank", ensureAuthenticated, function(req, res, next) {
  req.user.bank = req.body.bank;
  req.user.accountnum = req.body.accountnum;
  req.user.accountname = req.body.accountname;
  req.user.save(function(err) {
    if (err) {
    next(err);
    return;
  }
  req.flash("info", "Bank detials updated!");
  res.redirect('/profile/' + req.user.username);
  });
});

router.post('/updatestock/:stockid', function(req, res, next) {
    if(!req.body.depositor || !req.body.amount ){
      req.flash("error", "Please all the fields are very important");
      return res.redirect("/paytrack/" + req.user.username + "/"+req.user._id);
    }
    Pandingpay.update( {_id: req.params.stockid, "users.user": req.user._id },{ $set: { "users.$.payAt" : Date.now(), "users.$.depositorname" :req.body.depositor, "users.$.amount" :req.body.amount}},function(err){
      if (err) { return next(err); }
      req.flash("error", "successfull");
      return res.redirect("/paytrack/" + req.user.username + "/"+req.user._id);
    })
  });

router.post("/payout/:userid/:stockname", ensureAuthenticated, function(req, res, next) {
  User.findOne({ _id: req.params.userid }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return next(404); }
  Pandingpay.find({ users: { $elemMatch: { user: req.params.userid } } }, function(err, pendingstock){
      if (err) { return next(err); }
      if (pendingstock.length > 0) { 
         req.flash("info", "You already have a pending  stock");
        return res.redirect('/payout/' + req.user.username);
       }
       Confirmpay.find({ users: { $elemMatch: { user: req.params.userid } } }, function(err, confirmstock){
          if (err) { return next(err); }
          if (confirmstock.length > 0) { 
             req.flash("info", "You stock payment has been confirm you have to wait to be paid before geting another stock");
            return res.redirect('/payout/' + req.user.username);
           }
       Pandingpay.findOne({ name: req.params.stockname }, function(err, stock) {
        if (err) {   return next(err); }
        if (!stock) { console.log('err');  return next(404); }
       Pandingpay.update({ name: req.params.stockname },{ $push: { users:{ user: user._id}}}, function(err){
            if (err) { return next(err); }
            User.update({_id: req.params.userid}, { stockAt: Date.now() }, function(err, data) {
              if (err) {   return next(err); }
              console.log('data' + data);
            });
              Pandingpay.update( {name: req.params.stockname, "users.user": req.user._id },{ $set: { "users.$.stockAt" : Date.now()}},function(err, result){
                if (err) { return next(err); }
                console.log('result' + result);
              })
            req.flash("info", "You have successfull signup on the "+ stock.cost + " stock, click on payout to see your payout details. You have 24hours to payout else your account will be blocked");
            res.redirect('/payout/' + req.user.username);
       });
     });
     });
  });
  });
});

router.get('/logout', function(req, res) {
 req.logout();
 res.redirect('/login');
});


router.post('/register', function(req, res, next) {
  if(!req.body.fullname || !req.body.country || !req.body.email || !req.body.gender || !req.body.contact || !req.body.username || !req.body.password1 || !req.body.password2 ){
    req.flash("error", "Please all the fields are very important");
    return res.redirect("/register");
  }
  if(req.body.password1 != req.body.password2){
     req.flash("error", "Your password dnt match please try again");
    return res.redirect("/register");
  }

  var fullname = req.body.fullname;
  var email = req.body.email;
  var country = req.body.country;
  var gender = req.body.gender;
  var contact = req.body.contact;
  var username = req.body.username;
  var password = req.body.password1;

User.findOne({username : username}, function(err, user){
  if(err){
    console.log('err err');
    return next(err);
  }
  if(user){
    req.flash("error", "Sorry the username you pick has aready been taken by another siftpayer");
    return res.redirect("/register");
  }
  else{
    User.findOne({email : email}, function(err, user){
      if(err){
        console.log('err err');
        return next(err)
      }
      if(user){
        req.flash("error", "Sorry the email you pick has aready been taken by another siftpayer");
        return res.redirect("/register");
      }else{
          var newUser = new User({
            fullname : fullname,
            email : email,
            country : country,
            gender : gender,
            contact : contact,
            username : username,
            password : password
          });
          newUser.save();
          console.log('saved saved');
          console.log(newUser);
          req.flash("info", "Congratulations " + newUser.username + " you have successfully registered on swift-pay");
          return res.redirect('/register');
      }
    });
  }
})
});


router.post('/login', function(req, res, next) {
      passport.authenticate('user-local', {failureFlash:true}, function(err, user, info) {
       if(!req.body.password || !req.body.username){
          req.flash("error", "Please enter your username and password");
          return res.redirect("/login");
        }
       if (err) { return next(err); }
       if (!user) { 
          req.flash("error", "Sorry  username or password is invalied!");
          return res.redirect('/login'); 
        }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
       return res.redirect('/dashboard/' + user.username);
     });
    })(req, res, next);
    });

router.post('/admin/register', function(req, res, next) {
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
module.exports = router;
