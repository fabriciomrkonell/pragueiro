'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
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

app.get('/logout', function(req, res){
  res.redirect('/login');
});

module.exports = app;