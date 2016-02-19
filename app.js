'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    firebase = require('./config/firebase'),
    app = express();

app.use(express.static(path.join(__dirname, '/')));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res, next) {
  res.sendfile(__dirname + '/views/index.html');
});

app.get('/login', function(req, res){
  res.sendfile(__dirname + '/views/login.html');
});

app.post('/singup', function(req, res){
	firebase.child("usuario").on("value", function(snapshot) {
	  console.log(snapshot.val());  // Alerts "San Francisco"
	});
});

app.get('/singup', function(req, res){
  res.sendfile(__dirname + '/views/singup.html');
});

firebase.child("usuario").equalTo('996513bd-1a1a-430d-ba8d-fbe343eac402').on("value", function(snapshot) {
	  console.log(snapshot.key());  // Alerts "San Francisco"
	});

app.get('/logout', function(req, res){
  res.redirect('/login');
});

module.exports = app;