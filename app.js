const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const ejs = require("ejs")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const session = require("express-session")
const https = require("https")
const { Double } = require("mongodb")
const router = express.Router();

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static("public"))
//---------------------Connect to Database-----------------------
mongoose.connect('mongodb://127.0.0.1:27017/nft_star_db')
mongoose.connection.once('open', function(){
    console.log("Connected to MongoDB")
})
//---------------------Express Session---------------------------
app.use(session({
    secret: 'darmenqyzy',
    resave: false,
    saveUninitialized: true
  }))
//---------------------Passport----------------------------------
app.use(passport.initialize())
app.use(passport.session())
//---------------------Check Roles-------------------------------
const isUser = function(req, res, next){
  if (req.isAuthenticated()) {
      next();
  } else {
      req.flash('error', 'You shoud be logged in');
      res.redirect('/')
  }
}
const isAdmin = function(req, res, next){
  if (req.isAuthenticated() && req.user.role == "admin") {
      next()
  } else {
      res.redirect('/')
  }
}
//---------------------Error Page------------------------------------
app.get('/error', (req, res) => {
  res.render('error', { 
    message: 'Unauthorized' 
  });
});
//---------------------User Schema-------------------------------
const userSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  surname:{
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  role: {
    type: String
  },
  avatar: {
      type: String
  },
  date: {
    type: String
  },
  balance: {
    type: Number
  }
})
userSchema.plugin(passportLocalMongoose)
const User = mongoose.model("User", userSchema)

//---------------------Passport User-----------------------------
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//---------------------Register----------------------------------
app.route("/register")
.get(function(req, res){
  res.render("register")
})
.post(function(req, res) {
  var date = new Date().toLocaleString()
  User.register({
    name: req.body.name,
    username: req.body.username,
    surname: req.body.surname,
    role: "user",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/OOjs_UI_icon_userAvatar-constructive.svg/1200px-OOjs_UI_icon_userAvatar-constructive.svg.png",
    date: date,
    balance: 0
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/")
      })
      }
  })
}) 
//---------------------Login-------------------------------------
app.route("/login")
.get(function(req, res) {
  res.render("login")
})
.post(function(req, res) {
  var date = new Date().toLocaleString()
  const user = new User({
      username: req.body.username,
      password: req.body.password,
      date: date
  })

  req.login(user, function(err) {
      if (err) {
        res.redirect("/login")
        console.log(err)
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/")
        })
      }
  })
})
//---------------------Logout------------------------------------
app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { 
          return next(err); 
        }
        res.redirect('/')
      })
  })
app.route('/')
  .get(async function(req, res) {
    try {
      const users = await User.find().exec(); 
      res.render("main", {
        req: req,
        users: users
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  })
  .post(function(req, res) {
    res.render("main", {
      req: req
    });
  });

app.get("/profile", (req, res)=>{
        res.render('profile', {
          req: req
        })
});

//---------------------Server------------------------------------
let port = 3000
app.listen(port, function(){
    console.log('NFT Star is started at port ' + port)
})