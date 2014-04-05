var input = require('./input.js');
var main = require('./main.js');

var graphics = function() {
    function Texture(spec) {
        var that = {};
        var dx = 0,
            dy = 0,
            thrust = 5,
            friction = 1,
            currentShootSpeed = 0,
            maxShootSpeed = 200,
            maxspeed = 10;
        var thrusting = false;

        that.id = null;

        that.kill = false;

        that.bullets = [];

        that.myKeyboard = input.Keyboard();

        that.shoot = function(elapsedTime, s){
            // console.log(s);
            currentShootSpeed+= elapsedTime;
            if(currentShootSpeed >= maxShootSpeed){
                currentShootSpeed = 0;
                var newBullet = Texture( {
                    center : { x : spec.center.x, y : spec.center.y },
                    width : 20, height : 20,
                    rotation : spec.rotation,
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
        
        that.rotateRight = function(elapsedTime) {
            spec.rotation += spec.rotateRate * (elapsedTime / 1000);
        };
        
        that.rotateLeft = function(elapsedTime) {
            spec.rotation -= spec.rotateRate * (elapsedTime / 1000);
        };
        
        that.moveLeft = function(elapsedTime) {
            spec.center.x -= spec.moveRate * (elapsedTime / 1000);
        };
        
        that.moveRight = function(elapsedTime) {
            spec.center.x += spec.moveRate * (elapsedTime / 1000);
        };
        
        that.moveUp = function(elapsedTime) {
            spec.center.y -= spec.moveRate * (elapsedTime / 1000);
        };
        
        that.moveDown = function(elapsedTime) {
            spec.center.y += spec.moveRate * (elapsedTime / 1000);
        };

        that.forwardThruster = function(elapsedTime){
            dx += (Math.cos(spec.rotation + Math.PI/2) * thrust) * (elapsedTime / 1000);
            dy += (Math.sin(spec.rotation + Math.PI/2) * thrust) * (elapsedTime / 1000);
            thrusting = true;
        };
        
        that.moveTo = function(center) {
            spec.center = center;
        };

        that.getX = function(){
            return spec.center.x;
        };

        that.getY = function(){
            return spec.center.y;
        };

        that.getRadius = function() {
            if(spec.radius === undefined) {
                return spec.width / 2;
            } else {
                return spec.radius;
            }
        };

        that.setX = function(x){
            spec.center.x = x;
        };

        that.setY = function(y){
            spec.center.y = y;
        };

        that.setRadius = function(radius) {
            if(radius === undefined) {
                spec.radius = spec.width / 2;
            } else {
                spec.radius = radius;
            }
        };

        that.getSize = function() {
            if(spec.size === undefined) {
                return 0;
            } else {
                return spec.size;
            }
        };

        that.setSize = function(size) {
            spec.size = size;
        };

        that.getRot = function(){
            return spec.rotation;
        };

        that.setRot = function(rot){
            spec.rotation = rot;
        };

        that.setDX = function(ndx){
            dx = ndx;
        };

        that.setDY = function(ndy){
            dy = ndy;
        };

        that.setLives = function(nlives) {
            spec.lives = nlives;
        };

        that.getLives = function() {
            if (spec.lives === undefined) {
                return 0;
            } else {
                return spec.lives;
            }
        };

        that.setScore = function(score){
            spec.score = score;
        };

        that.getScore = function() {
            if (spec.score === undefined) {
                return 0;
            } else {
                return spec.score;
            }
        }

        that.isThrusting = function() {
            var toReturn = thrusting;
            thrusting = false;
            return toReturn;
        }

        that.checkBounds = function(){
            if(spec.center.x+spec.height/2 <= 0)
                spec.center.x = 1280+spec.height/2;

            //if its greater than max x
            else if(spec.center.x-spec.height/2 >= 1280)
                spec.center.x = -spec.height/2;

            //if its less than 0 y
            else if(spec.center.y+spec.width/2 <= 0)
                spec.center.y = 700+spec.width/2;

            //if its greater than max y
            else if(spec.center.y-spec.width/2 >= 700)
                spec.center.y = -spec.width/2;
        };

        function press(data){
            that.myKeyboard.keyPress(data);
        }

        function release(data){
            that.myKeyboard.keyRelease(data);
        }

        function findClosestDirection(asteroids){
            var minDistance = 10000000;
            var result = null;
            for(var i = 0; i < asteroids.length; ++i){
                var tempMin = findMinDistance(asteroids[i]);
                if(tempMin < minDistance){
                    minDistance = tempMin;
                    result = asteroids[i];
                }
            }
            return {x: result.getX(), y: result.getY(), distance : minDistance};
        }

        function computeAngle(point){
            var deg = (Math.abs(spec.rotation % (2*Math.PI) * (180/Math.PI) - 360)) % 360;
            var xComponent = spec.center.x-point.x;
            var yComponent = spec.center.y - point.y;
            var cComponent = Math.sqrt(Math.pow(xComponent,2)+Math.pow(yComponent,2));
            var angle = (Math.pow(yComponent,2) + Math.pow(cComponent,2) - Math.pow(xComponent,2))/(2*yComponent*cComponent);
            angle = Math.acos(angle)*(180/Math.PI);
            angle = (deg + angle) % 360;
            if(angle > 180)
                return 360 - angle;
            return angle;
        }

        function findMinDistance(asteroid){
            return Math.sqrt(Math.pow(asteroid.getX() - spec.center.x, 2) + Math.pow(asteroid.getY() - spec.center.y, 2));
        }

        function updateAI(time,blah,asteroids){
            var closestAsteroid = findClosestDirection(asteroids);
            if(computeAngle(closestAsteroid) <= 5){
                release(input.KeyEvent.DOM_VK_W);
                release(input.KeyEvent.DOM_VK_A);
                release(input.KeyEvent.DOM_VK_D);
                press(input.KeyEvent.DOM_VK_SPACE);
            }
            else
            {
                release(input.KeyEvent.DOM_VK_SPACE);
                if(closestAsteroid.distance > 600){
                    if(dx < 2 && dy < 2){
                        press(input.KeyEvent.DOM_VK_W);
                    }
                    else{
                        release(input.KeyEvent.DOM_VK_W);
                    }
                }
                if(closestAsteroid.x < spec.center.x){
                    press(input.KeyEvent.DOM_VK_A);
                    release(input.KeyEvent.DOM_VK_D);
                }
                else{
                    press(input.KeyEvent.DOM_VK_D);
                    release(input.KeyEvent.DOM_VK_A);
                }
            }
        }

        that.update = function(time, blah, asteroids){
            that.myKeyboard.update(time, blah);
            if(that.id === 'ai'){
                    updateAI(time,blah,asteroids);
            }
            if(dy > maxspeed)
                dy = maxspeed;
            if(dy < -maxspeed)
                dy = -maxspeed;
            if(dx > maxspeed)
                dx = maxspeed;
            if(dx < -maxspeed)
                dx = -maxspeed;
            for(var i = 0; i < that.bullets.length; ++i){
                if(that.bullets[i].kill){
                    that.bullets.splice(i, 1);
                    i--;
                }
                else{
                    that.bullets[i].update(time);
                }
            }
            if(spec.asteroid){
                spec.alive += time;
                dx = (Math.cos(spec.rotation + Math.PI/2) * spec.thrust) + spec.dx;
                dy = (Math.sin(spec.rotation + Math.PI/2) * spec.thrust) + spec.dy;
                if(spec.alive >= 1000){
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
