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
            asteroidExplodePic = new Image(),
            shipExplodePic = new Image(),
            ufoExplodePic = new Image(),
			socket = io.connect(),
			pewIndex = 0,
			pewpewArr = [],
            particlesArr = [],
            alive,
			backgroundSound = new Audio("../audio/background.mp3");

			shipPic.src = "../images/ship.png";
			bulletPic.src = "../images/bullet.png";
			asteroidPic.src = "../images/asteroid.png";
            asteroidExplodePic.src = "../images/asteroid.png";
            shipExplodePic.src = "../images/explosion.png";
		
		function initialize() {
			console.log('game initializing...');

            for (var i = 0; i < 50; ++i) {
                pewpewArr.push(new Audio("../audio/pewpew.wav"));
            }

			localPlayer = graphics.Texture( {
				image : shipPic,
				center : { x : 640, y : 350 },
				width : 100, height : 100,
				rotation : 0,
				bullets : []
			});

			alive = true;

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
            socket.on("place particles", onPlaceParticles);
			socket.on("play pew", playPew);
			socket.on("toggle player", togglePlayer);
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
			if (pewIndex > 50) pewIndex = 0;
			pewpewArr[pewIndex++].play();
		}

		function release(code) {
			if (alive) {
				var obj = {
					id : localPlayer.id,
					key : code
				};
				socket.emit("key release", obj);
			}		
		}

		function press(code) {
			if (alive) {
				var obj = {
					id : localPlayer.id,
					key : code
				};			
				socket.emit("key press", obj);
			}
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
            for(var i = 0; i < particlesArr.length; ++i){
                particlesArr[i].update(MYGAME.elapsedTime);
                particlesArr[i].render();
                particlesArr[i].create();
                if(particlesArr[i].remove){
                    particlesArr.splice(i,1);
                    i--;
                }
            }

			for (var i = remotePlayers.length-1; i >= 0; --i) {
				var bullets = remotePlayers[i].getBullets();
				for(var j = 0; j < bullets.length; ++j){
					bullets[j].draw();
				}
				if (remotePlayers[i].isEnabled()) {
					remotePlayers[i].draw();    
				}
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
                if(data.array[i].thrusting){
                    var deg = (Math.abs(data.array[i].rot % (2*Math.PI) * (180/Math.PI) - 360)+90) % 360;
                    var rad = deg * (Math.PI/180);

                    particlesArr.push( particleSystem( {
                                            direction : {x : -Math.cos(rad), y : Math.sin(rad)},
                                            image : shipExplodePic,
                                            size:{mean:20,stdev:5},
                                            center: {x: data.array[i].x-Math.cos(rad)*40, y: data.array[i].y +Math.sin(rad)*40},
                                            speed: {mean: 40, stdev: .05},
                                            lifetime: {mean: .5, stdev: .05}
                                        },
                                        graphics
                                    ));
                }
			}
		}

		function onRemovePlayer(data) {
			var removePlayer = playerById(data.id);

			if (localPlayer.id == data.id) {
				alive = false;
			}

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
							width : data.array[index].radius * 2,
							height : data.array[index].radius * 2,
							rotation : data.array[index].rot
						})
					);
				}
			} else {
				asteroids = [];
				console.log("No Asteroids");
			}
		}

        function onPlaceParticles(data){
            var image;
            if(data.type === "ATR")
                image = asteroidExplodePic;
            else if(data.type === "SHP")
                image = shipExplodePic;
            else
                image = ufoExplodePic;

            particlesArr.push( particleSystem( {
                                    asteroid : true,
                                    image : image,
                                    size:{mean:20,stdev:5},
                                    center: {x: data.x, y: data.y},
                                    speed: {mean: 20, stdev: 5},
                                    lifetime: {mean: 1, stdev: 0.25}
                                },
                                graphics
                            ));
        }

        function togglePlayer(data) {
        	var ship = playerById(data.id);

        	if(ship.isEnabled()) {
        	    ship.disable();
        	} else {
        	    ship.enable();
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

