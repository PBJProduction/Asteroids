var io = require('socket.io'),
    util = require('util'),
    input = require('./input.js'),
    graphics = require('./graphics.js'),
    Player = require('./player.js'),
    Random = require('./random.js'),
    graphics = graphics();

var main = function(server) {
    var remotePlayers = [],
        MYGAME = {},
        shootSpeed = 1000,
        interval = null,
        asteroids = [];

    io = io.listen(server);

    function init(){
        io.configure(function() {
            io.enable('browser client minification');
            io.set("log level", 1);
        });
        setEventHandlers();
        run();
    }

    function setEventHandlers(){
        io.sockets.on('connection', onSocketConnection);
    }

    function run() {
        MYGAME.lastTimeStamp = Date.now();
        interval = setInterval(gameLoop, 1000/30);
    }

    function gameLoop(time) {
        if(remotePlayers.length === 0)
            return;
        if(asteroids.length === 0)
            generateAsteroids({number: Random.nextGaussian(3,2), type: 1});
        var currentTime = Date.now();
        MYGAME.elapsedTime = currentTime - MYGAME.lastTimeStamp;
        MYGAME.lastTimeStamp = currentTime;
        
        var sound = {s : sendSound};
        // console.log(sound);
        
        for(var i = 0; i < remotePlayers.length; ++i){
            remotePlayers[i].update(MYGAME.elapsedTime, sound);
        }
        for(var index in asteroids) {
            asteroids[index].update(MYGAME.elapsedTime, sound);
        }

        var collidedShipAsteroids = getCollisions(remotePlayers, asteroids);
        for(var index in collidedShipAsteroids) {
            handleShipAsteroidCollision(collidedShipAsteroids[index].first, collidedShipAsteroids[index].second);
        }

        MovePlayers();
        MoveAsteroids();
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
                center : { x : data.x, y : data.y },
                width : 100, height : 100,
                rotation : data.rot,
                moveRate : 100,         // pixels per second
                rotateRate : 3.14159    // Radians per second
            });

        newPlayer.id = this.id;
        this.emit("new response", {id : this.id});
        //register the handler
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, newPlayer.forwardThruster);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, newPlayer.rotateLeft);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, newPlayer.rotateRight);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_SPACE, newPlayer.shoot);
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
            var obj = {
                id  : remotePlayers[i].id,
                x   : remotePlayers[i].getX(),
                y   : remotePlayers[i].getY(),
                rot : remotePlayers[i].getRot()
            };
            var bullets = [];
            for(var j = 0; j < remotePlayers[i].bullets.length; ++j){
                var bullet = {
                    x: remotePlayers[i].bullets[j].getX(),
                    y: remotePlayers[i].bullets[j].getY(),
                    rot : remotePlayers[i].bullets[j].getRot()
                };
                bullets.push(bullet);
            }
            obj.bullets = bullets;
            data.array.push(obj);
        }
        io.sockets.emit("move player", data);
    }

    function MoveAsteroids() {
        var data =  {
            array : []
        };

        for(var index in asteroids) {
            var asteroid = {
                x : asteroids[index].getX(),
                y : asteroids[index].getY(),
                rot : asteroids[index].getRot()
            };
            data.array.push(asteroid);
        }
        io.sockets.emit("move asteroids", data);
    }
    
    function playerById(id) {
        var i;
        for (i = 0; i < remotePlayers.length; i++) {
            if (remotePlayers[i].id == id)
                return remotePlayers[i];
        }

        return false;
    }

    function getCollisions(data1, data2) {
        var collision = [];
        for (var firstLoc in data1) {
            for (var secondLoc in data2) {
                if(data1[firstLoc] !== data2[secondLoc]) {
                    if(testCollision(data1[firstLoc], data2[secondLoc])) {
                        collision.push({
                            first: data1[firstLoc],
                            second: data2[secondLoc]
                        });
                    }
                }
            }
        }
        return collision;
    }

    function testCollision(object1, object2) {
        var xVal = object1.getX() - object2.getX();
        var yVal = object1.getY() - object2.getY();
        var distance = Math.sqrt(xVal * xVal + yVal * yVal);
        return (distance < (object1.getRadius() + object2.getRadius()));
    }

    function generateAsteroids(spec) {
        for(var i = 0; i < spec.number; ++i) {
            var tempX = Random.nextRange(-2,2);
            var tempY = Random.nextRange(-2,2);
            if(tempY === 0 && tempX === 0)
                tempY = 1;
            asteroids.push(
                graphics.Texture( {
                    center : { x : Random.nextRange(0,1280), y : Random.nextRange(0,700) },
                    width : 100, height : 100,
                    rotation : 0,
                    moveRate : 200,         // pixels per second
                    rotateRate : 3.14159,   // Radians per second
                    asteroid : true,
                    alive : 0,
                    thrust : 2,
                    dx : tempX,
                    dy : tempY
                })
            );
            asteroids[i].setSize(3);
        }
    }

    function handleShipAsteroidCollision(ship, asteroid) {
        // breakAsteroid(asteroid);
    }

    function breakAsteroid(asteroid) {
        asteroid.setSize(asteroid.getSize()-1)
        if(asteroid.getSize() == 0) {
            for(var index in asteroids) {
                if(asteroids[index] === asteroid) {
                    asteroids.splice(index, 1);
                }
            }
        } else {
            var toAdd = graphics.Texture( {
                    center : { x : Random.nextRange(0,1280), y : Random.nextRange(0,700) },
                    width : 100, height : 100,
                    rotation : 0,
                    moveRate : 200,         // pixels per second
                    rotateRate : 3.14159,   // Radians per second
                    asteroid : true,
                    alive : 0,
                    thrust : 2,
                    dx : tempX,
                    dy : tempY
                });
            toAdd.setSize = asteroid.getSize();
            asteroids.push(toAdd);
        }
    }

    // function callSound() {
    //     sendSound();
    // }
    
    function sendSound() {
        io.sockets.emit("play pew");
    }

    return {
        init : init,
        asteroids : asteroids,
        sendSound : sendSound
    };
};

module.exports = main;
