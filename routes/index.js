var express = require('express');

var User = require('../models/user');
var Admin = require('../models/admin');
var Pandingpay = require('../models/pandingpay');
var Confirmpay = require('../models/confirmpay');
var passport = require('passport');
var moment = require('moment');

var router = express.Router();


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
   next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/user/login");
  }
};

function Authenticated(req, res, next) {
  if (req.isAuthenticated()) {
       res.redirect('/user/dashboard/');
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
router.get('/', function(req, res) {
  res.render('index',{
        title: 'Home'
    });
});

/* GET home page. */
router.get('/register',  Authenticated, function(req, res) {
  res.render('register',{
        title: 'register'
    });
});

router.get('/refferals/:refferAt', function(req, res) {
  User.findOne({ username: req.params.refferAt }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return  res.redirect("/register");}
   res.render('registerrefferals',{user: user});
})
});

router.get('/login',  Authenticated, function(req, res) {
  res.render('login', {
        title: 'Login'
    });
});

router.get('/recovery',  Authenticated, function(req, res) {
  res.render('recovery');
});

router.get('/about',  Authenticated, function(req, res) {
  res.render('about',{
        title: 'About'
    });
});
router.get('/contact',  Authenticated, function(req, res) {
  res.render('contact');
});

router.get("/paytrack", ensureAuthenticated, function(req, res, next) {
   Pandingpay.find({ users: { $elemMatch: { user: req.user._id } } }, function(err, pendingstock){
      if (err) { return next(err); }
      if (pendingstock.length > 0) { 
        console.log(pendingstock);
        return  res.render('paytrack1', {pendingstock: pendingstock});
       }else{
          Confirmpay.find({ users: { $elemMatch: { user: req.user._id } } }, function(err, confirmstock){
              if (err) { return next(err); }
              if (confirmstock.length > 0) { 
                    if(confirmstock[0].users[0].status == true){
                      return  res.render('paytrack', {confirmstock: confirmstock});
                    }else{
                        return  res.render('paytrack2');
                    }
               }else{
                 return  res.render('paytrack3');
               }
         });
       }
  });
});

router.get('/dashboard', ensureAuthenticated, function(req, res, next) {
  User.findOne({ username: req.user.username }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return next(404); }
    Pandingpay.find({ users: { $elemMatch: { user: req.user._id } } }, function(err, pendingstock){
      if (err) { return next(err); }
      if (pendingstock.length > 0) { 
        console.log(pendingstock);
        return  res.render('dashboard', { 
          user: user, 
          stock: pendingstock[0].value, 
          status: 'pending...'
        });
       }else{
          Confirmpay.find({ users: { $elemMatch: { user: req.user._id } } }, function(err, confirmstock){
              if (err) { return next(err); }
              if (confirmstock.length > 0) { 
                    return  res.render('dashboard', { 
                      user: user, 
                      stock: confirmstock[0].value,
                      status: 'Confirm'
                    });
               }else{
                console.log(user);
                 return  res.render('dashboard', { 
                    user: user, 
                    stock: 'Emty', 
                    status: 'you do not have any stock'
                  });
               }
         });
       }
  });
  });
});

router.get('/messages', ensureAuthenticated,  function(req, res) {
  res.render('messages');
});

router.get("/profile", ensureAuthenticated, function(req, res, next) {
  User.findOne({ username: req.user.username }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return next(404); }
  res.render("profile", { user: user });
  });
});

router.get("/payout", ensureAuthenticated, function(req, res, next) {
  Pandingpay.find({}, function(err, stock) {
  if (err) { return next(err); }
  if (!stock) { return next(404); }
  res.render("payout", { stock: stock });
  });
});

router.post('/changepassword', ensureAuthenticated,  function(req, res, next) {
   if(!req.body.cpassword || !req.body.password1 || !req.body.password2){
          req.flash("error", "All the fields are required");
          return res.redirect("/user/profile");
        }
     User.findOne({ username: req.user.username }, function(err, user) {
        if (err) { return next(err); }
        if (!user) { return next(404); }
        if(user.password != req.body.cpassword){
          req.flash("error", "Invalied current password");
          return res.redirect("/user/profile");
        }
        if(req.body.password1 != req.body.password2){
          req.flash("error", "Your password and confirmation password do not match.");
          return res.redirect("/user/profile");
        }else{
           User.update({username: req.user.username}, { password: req.body.password1 }, function(err) {
              if (err) {   return next(err); }
               req.flash("info", "password changed successfully.");
                return res.redirect("/user/profile");
            });
        }
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
  res.redirect('/user/profile');
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
  res.redirect('/user/profile');
  });
});

router.post('/updatestock/:stockid', ensureAuthenticated,  function(req, res, next) {
    if(!req.body.depositor || !req.body.amount ){
      req.flash("error", "Please all the fields are very important");
      return res.redirect("/user/paytrack");
    }
    Pandingpay.update( {_id: req.params.stockid, "users.user": req.user._id },{ $set: { "users.$.payAt" : Date.now(), "users.$.depositorname" :req.body.depositor, "users.$.amount" :req.body.amount}},function(err){
      if (err) { return next(err); }
      User.update({_id: req.user._id}, { $unset: { stockAt: 1 }}, function(err) {
        if (err) { return next(err); }
        req.flash("error", "successfull");
        return res.redirect("/user/paytrack");
      });
    })
  });

router.get("/payout/:userid/:stockname", ensureAuthenticated, function(req, res, next) {
  User.findOne({ _id: req.params.userid }, function(err, user) {
  if (err) { return next(err); }
  if (!user) { return next(404); }
  Pandingpay.find({ users: { $elemMatch: { user: req.params.userid } } }, function(err, pendingstock){
      if (err) { return next(err); }
      if (pendingstock.length > 0) { 
         req.flash("info", "You already have a pending  stock");
        return res.redirect('/user/payout');
       }
       Confirmpay.find({ users: { $elemMatch: { user: req.params.userid } } }, function(err, confirmstock){
          if (err) { return next(err); }
          if (confirmstock.length > 0) { 
             req.flash("info", "You stock payment has been confirm you have to wait to be paid before geting another stock");
            return res.redirect('/user/payout');
           }
       Pandingpay.findOne({ name: req.params.stockname }, function(err, stock) {
        if (err) {   return next(err); }
        if (!stock) { console.log('err');  return next(404); }
       Pandingpay.update({ name: req.params.stockname },{ $push:{ users:{ user: user._id}}}, function(err){
            if (err) { return next(err); }
            User.update({_id: req.params.userid}, { stockAt: moment().add(40, 'seconds') }, function(err, data) {
              if (err) {   return next(err); }
            });
            req.flash("info", "You have successfull signup on the "+ stock.value + " stock, click on payout to see your payout details. You have 24hours to payout else your account will be blocked");
            res.redirect('/user/payout');
       });
     });
     });
  });
  });
});


router.get('/confirm/:stockname/:stockuserid', ensureAuthenticated, function(req, res, next) {
  Confirmpay.update({ name: req.params.stockname},{ $pull: { 'users': { _id: req.params.stockuserid } } }, function(err){
    if (err) { 
        return next(err); 
      }else{
        return res.redirect("/user/paytrack");
      }
  });
});

router.get('/logout', function(req, res) {
 req.logout();
 res.redirect('/user/login');
});


router.post('/register', function(req, res, next) {
  if(!req.body.fullname || !req.body.country || !req.body.email || !req.body.gender || !req.body.contact || !req.body.username || !req.body.password1 || !req.body.password2 ){
    req.flash("error", "Please all the fields are very important");
    return res.redirect("/user/register");
  }
  if(req.body.password1 != req.body.password2){
     req.flash("error", "Your password dnt match please try again");
    return res.redirect("/user/register");
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
    return res.redirect("/user/register");
  }
  else{
    User.findOne({email : email}, function(err, user){
      if(err){
        console.log('err err');
        return next(err)
      }
      if(user){
        req.flash("error", "Sorry the email you pick has aready been taken by another siftpayer");
        return res.redirect("/user/register");
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
          return res.redirect('/user/register');
      }
    });
  }
})
});

router.post('/register/refferals/:username', function(req, res, next) {
  if(!req.body.fullname || !req.body.country || !req.body.email || !req.body.gender || !req.body.contact || !req.body.username || !req.body.password1 || !req.body.password2 ){
    req.flash("error", "Please all the fields are very important");
     return res.redirect('/user/refferals/'+req.params.username);
  }
  if(req.body.password1 != req.body.password2){
     req.flash("error", "Your password dnt match please try again");
     return res.redirect('/user/refferals/'+req.params.username);
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
     return res.redirect('/user/refferals/'+req.params.username);
  }
  else{
    User.findOne({email : email}, function(err, user){
      if(err){
        console.log('err err');
        return next(err)
      }
      if(user){
        req.flash("error", "Sorry the email you pick has aready been taken by another siftpayer");
         return res.redirect('/user/refferals/'+req.params.username);
      }else{
        User.findOne({username : req.params.username}, function(err, userref){
        if(err){
          return next(err);
        }
          var newUser = new User({
            fullname : fullname,
            email : email,
            country : country,
            gender : gender,
            contact : contact,
            username : username,
            password : password,
            refferBy : userref._id
          });
          newUser.save(function(err){
             if(err){
                return next(err);
              }
               console.log('saved saved');
                console.log(newUser);
                req.flash("info", "Congratulations " + newUser.username + " you have successfully registered on swift-pay");
                return res.redirect('/user/refferals/'+req.params.username);
          });
        });
      }
    });
  }
})
});


router.post('/login', function(req, res, next) {
      passport.authenticate('user-local', {failureFlash:true}, function(err, user, info) {
       if(!req.body.password || !req.body.username){
          req.flash("error", "Please enter your username and password");
          return res.redirect("/user/login");
        }
       if (err) { return next(err); }
       if (!user) { 
          req.flash("error", "Sorry  username or password is invalied!");
          return res.redirect('/user/login'); 
        }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
       return res.redirect('/user/dashboard');
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
