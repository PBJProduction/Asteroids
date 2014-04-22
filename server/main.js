var io = require('socket.io'),
    util = require('util'),
    input = require('./input.js'),
    graphics = require('./graphics.js'),
    Random = require('./random.js'),
    scores = require('./score.js'),
    graphics = graphics();

var main = function (server) {
    var remotePlayers = [],
        ufos = [],
        MYGAME = {},
        shootSpeed = 1000,
        interval = null,
        AIConnected = false,
        ufoTime = 0,
        running = false,
        asteroids = [],
        removedPlayers = [];

    io = io.listen(server);

    function init () {
        scores.init();
        io.configure(function () {
            io.enable('browser client minification');
            io.set("log level", 1);
        });
        setEventHandlers();
    }

    function setEventHandlers () {
        io.sockets.on('connection', onSocketConnection);
    }

    function run () {
        removedPlayers = [];
        MYGAME.lastTimeStamp = Date.now();
        interval = setInterval(gameLoop, 1000/30);
    }


    function genAI () {
        var newPlayer = graphics.Texture( {
                center : { x : 640, y : 350 },
                width : 50, height : 50,
                rotation : 0,
                moveRate : 200,         // pixels per second
                rotateRate : 1.2 * 3.14159    // Radians per second
            });

        newPlayer.id = 'ai';
        newPlayer.setLives(3);
        
        //register the handler
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, newPlayer.forwardThruster);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, newPlayer.rotateLeft);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, newPlayer.rotateRight);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_SPACE, newPlayer.shoot);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_S, newPlayer.warp);
        
        io.sockets.emit("new player",
        {
            id: newPlayer.id,
            x: newPlayer.getX(),
            y: newPlayer.getY(),
            rot: newPlayer.getRot()
        });
        remotePlayers.push(newPlayer);
    }

    function sendPlayers () {
        var clients = io.sockets.clients();
        console.log(clients.length);

        for (var client in clients) {
            var newPlayer = graphics.Texture( {
                    center : { x : 640, y : 350 },
                    width : 50, height : 50,
                    rotation : 0,
                    moveRate : 200,         // pixels per second
                    rotateRate : 1.2 * 3.14159    // Radians per second
                });
            
            newPlayer.id = client.id;
            newPlayer.setLives(3);
            

            //register the handler
            newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, newPlayer.forwardThruster);
            newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, newPlayer.rotateLeft);
            newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, newPlayer.rotateRight);
            newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_SPACE, newPlayer.shoot);
            newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_S, newPlayer.warp);

            io.sockets.emit("new player",
            {
                id: newPlayer.id,
                x: newPlayer.getX(),
                y: newPlayer.getY(),
                rot: newPlayer.getRot()
            });
            remotePlayers.push(newPlayer);
        }
    }

    function onStartGame () {
        if (false === running) {
            running = true;       
            run();
        }
    }

    function genUFO () {
        var newPlayer = graphics.Texture( {
                center : { x : 0, y : Random.nextRange(0,700) },
                width : 100, height : 100,
                rotation : 0,
                moveRate : 200,         // pixels per second
                rotateRate : 1.2 * 3.14159    // Radians per second
            });

        newPlayer.id = 'ufo';
        newPlayer.setLives(1);
        //register the handler
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, newPlayer.forwardThruster);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, newPlayer.rotateLeft);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, newPlayer.rotateRight);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_SPACE, newPlayer.shoot);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_S, newPlayer.warp);

        ufos.push(newPlayer);
    }

    function genBigUfo () {
        var newPlayer = graphics.Texture({
                center : { x : 0, y : Random.nextRange(0, 700) },
                width : 100, height : 100,
                rotation : 0,
                moveRate : 250,
                rotateRate : 1.2 * 3.14159
        });

        newPlayer.id = 'bigUfo';
        newPlayer.setLives(1);

        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, newPlayer.forwardThruster);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, newPlayer.rotateLeft);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, newPlayer.rotateRight);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_SPACE, newPlayer.shoot);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_S, newPlayer.warp);

        ufos.push(newPlayer);
    }

    function gameLoop (time) {
        if (0 === asteroids.length) {
            generateAsteroids({number: Random.nextRange(2,5), type: 1});
            
            for (var index in remotePlayers) {
                remotePlayers[index].setRounds(remotePlayers[index].getRounds() + 1);
            }
        }

        if (remotePlayers.length < 2 && AIConnected === false) {
            genAI();
            AIConnected = true;
        } else if (remotePlayers.length > 2 && AIConnected === true) {
            var removePlayer = playerById('ai');

            if (!removePlayer) {
                console.log('errors');
            } else{
                remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
                io.sockets.emit("remove player", {id: 'ai'});
                AIConnected = false;
            }
        }

        var currentTime = Date.now();
        MYGAME.elapsedTime = currentTime - MYGAME.lastTimeStamp;
        MYGAME.lastTimeStamp = currentTime;
        ufoTime += MYGAME.elapsedTime;

        var sound = {s : function () { sendSound(); }};

        if (ufoTime >= 10000 && 0 === ufos.length) {
            ufoTime = 0;

            if (1 === Random.nextRange(1, 3)) {
                genUFO();
            } else {
                genBigUfo();
            }
        }
        for (var i = 0; i < ufos.length; ++i) {
            ufos[i].update(MYGAME.elapsedTime,sound);
        }
        
        for (var i = 0; i < remotePlayers.length; ++i) {
            if (remotePlayers[i].isEnabled()) {
                remotePlayers[i].update(MYGAME.elapsedTime, sound, asteroids);
                if (remotePlayers[i].prev) {
                    warpSpeed(remotePlayers[i].prev);
                    delete remotePlayers[i].prev;
                }
            }
        }
        
        for (var index in asteroids) {
            asteroids[index].update(MYGAME.elapsedTime, sound);
        }

        var collidedShipAsteroids = getCollisions(remotePlayers, asteroids);

        for (var index in collidedShipAsteroids) {
            handleShipAsteroidCollision(collidedShipAsteroids[index].first, collidedShipAsteroids[index].second);
        }

        var collidedShipUfos = getCollisions(remotePlayers, ufos);

        for (var index in collidedShipUfos) {
            handleShipUFOCollision(collidedShipUfos[index].first, collidedShipUfos[index].second);
        }

        for (var index in remotePlayers) {
            if (remotePlayers[index].isEnabled()) {
                var collidedBullets = getCollisions(remotePlayers[index].bullets, asteroids);

                for (var bindex in collidedBullets) {
                    handleBulletAsteroidCollision(remotePlayers[index], collidedBullets[bindex].first, collidedBullets[bindex].second);
                }

                var collidedBulletsUfos = getCollisions(remotePlayers[index].bullets, ufos);

                for (var bindex in collidedBulletsUfos) {
                    handleBulletUFOCollision(remotePlayers[index], collidedBulletsUfos[bindex].first, collidedBulletsUfos[bindex].second);
                }
            }
        }

        for (var index in ufos) {
            var collidedUFOBullets = getCollisions(ufos[index].bullets, remotePlayers);

            for (var bindex in collidedUFOBullets) {
                handleBulletShipCollision(collidedUFOBullets[bindex].first, collidedUFOBullets[bindex].second);
            }
        }

        MovePlayers();
        MoveUFO();
        MoveAsteroids();
        handleEndGame();
    }

    function onSocketConnection (client) {
        util.log("New player has connected: "+client.id);
        client.on("disconnect", onClientDisconnect);
        client.on("new player", onNewPlayer);
        client.on("key press", onKeyPress);
        client.on("key release", onKeyRelease);
        client.on("start game", onStartGame);
        client.on("name", onSaveScore);
    }

    function onClientDisconnect () {
        util.log("Player has disconnected: " + this.id);

        var removePlayer = playerById(this.id);

        if (!removePlayer) {
            util.log("Player not found: " + this.id);
            return;
        }

        remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
        this.broadcast.emit("remove player", {id: this.id});
    }

    function onNewPlayer (data) {
        var newPlayer = graphics.Texture( {
                center : { x : data.x, y : data.y },
                width : 50, height : 50,
                rotation : data.rot,
                moveRate : 200,         // pixels per second
                rotateRate : 1.2 * 3.14159    // Radians per second
            });
        
        newPlayer.id = this.id;
        this.emit("new response", {id : this.id});
        newPlayer.setLives(3);
        

        //register the handler
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_W, newPlayer.forwardThruster);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_A, newPlayer.rotateLeft);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_D, newPlayer.rotateRight);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_SPACE, newPlayer.shoot);
        newPlayer.myKeyboard.registerCommand(input.KeyEvent.DOM_VK_S, newPlayer.warp);
        this.broadcast.emit("new player",
        {
            id: newPlayer.id,
            x: newPlayer.getX(),
            y: newPlayer.getY(),
            rot: newPlayer.getRot()
        });
        
        var i, existingPlayer;

        for (i = 0; i < remotePlayers.length; ++i) {
            existingPlayer = remotePlayers[i];

            this.emit("new player",
            {
                id: existingPlayer.id,
                x: existingPlayer.getX(),
                y: existingPlayer.getY(),
                rot: existingPlayer.getRot()
            });
        }

        remotePlayers.push(newPlayer);
    }

    function onKeyPress (data) {
        var movePlayer = playerById(this.id);
        if (!movePlayer) {
            util.log("Player not found: " + this.id);
            return;
        }

        movePlayer.myKeyboard.keyPress(data.key);
    }

    function onKeyRelease (data) {
        var movePlayer = playerById(this.id);
        if (!movePlayer) {
            util.log("Player not found: " + this.id);
            return;
        }

        movePlayer.myKeyboard.keyRelease(data.key);
    }

    function warpSpeed (spec) {
        sendParticles({
            x: spec.x,
            y: spec.y,
            type: "WRP",
            rotation: 0
        });
    }

    function MovePlayers () {
        var data = {
            array : []
        };

        for (var i = 0; i < remotePlayers.length; ++i) {
            if (remotePlayers[i].isEnabled()) {
                var obj = {
                    id  : remotePlayers[i].id,
                    x   : remotePlayers[i].getX(),
                    y   : remotePlayers[i].getY(),
                    rot : remotePlayers[i].getRot(),
                    thrusting: remotePlayers[i].isThrusting(),
                    direction : {
                        x : remotePlayers[i].dx,
                        y : remotePlayers[i].dy
                    },
                    lives: remotePlayers[i].getLives(),
                    score: remotePlayers[i].getScore(),
                    rounds: remotePlayers[i].getRounds()
                };

                var bullets = [];
                
                for (var j = 0; j < remotePlayers[i].bullets.length; ++j) {
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
        }
        
        io.sockets.emit("move player", data);
    }

    function MoveAsteroids () {
        var data =  {
            array : []
        };

        for (var index in asteroids) {
            var asteroid = {
                x : asteroids[index].getX(),
                y : asteroids[index].getY(),
                rot : asteroids[index].getRot(),
                size : asteroids[index].getSize(),
                radius : asteroids[index].getRadius()
            };

            data.array.push(asteroid);
        }

        io.sockets.emit("move asteroids", data);
    }

    function MoveUFO () {
            var data =  {
                array : []
            };

            for (var i in ufos) {
                var ufo = {
                    x : ufos[i].getX(),
                    y : ufos[i].getY(),
                    rot : ufos[i].getRot(),
                    id : ufos[i].id
                };

                var bullets = [];
                
                for (var j = 0; j < ufos[i].bullets.length; ++j) {
                    var bullet = {
                        x: ufos[i].bullets[j].getX(),
                        y: ufos[i].bullets[j].getY(),
                        rot : ufos[i].bullets[j].getRot()
                    };

                    bullets.push(bullet);
                }

                ufo.bullets = bullets;
                data.array.push(ufo);
            }

            io.sockets.emit("move ufo", data);        
    }
    
    function playerById (id) {
        var i;
        for (i = 0; i < remotePlayers.length; i++) {
            if (remotePlayers[i].id == id)
                return remotePlayers[i];
        }
        return false;
    }

    function getCollisions (data1, data2) {
        var collision = [];
        for (var firstLoc in data1) {
            for (var secondLoc in data2) {
                if (data1[firstLoc] !== data2[secondLoc]) {
                    if (testCollision(data1[firstLoc], data2[secondLoc])) {
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

    function testCollision (object1, object2) {
        var xVal = object1.getX() - object2.getX();
        var yVal = object1.getY() - object2.getY();
        var distance = Math.sqrt(xVal * xVal + yVal * yVal);
        return (distance < (object1.getRadius() + object2.getRadius()));
    }

    function generateAsteroids (spec) {
        for (var i = 0; i < spec.number; ++i) {
            asteroids.push(
                graphics.Texture( {
                    center : { x : Random.nextRange(0,1280), y : Random.nextRange(0,700) },
                    width : 100, height : 100,
                    rotation : 0,
                    moveRate : 200,         // pixels per second
                    rotateRate : 1.2 * 3.14159,   // Radians per second
                    asteroid : true,
                    alive : 0,
                    thrust : 2,
                    dx : makeDirection(),
                    dy : makeDirection()
                })
            );

            asteroids[i].setSize(3);
        }
    }

    function handleShipAsteroidCollision (ship, asteroid) {
        updateScore(ship, asteroid);
        breakAsteroid(asteroid);
        lowerLives(ship);
    }

    function handleBulletAsteroidCollision (ship, bullet, asteroid) {
        updateScore(ship, asteroid);
        bullet.kill = true;
        breakAsteroid(asteroid);
    }

    function handleShipUFOCollision (ship, ufo) {
        updateScoreUFO(ship, ufo);
        breakUFO(ufo);
        lowerLives(ship);
    }

    function handleBulletUFOCollision (ship, bullet, ufo) {
        updateScoreUFO(ship, ufo);
        bullet.kill = true;
        breakUFO(ufo);
    }

    function handleBulletShipCollision (bullet, ship) {
        bullet.kill = true;
        lowerLives(ship);
    }

    function updateScoreUFO (ship, ufo) {
        score = 200;

        if ("bigUfo" === ufo.id) {
            score = 1000;
        }

        ship.setScore(ship.getScore() + score);

        if (0 === ship.getScore() % 10000) {
            ship.setLives(ship.getLives() + 1);
        }
    }

    function updateScore (ship, asteroid) {
        score = 1;

        if (3 === asteroid.getSize()) {
            score = 20;
        } else if (asteroid.getSize()) {
            score = 50;
        } else if (asteroid.getSize()) {
            score = 100;
        } else {
            score = 0;
        }

        ship.setScore(ship.getScore() + score);

        if (0 === ship.getScore() % 10000) {
            ship.setLives(ship.getLives() + 1);
        }
    }

    function breakAsteroid (asteroid) {
        sendParticles({
            x: asteroid.getX(),
            y: asteroid.getY(),
            type: "ATR",
            rotation: asteroid.getRot()
        });

        asteroid.setSize(asteroid.getSize()-1);
        
        if (asteroid.getSize() <= 0) {
            for (var index in asteroids) {
                if (asteroids[index] === asteroid) {
                    asteroids.splice(index, 1);
                }
            }
        } else {
            if (2 === asteroid.getSize()) {
                makeNewAsteroids(2, asteroid);
            } else if (1 === asteroid.getSize()) {
                makeNewAsteroids(3, asteroid);
            }
            
            asteroid.setDX(makeDirection());
            asteroid.setDY(makeDirection());

            if (2 === asteroid.getSize()) {
                asteroid.setRadius(35);
            } else if (1 === asteroid.getSize()) {
                asteroid.setRadius(20);
            }
        }
    }

    function makeNewAsteroids (number, asteroid) {
        for (var i = 0; i < number; ++i) {
            var tempX = Random.nextRange(-2, 2);
            var tempY = Random.nextRange(-2, 2);
            if (0 === tempY && 0 === tempX) {
                tempY = 1;
            }

            var toAdd = graphics.Texture( {
                    center : { x : asteroid.getX(), y : asteroid.getY() },
                    width : 100, height : 100,
                    rotation : 0,
                    moveRate : 200,         // pixels per second
                    rotateRate : 1.2 * 3.14159,   // Radians per second
                    asteroid : true,
                    alive : 0,
                    thrust : 2,
                    dx : tempX,
                    dy : tempY
                });

            asteroid.setDX(makeDirection());
            asteroid.setDY(makeDirection());

            toAdd.setSize(asteroid.getSize());

            if (2 === toAdd.getSize()) {
                toAdd.setRadius(35);
            } else if (1 === toAdd.getSize()) {
                toAdd.setRadius(20);
            }

            asteroids.push(toAdd);
        }
    }

    function lowerLives (ship) {
        sendParticles({
            x: ship.getX(),
            y: ship.getY(),
            type: "SHP",
            rotation: ship.rotation
        });

        if (ship.getLives() <= 1) {
            ship_id = ship.id;
            removedPlayers.push({
                id: ship_id,
                score: ship.getScore()
            })
            remotePlayers.splice(remotePlayers.indexOf(ship), 1);
            io.sockets.emit("remove player", {id: ship_id});
        } else {
            if (undefined !== ship.getLives()) {
                ship.setLives(ship.getLives() - 1);
            }

            replaceShip(ship);
        }
    }

    function breakUFO (ufo) {        
        sendParticles({
            x: ufo.getX(),
            y: ufo.getY(),
            type: "UFO",
            rotation: ufo.rotation
        });

        ufos.splice(ufos.indexOf(ufo), 1);
        ufoTime = 0;
    }

    function replaceShip (ship) {
        ship.moveTo({ x : 640, y : 350 });
        ship.setRot(0);
        ship.setDX(0);
        ship.setDY(0);
    }
    
    function sendSound () {
        io.sockets.emit("play pew");
    }

    function sendParticles (spec) {
        io.sockets.emit("place particles", {
            x: spec.x,
            y: spec.y,
            type: spec.type,
            rotation: spec.rotation
        });
    }

    function toggleShip (ship) {
        util.log("Player has toggled: " + ship.id);

        if (ship.isEnabled()) {
            ship.disable();
        } else {
            ship.enable();
        }

        io.sockets.emit("toggle player", {id: ship.id});
    }

    function makeDirection () {
        tempY = Random.nextRange(-2, 2);
        
        if (tempY <= 0.1 && tempY >= -0.1) {
            return makeDirection();
        }

        return tempY;
    }

    function handleEndGame() {
        if (0 === remotePlayers.length) {
            io.sockets.emit("end game", {
                scores : 'none'
            });
            
            clearInterval(interval);
            running = false;
            AIConnected = false;
        }
    }

    function onSaveScore(data) {
        for (var index in removedPlayers) {
            if (data.id === removedPlayers[index].id) {
                scores.post({
                    name: data.name,
                    score: removedPlayers[index].score
                });
                removedPlayers.splice(index, 1);
                console.log(removedPlayers[index]);
            }
        }
    }

    return {
        init : init,
        asteroids : asteroids,
        sendSound : sendSound
    };
};

module.exports = main;
