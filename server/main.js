var io = require('socket.io'),
	util = require('util'),
	input = require('./input.js'),
	graphics = require('./graphics.js'),
	Player = require('./player.js');
	graphics = graphics();

var main = function(server) {
	var remotePlayers = [],
		MYGAME = {},
		interval = null;

	io = io.listen(server);

	function init(){
		io.configure(function() {
			io.set("transports", ["websocket"]);
			io.set("log level", 2);
		});
		setEventHandlers();
		run();
	}

	function setEventHandlers(){
		io.sockets.on('connection', onSocketConnection);
	}

	function run() {
		MYGAME.lastTimeStamp = Date.now();
		interval = setInterval(gameLoop, 1000/60);
	}

	function gameLoop(time) {
		var currentTime = Date.now();
		MYGAME.elapsedTime = currentTime - MYGAME.lastTimeStamp;
		MYGAME.lastTimeStamp = currentTime;
		
		for(var i = 0; i < remotePlayers.length; ++i){
			remotePlayers[i].update(MYGAME.elapsedTime);
		}

		MovePlayers();
	}

	function onSocketConnection(client) {
		util.log("New player has connected: "+client.id);
		client.on("disconnect", onClientDisconnect);
		client.on("new player", onNewPlayer);
		client.on("key press", onKeyPress);
		client.on("key release", onKeyRelease);
	}

	function onClientDisconnect() {
		util.log("Player has disconnected: "+this.id);

		var removePlayer = playerById(this.id);

		if (!removePlayer) {
			util.log("Player not found: "+this.id);
			return;
		}

		remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
		this.broadcast.emit("remove player", {id: this.id});
	}

	function onNewPlayer(data) {
		var newPlayer = graphics.Texture( {
				center : { x : 100, y : 100 },
				width : 100, height : 100,
				rotation : 0,
				moveRate : 100,			// pixels per second
				rotateRate : 3.14159	// Radians per second
			});

		newPlayer.id = this.id;
		this.emit("new response", {id : this.id});
		//register the handler
		newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, newPlayer.forwardThruster);
		newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, newPlayer.rotateLeft);
		newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, newPlayer.rotateRight);
		this.broadcast.emit("new player",
		{
			id: newPlayer.id,
			x: newPlayer.getX(),
			y: newPlayer.getY(),
			rot: newPlayer.getRot()
		});
		
		var i, existingPlayer;
		for (i = 0; i < remotePlayers.length; ++i){
			existingPlayer = remotePlayers[i];
			this.emit("new player",
			{
				id: existingPlayer.id,
				x: existingPlayer.x,
				y: existingPlayer.y,
				rot: existingPlayer.rot
			});
		}
		remotePlayers.push(newPlayer);
	}

	function onKeyPress(data){
		var movePlayer = playerById(this.id);
		if (!movePlayer) {
			util.log("Player not found: "+this.id);
			return;
		}
		movePlayer.myKeyboard.keyPress(data.key);
	}

	function onKeyRelease(data){
		var movePlayer = playerById(this.id);
		if (!movePlayer) {
			util.log("Player not found: "+this.id);
			return;
		}
		movePlayer.myKeyboard.keyRelease(data.key);
	}

	function MovePlayers() {
		var data = {
			array : []
		};

		for(var i = 0; i < remotePlayers.length; ++i){
			data.array.push({
				id  : remotePlayers[i].id,
				x   : remotePlayers[i].getX(),
				y   : remotePlayers[i].getY(),
				rot : remotePlayers[i].getRot()
			});
		}
		io.sockets.emit("move player", data);
	}

	function playerById(id) {
		var i;
		for (i = 0; i < remotePlayers.length; i++) {
			if (remotePlayers[i].id == id)
				return remotePlayers[i];
		}

		return false;
	}
	
	return {
		init : init
	};
};

module.exports = main;
