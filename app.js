const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const ejs = require("ejs")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const https = require("https")
const router = express.Router();

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static("public"))

app.route('/')
.get(function(req, res){
      res.render("main", {
          req: req,

      })        
})

app.route('/login')
.get(function(req, res){
      res.render("login", {
          req: req,

      })        
})

app.route('/register')
.get(function(req, res){
      res.render("register", {
          req: req,

      })        
})

//---------------------Server------------------------------------
let port = 2000
app.listen(port, function(){
    console.log('NFT Star is started at port ' + port)
})