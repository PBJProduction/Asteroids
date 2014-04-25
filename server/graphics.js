var input = require('./input.js');
var main = require('./main.js');
var random = require('./random.js');

var graphics = function () {
    'use strict';

    function Texture (spec) {
        var that = {};
        var dx = 0,
            dy = 0,
            thrust = 10,
            friction = 1,
            currentShootSpeed = 0,
            warpSpeed = 0,
            maxShootSpeed = 200,
            maxspeed = 15,
            lifeTime = 0,
            shields = 2,
            ufotime = 0;
        var thrusting = false;

        that.id = null;

        that.kill = false;

        that.bullets = [];

        that.myKeyboard = input.Keyboard();

        that.shoot = function (elapsedTime, s) {            
            currentShootSpeed += elapsedTime;
            if (currentShootSpeed >= maxShootSpeed) {
                currentShootSpeed = 0;
                var rotation = spec.rotation;
                if ('ufo' === that.id || 'bigUfo' === that.id) {
                    rotation = random.nextRange(1,2*Math.PI);
                }

                var newBullet = Texture( {
                    center : { x : spec.center.x, y : spec.center.y },
                    width : 20, height : 20,
                    rotation : rotation,
                    moveRate : 100,         // pixels per second
                    rotateRate : 3.14159,   // Radians per second
                    asteroid : true,
                    alive : 0,
                    thrust : 20,
                    dx : dx,
                    dy : dy
                });

                that.bullets.push(newBullet);
                s.s();
            }
        };

        that.warp = function (elapsedTime, s, asteroids){
            // warpSpeed += elapsedTime;

            if (warpSpeed >= 2000) {
                warpSpeed = 0;
                
                that.prev = {
                    x : spec.center.x,
                    y : spec.center.y
                };

                spec.center.x = random.nextRange(0, 1280);
                spec.center.y = random.nextRange(0, 700);

                for (var index in asteroids) {
                    var asteroid = asteroids[index];

                    while (Math.sqrt(Math.pow(spec.center.x - asteroid.getX(), 2) + Math.pow(spec.center.y - asteroid.getY(), 2)) < 100) {
                        spec.center.x = random.nextRange(0, 1280);
                        spec.center.y = random.nextRange(0, 700);
                    }
                }
            }
        };
        
        that.rotateRight = function (elapsedTime) {
            spec.rotation += spec.rotateRate * (elapsedTime / 1000);
        };
        
        that.rotateLeft = function (elapsedTime) {
            spec.rotation -= spec.rotateRate * (elapsedTime / 1000);
        };
        
        that.moveLeft = function (elapsedTime) {
            spec.center.x -= spec.moveRate * (elapsedTime / 1000);
        };
        
        that.moveRight = function (elapsedTime) {
            spec.center.x += spec.moveRate * (elapsedTime / 1000);
        };
        
        that.moveUp = function (elapsedTime) {
            spec.center.y -= spec.moveRate * (elapsedTime / 1000);
        };
        
        that.moveDown = function (elapsedTime) {
            spec.center.y += spec.moveRate * (elapsedTime / 1000);
        };

        that.forwardThruster = function (elapsedTime) {
            dx += (Math.cos(spec.rotation + Math.PI / 2) * thrust) * (elapsedTime / 1000);
            dy += (Math.sin(spec.rotation + Math.PI / 2) * thrust) * (elapsedTime / 1000);
            thrusting = true;
        };
        
        that.moveTo = function (center) {
            spec.center = center;
        };

        that.getX = function () {
            return spec.center.x;
        };

        that.getY = function () {
            return spec.center.y;
        };

        that.getRadius = function () {
            if(undefined === spec.radius) {
                return spec.width / 2;
            } else {
                return spec.radius;
            }
        };

        that.setX = function (x) {
            spec.center.x = x;
        };

        that.setY = function (y) {
            spec.center.y = y;
        };

        that.setRadius = function(radius) {
            if(undefined === radius) {
                spec.radius = spec.width / 2;
            } else {
                spec.radius = radius;
            }
        };

        that.getSize = function () {
            if (undefined === spec.size) {
                return 0;
            } else {
                return spec.size;
            }
        };

        that.setSize = function (size) {
            spec.size = size;
        };

        that.getRot = function () {
            return spec.rotation;
        };

        that.setRot = function (rot) {
            spec.rotation = rot;
        };

        that.setDX = function (ndx) {
            dx = ndx;
        };

        that.setDY = function (ndy) {
            dy = ndy;
        };

        that.getDX = function() {
            return dx;
        };

        that.getDY = function() {
            return dy;
        };

        that.setLives = function (nlives) {
            spec.lives = nlives;
        };

        that.getLives = function () {
            if (undefined === spec.lives) {
                return 0;
            } else {
                return spec.lives;
            }
        };

        that.setScore = function (score) {
            spec.score = score;
        };

        that.getScore = function () {
            if (undefined === spec.score) {
                return 0;
            } else {
                return spec.score;
            }
        };

        that.isThrusting = function () {
            var toReturn = thrusting;
            thrusting = false;
            return toReturn;
        };

        that.disable = function () {
            spec.disabled = true;
        };

        that.enable = function () {
            spec.disabled = false;
        };

        that.isEnabled = function () {
            if (undefined === spec.disabled) {
                return true;
            } else {
                if (spec.disabled) {
                    return false;
                } else {
                    return true;
                }
            }
        };

        that.getRounds = function () {
            if (undefined === spec.rounds) {
                return 0;
            } else {
                return spec.rounds;
            }
        };

        that.setRounds = function (value) {
            spec.rounds = value;
        };

        that.getShields = function () {
            if (shields === undefined || lifeTime >= 10000) {
                return 0;
            } else {
                return shields;
            }
        };

        that.setShields = function (value) {
            shields = value;
        };

        that.getWarpSpeed = function () {
            if (warpSpeed === undefined) {
                return 0;
            } else {
                return warpSpeed;
            }
        };

        that.resetLife = function () {
            lifeTime = 0;
            warpSpeed = 0;
        };

        that.checkBounds = function () {
            if (spec.center.x + spec.height / 2 <= 0) {
                spec.center.x = 1280 + spec.height / 2;
                } else if(spec.center.x - spec.height / 2 >= 1280) { // if it's greater than max x
                    spec.center.x = -spec.height / 2;
                } else if(spec.center.y + spec.width / 2 <= 0) { // if it's less than 0 for y
                    spec.center.y = 700+spec.width/2;
                } else if(spec.center.y - spec.width / 2 >= 700) { // if greater than max y
                    spec.center.y = -spec.width / 2;
                }
        };

        function press (data) {
            that.myKeyboard.keyPress(data);
        }

        function release (data) {
            that.myKeyboard.keyRelease(data);
        }

        function findClosestDirection (asteroids) {
            var minDistance = 10000000;
            var result = null;

            for (var i = 0; i < asteroids.length; ++i)  {
                var tempMin = findMinDistance(asteroids[i]);
                if (tempMin < minDistance) {
                    minDistance = tempMin;
                    result = asteroids[i];
                }
            }

            return {x: result.getX(), y: result.getY(), distance : minDistance};
        }

        function computeAngle (point) {
            var deg = (Math.abs(spec.rotation % (2 * Math.PI) * (180 / Math.PI) - 360)) % 360;
            var xComponent = spec.center.x - point.x;
            var yComponent = spec.center.y - point.y;
            var cComponent = Math.sqrt(Math.pow(xComponent, 2) + Math.pow(yComponent, 2));
            var angle = (Math.pow(yComponent, 2) + Math.pow(cComponent, 2) - Math.pow(xComponent, 2))/(2 * yComponent * cComponent);
            angle = Math.acos(angle) * (180 / Math.PI);
            angle = (deg + angle) % 360;
            
            if (angle > 180) {
                 return 360 - angle;
            }

            return angle;
        }

        function findMinDistance (asteroid) {
            return Math.sqrt(Math.pow(asteroid.getX() - spec.center.x, 2) + Math.pow(asteroid.getY() - spec.center.y, 2));
        }

        function updateAI (time,blah,asteroids) {
            var closestAsteroid = findClosestDirection(asteroids);

            if (computeAngle(closestAsteroid) <= 5) {
                release(input.KeyEvent.DOM_VK_W);
                release(input.KeyEvent.DOM_VK_A);
                release(input.KeyEvent.DOM_VK_D);
                press(input.KeyEvent.DOM_VK_SPACE);
            } else {
                release(input.KeyEvent.DOM_VK_SPACE);
                if ((dx < 2 && dy < 2) || closestAsteroid.distance < 300) {
                    press(input.KeyEvent.DOM_VK_W);
                } else {
                    release(input.KeyEvent.DOM_VK_W);
                }

                if (closestAsteroid.x < spec.center.x) {
                    press(input.KeyEvent.DOM_VK_A);
                    release(input.KeyEvent.DOM_VK_D);
                } else {
                    press(input.KeyEvent.DOM_VK_D);
                    release(input.KeyEvent.DOM_VK_A);
                }
            }
        }

        function updateUFO (time) {
            ufotime += time;
            spec.center.x += spec.moveRate * (time / 1000);

            if (ufotime >= 500) {
                spec.center.y += spec.moveRate * (time / 1000);
            } else {
                spec.center.y -= spec.moveRate * (time / 1000);
            }

            if ('bigUfo' === spec.id) {
                return;
            }

            if (ufotime >= 1000) {
                ufotime = 0;
                press(input.KeyEvent.DOM_VK_SPACE);
            } else {
                release(input.KeyEvent.DOM_VK_SPACE);
            }
        }

        function updateBigUfo(time) {
            updateUFO(time);

            if (ufotime >= 100) {
                ufotime = 0;
                press(input.KeyEvent.DOM_VK_SPACE)
            } else {
                release(input.KeyEvent.DOM_VK_SPACE);
            }
        }

        that.update = function(time, blah, asteroids){
            that.myKeyboard.update(time, blah, asteroids);

            if ('ai' === that.id) {
                updateAI(time,blah,asteroids);
            } else if ('ufo' === that.id) {
                updateUFO(time);
            } else if ('bigUfo' === that.id) {
                updateBigUfo(time);
            }
            
            if(dy > maxspeed) {
                dy = maxspeed;
            }

            if(dy < -maxspeed) {
                dy = -maxspeed;
            }

            if(dx > maxspeed) {
                dx = maxspeed;
            }

            if(dx < -maxspeed) {
                dx = -maxspeed;
            }

            lifeTime += time;
            warpSpeed += time;

            for (var i = 0; i < that.bullets.length; ++i) {
                if (that.bullets[i].kill) {
                    that.bullets.splice(i, 1);
                    i--;
                } else {
                    that.bullets[i].update(time);
                }
            }

            if (spec.asteroid) {
                spec.alive += time;
                dx = (Math.cos(spec.rotation + Math.PI/2) * spec.thrust) + spec.dx;
                dy = (Math.sin(spec.rotation + Math.PI/2) * spec.thrust) + spec.dy;
                if (spec.alive >= 1000) {
                    that.kill = true;
                }
            }
            spec.center.x -= dx;
            spec.center.y -= dy;
            that.checkBounds();
        };
        
        return that;
    }

    return {
        Texture : Texture
    };
};

module.exports = graphics;
