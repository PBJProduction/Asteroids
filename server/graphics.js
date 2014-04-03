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

		that.id = null;

		that.kill = false;

		that.bullets = [];

		that.myKeyboard = input.Keyboard();

		that.shoot = function(elapsedTime){
			currentShootSpeed+= elapsedTime;
			if(currentShootSpeed >= maxShootSpeed){
				currentShootSpeed = 0;
				var newBullet = Texture( {
					center : { x : spec.center.x, y : spec.center.y },
					width : 20, height : 20,
					rotation : spec.rotation,
					moveRate : 100,			// pixels per second
					rotateRate : 3.14159,	// Radians per second
					asteroid : true,
					alive : 0,
					thrust : 10,
					dx : dx,
					dy : dy
				});
				that.bullets.push(newBullet);
				main.sendSound();
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
				return spec.width;
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
				spec.radius = spec.width;
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
		}

		that.setSize = function(size) {
			spec.size = size;
		}

		that.getRot = function(){
			return spec.rotation;
		};

		that.setRot = function(rot){
			spec.rotation = rot;
		};

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

		that.update = function(time){
			that.myKeyboard.update(time);
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
