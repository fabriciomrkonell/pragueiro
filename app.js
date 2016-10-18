'use strict';

var express = require('express'),
path = require('path'),
bodyParser = require('body-parser'),
firebase = require('./config/firebase'),
fs = require('fs'),
app = express();



app.use(express.static(path.join(__dirname, '/')));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.teste='teste root';
app.get('/arquivos', function(req, res, next) {

	fs.readdir(__dirname + '/arquivos', function(err, data){
		if (err) {
			res.send(err);
		}else{
			var html = '<ul>';
			data.forEach(function(item){
				html = html + '<li><a href="' + item + '">' + item + '</a></li>'
			});
			var html = html + '</ul>'
			res.send(html);
		}
	});
});

app.get('/arquivos/:file', function(req, res, next) {
	res.sendfile(__dirname + '/arquivos/' + req.param('file'));
});

app.get('/', function(req, res, next) {
	res.sendfile(__dirname + '/views/index.html');
});

app.get('/app', function(req, res, next) {
	res.sendfile(__dirname + '/views/app.html');
});

app.get('/table', function(req, res, next) {
	res.sendfile(__dirname + '/views/table.html');
});

app.get('/login', function(req, res){
	res.sendfile(__dirname + '/views/login.html');
});

app.get('/singup', function(req, res){
	res.sendfile(__dirname + '/views/singup.html');
});

app.get('/logout', function(req, res){
	res.redirect('/login');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
	res.sendfile(__dirname + '/views/erro.html');
});



module.exports = app;