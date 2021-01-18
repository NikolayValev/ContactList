/*External Dependencies*/
var express = require('express');
var path = require('path')
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var ex_session = require('express-session');
require('http');
//Requires
var database = require('./database').build();
var index = require('./routes/index');
var mailer = require('./routes/mailer');
var contacts = require('./routes/contacts');
/*  Sets and uses on app  */
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(ex_session({secret: 'nikolay'}));
app.use(express.static(path.join(__dirname, 'public')));
//app.
/*User passport setup*/
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());
var t_username = "cmps369";
var t_password = "finalproject";
passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
  function(username, password, done) {
        if ( username != t_username ) {
            console.log("Username does not exist!");
            return done(null, false);
        }
        //TODO(nvalev)  link this to the database Users
        if ( password ==t_password ) {
            console.log("Valid credentials!");
            done(null, true);}
        else {
          console.log("You have entered the wrong Password");
           done(null, false);
        }
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
/****************************************************************/
/* */
//New way
app.route("/")
  .get( (req, res) => {
    res.render('login', {});
  })
  .post((req,res)=>{
  console.log("/ post ");
  })
app.route("/login")
.post( passport.authenticate('local',{
  passReqToCallback : true,
  successRedirect: '/contacts',
  failureRedirect: '/login_fail',
  }))
.get((req, res)=>{
  res.render('login', {});
});

app.route("/logout")
.get((req, res)=>{
  req.logout();
  console.log("Logged out");
  res.redirect("/login");
})

/*---------------routes---------------*/
app.use('/', mailer);
app.use('/mailer', mailer);
app.use('/contacts', contacts);
app.use('/index', index);
const port = 3000
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})