angular.module('asteroids').controller('gameController', function($scope) {
	var init = (function() {

		var input = MYGAME.input(),
			graphics = MYGAME.graphics(),
			mouseCapture = false,
			myMouse = input.Mouse(),
			myKeyboard = input.Keyboard(),
			myAutomatic = input.Auto(),
			myTouch = input.Touch(),
			cancelNextRequest = false,
			localPlayer = null,
			remotePlayers = [],
			socket = io.connect();
		
		function initialize() {
			console.log('game initializing...');
			var img = new Image();
			img.src = "../images/USU.png";
			localPlayer = graphics.Texture( {
				image : img,
				center : { x : 100, y : 100 },
				width : 100, height : 100,
				rotation : 0,
				moveRate : 200,			// pixels per second
				rotateRate : 3.14159	// Radians per second
			});
			myKeyboard.registerCommand(KeyEvent.DOM_VK_W, localPlayer.forwardThruster);
			myKeyboard.registerCommand(KeyEvent.DOM_VK_A, localPlayer.rotateLeft);
			myKeyboard.registerCommand(KeyEvent.DOM_VK_D, localPlayer.rotateRight);
			socket.on("connect", onSocketConnected);
			socket.on("disconnect", onSocketDisconnect);
			socket.on("new player", onNewPlayer);
			socket.on("move player", onMovePlayer);
			socket.on("remove player", onRemovePlayer);
		}
		
		function gameLoop(time) {
			var currentTime = Date.now();
			MYGAME.elapsedTime = currentTime - MYGAME.lastTimeStamp;
			MYGAME.lastTimeStamp = currentTime;
			
			myKeyboard.update(MYGAME.elapsedTime);
			if(localPlayer.update()){
				socket.emit("move player",
				{
					x  : localPlayer.getX(),
					y  : localPlayer.getY(),
					rot: localPlayer.getRot()
				});
			}
			myMouse.update(MYGAME.elapsedTime);
			myAutomatic.update(MYGAME.elapsedTime);
			myTouch.update(MYGAME.elapsedTime);

			graphics.clear();

			localPlayer.draw();
			for (i = 0; i < remotePlayers.length; ++i) {
				remotePlayers[i].draw();
			}
			if (!cancelNextRequest) {
				requestAnimationFrame(gameLoop);
			}
		}

		function run() {
			MYGAME.lastTimeStamp = Date.now();
			requestAnimationFrame(gameLoop);
		}

		function onSocketConnected() {
			console.log("Connected to socket server");
			socket.emit("new player",
			{
				x   : localPlayer.getX(),
				y   : localPlayer.getY(),
				rot : localPlayer.getRot()
			});
		}

		function onSocketDisconnect() {
			console.log("Disconnected from socket server");
		}

		function onNewPlayer(data) {
			console.log("New player connected: "+data.id);
			var img = new Image();
			img.src = "../images/USU.png";
			var newPlayer = graphics.Texture( {
				image : img,
				center : { x : data.x, y : data.y },
				width : 100, height : 100,
				rotation : data.rot,
				moveRate : 200,			// pixels per second
				rotateRate : 3.14159	// Radians per second
			});
			newPlayer.id = data.id;
			remotePlayers.push(newPlayer);
		}

		function onMovePlayer(data) {
			var movePlayer = playerById(data.id);

			if (!movePlayer) {
				console.log("Player not found: "+data.id);
				return;
			}
			movePlayer.setX(data.x);
			movePlayer.setY(data.y);
			movePlayer.setRot(data.rot);
		}

		function onRemovePlayer(data) {
			var removePlayer = playerById(data.id);

			if (!removePlayer) {
				console.log("Player not found: "+data.id);
				return;
			}
			remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
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
			initialize : initialize,
			run : run
		};
	}());

	init.initialize();
	init.run();
});