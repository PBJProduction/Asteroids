var express = require('express'),
	http = require('http'),
	path = require('path'),
	io = require('socket.io'),
	util = require('util'),
	Player = require('./server/player');
	players = [];

var app = express();

//Used this as a basis for sending/recieving data
//https://github.com/robhawkes/mozilla-festival/blob/master/game.js
function init(){
	io = io.listen(server);
	io.configure(function() {
		io.set("transports", ["websocket"]);
		io.set("log level", 2);
	});
	setEventHandlers();
}

function setEventHandlers(){
	io.sockets.on('connection', onSocketConnection);
}

function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("move player", onMovePlayer);
}

function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	}

	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit("remove player", {id: this.id});
}

//rework for server
function onNewPlayer(data) {
	var newPlayer = Player.Player(data.x, data.y, data.rot);
	newPlayer.id = this.id;
	this.broadcast.emit("new player",
	{
		id: newPlayer.id,
		x: newPlayer.x,
		y: newPlayer.y,
		rot: newPlayer.rot
	});
	
	var i, existingPlayer;
	for (i = 0; i < players.length; ++i){
		existingPlayer = players[i];
		this.emit("new player",
		{
			id: existingPlayer.id,
			x: existingPlayer.x,
			y: existingPlayer.y,
			rot: existingPlayer.rot
		});
	}
	players.push(newPlayer);

}

function onMovePlayer(data) {
	var movePlayer = playerById(this.id);

	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	}

	movePlayer.x = data.x;
	movePlayer.y = data.y;
	movePlayer.rot = data.rot;

	this.broadcast.emit("move player",
	{
		id: movePlayer.id,
		x: movePlayer.x,
		y: movePlayer.y,
		rot: movePlayer.rot
	});
}

function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	}
	return false;
}


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

init();