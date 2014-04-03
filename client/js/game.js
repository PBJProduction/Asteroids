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
			asteroids = [],
			forwardpressed = false,
			leftpressed = false,
			rightpressed = false,
			bulletPic = new Image(),
			shipPic = new Image(),
			asteroidPic = new Image(),
			socket = io.connect(),
			pewpew = new Audio("../audio/pewpew.wav"),
			backgroundSound = new Audio("../audio/background.mp3");

			shipPic.src = "../images/ship.png";
			bulletPic.src = "../images/bullet.png";
			asteroidPic.src = "../images/asteroid.png";
		
		function initialize() {
			console.log('game initializing...');
			localPlayer = graphics.Texture( {
				image : shipPic,
				center : { x : 640, y : 350 },
				width : 100, height : 100,
				rotation : 0,
				bullets : []
			});			

			backgroundSound.addEventListener('ended', function() {
				this.currentTime = 0;
				this.play();
			});			

			backgroundSound.play();

			socket.on("connect", onSocketConnected);
			socket.on("disconnect", onSocketDisconnect);
			socket.on("new player", onNewPlayer);
			socket.on("move player", onMovePlayer);
			socket.on("remove player", onRemovePlayer);
			socket.on("new response", onSocketId);
			socket.on("move asteroids", onMoveAsteroids);
			socket.on("play pew", playPew);
		}
		
		$(window).keyup(function(e){
			if (e.keyCode === KeyEvent.DOM_VK_W || e.keyCode === KeyEvent.DOM_VK_A || e.keyCode === KeyEvent.DOM_VK_D || e.keyCode === KeyEvent.DOM_VK_SPACE) {
				if(e.keyCode === KeyEvent.DOM_VK_W){
					forwardpressed = false;
				}
				else if(e.keyCode === KeyEvent.DOM_VK_A){
					leftpressed = false;
				}
				else if(e.keyCode === KeyEvent.DOM_VK_D){
					rightpressed = false;
				}
				else if(e.keyCode === KeyEvent.DOM_VK_SPACE){
					shootpressed = false;					
				}
				release(e.keyCode);
			}
		});

		function playPew() {
			pewpew.play();
		}

		function release(code) {
			var obj = {
				id : localPlayer.id,
				key : code
			};
			socket.emit("key release", obj);
		}

		function press(code) {
			var obj = {
				id : localPlayer.id,
				key : code
			};			
			socket.emit("key press", obj)
		}

		$(window).keydown(function(e){
			if (e.keyCode === KeyEvent.DOM_VK_W || e.keyCode === KeyEvent.DOM_VK_A || e.keyCode === KeyEvent.DOM_VK_D || e.keyCode === KeyEvent.DOM_VK_SPACE) {
				if(e.keyCode === KeyEvent.DOM_VK_W && !forwardpressed){
					forwardpressed = true;					
				}
				else if(e.keyCode === KeyEvent.DOM_VK_A && !leftpressed){
					leftpressed = true;					
				}
				else if(e.keyCode === KeyEvent.DOM_VK_D && !rightpressed){
					rightpressed = true;					
				}
				else if(e.keyCode === KeyEvent.DOM_VK_SPACE){
					shootpressed = true;					
				}

				press(e.keyCode);
			}
		});

		function gameLoop(time) {
			var currentTime = Date.now();
			MYGAME.elapsedTime = currentTime - MYGAME.lastTimeStamp;
			MYGAME.lastTimeStamp = currentTime;
			myKeyboard.update(MYGAME.elapsedTime);
			graphics.clear();
			for (var i = remotePlayers.length-1; i >= 0; --i) {
				var bullets = remotePlayers[i].getBullets();
				for(var j = 0; j < bullets.length; ++j){
					bullets[j].draw();
				}
				remotePlayers[i].draw();
			}
			for (var index in asteroids) {
				asteroids[index].draw();
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

		function onSocketId(data){
			localPlayer.id = data.id;
			remotePlayers.push(localPlayer);
			console.log("id: " + data.id);
		}

		function onSocketDisconnect() {
			console.log("Disconnected from socket server");
		}

		function onNewPlayer(data) {
			console.log("New player connected: "+data.id);
			var newPlayer = graphics.Texture( {
				image : shipPic,
				center : { x : data.x, y : data.y },
				width : 100, height : 100,
				rotation : data.rot,
				bullets : []
			});
			newPlayer.id = data.id;
			remotePlayers.push(newPlayer);
		}

		function onMovePlayer(data) {
			for(var i = 0; i < remotePlayers.length; ++i){
				var player = playerById(data.array[i].id);
				if (!player) {
					console.log("Player not found: "+data.id);
					continue;
				}
				player.setX(data.array[i].x);
				player.setY(data.array[i].y);
				player.setRot(data.array[i].rot);
				var bullets = [];
				for(var j = 0; j < data.array[i].bullets.length; ++j){
					var bullet = graphics.Texture( {
						image : bulletPic,
						center : { x : data.array[i].bullets[j].x, y : data.array[i].bullets[j].y },
						width : 20, height : 20,
						rotation : data.array[i].bullets[j].rot
					});
					bullets.push(bullet);
				}
				player.setBullets(bullets);
			}
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

		function onMoveAsteroids(data) {
			if(data.array !== undefined) {
				asteroids = [];
				for(var index in data.array) {
					asteroids.push(
						graphics.Texture({
							image : asteroidPic,
							center : { x : data.array[index].x, y : data.array[index].y },
							width : 100, height : 100,
							rotation : data.array[index].rot
						})
					);
				}
			} else {
				asteroids = [];
				console.log("No Asteroids");
			}
		}
		return {
			initialize : initialize,
			run : run
		};
	}());

	init.initialize();
	init.run();
});