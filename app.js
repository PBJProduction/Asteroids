var express = require('express'),
	http = require('http'),
	path = require('path'),
	main = require('./server/main.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('asteroids'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'client')));


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var start = main(server);
start.init();