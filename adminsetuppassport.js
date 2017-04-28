var adminPassport = require('passport');
var localStrategy = require('passport-local').Strategy;

var User = require('./models/user');
var Admin = require('./models/admin');

module.exports = function(){
    adminPassport.serializeUser(function(admin, done){
        done(null, admin._id);
    });

     adminPassport.deserializeUser(function(id, done){
        Admin.findById(id, function(err, admin){
             done(err, admin);
        });
     });
};

adminPassport.use('admin-local', new localStrategy(
    function(username, password, done){
        admin.findOne({username : username}, function(err, admin){
            if(err){return done(err);}
            if(!admin){
                return done(null, false,
                 {message: "Sorry no user has that username!"});
            }
            if(admin.password != password){
                 return done(null, false,
                 {message: "Sorry invalied password"});
            }else{
                return done(null, admin);
            }
           
        });
    }
));


