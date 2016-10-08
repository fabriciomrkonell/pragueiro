'use strict';

var express = require('express'),
path = require('path'),
bodyParser = require('body-parser'),
firebase = require('./config/firebase'),
fs = require('fs'),
app = express();

var tj = require('togeojson'),
fs = require('fs'),
DOMParser = require('xmldom').DOMParser,
multer = require('multer');	

//var greetings = require("/app/controllers/greetings.js");

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
	//greetings.setCoordenadas(req.param('file'));
	res.sendfile(__dirname + '/arquivos/' + req.param('file'));
	//console.log('testeeee: ' + greetings.sayHelloInEnglish());
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

app.post('/singup', function(req, res){
	firebase.child("usuario").on("value", function(snapshot) {
	  console.log(snapshot.val());  // Alerts "San Francisco"
	});
});

app.get('/singup', function(req, res){
	res.sendfile(__dirname + '/views/singup.html');
});

app.get('/logout', function(req, res){
	res.redirect('/login');
});

var upload = multer({ dest: '/tmp/'});

app.get('/teste', function(req, res, next) {
	res.render('teste', { title: 'Express' });
});
app.post('/testeform', upload.single('file'), function(req, res) {
	var kml = new DOMParser().parseFromString(fs.readFileSync(req.file.path, 'utf8'));
	var converted = tj.kml(kml);
	console.log('teste: ' + converted.features[0].geometry.coordinates);

	//next();
	//console.log('testeeee: ' + greetings.setCoordenadas('456'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
	res.sendfile(__dirname + '/views/erro.html');
});



module.exports = app;