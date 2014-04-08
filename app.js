var express = require('express'),
	http = require('http'),
	path = require('path'),
	main = require('./server/main.js'),
	fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.get('/v1/high-scores', function(req, res) {
	var text = "";
	fs.readFile('./scores/score.txt', 'utf8', function(err, data) {
        if (err) {
            // return;
        } else {
			res.send(
				data
		    );
        }
    });
    // console.log(text)
	
});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('asteroids'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'client')));

var myServer = http.createServer()

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var start = main(server);
start.init();