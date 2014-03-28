var input = require('./input.js');

var graphics = function() {
	function Texture(spec) {
		var that = {};
		var dx = 0,
			dy = 0,
			thrust = 10,
			friction = 1,
			currentShootSpeed = 0,
			maxShootSpeed = 200,
			maxspeed = 20;

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
					alive : 0
				});
				that.bullets.push(newBullet);
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

		that.setX = function(x){
			spec.center.x = x;
		};

		that.setY = function(y){
			spec.center.y = y;
		};

		that.getRot = function(){
			return spec.rotation;
		};

		that.setRot = function(rot){
			spec.rotation = rot;
		};

		that.checkBounds = function(){
			if(spec.center.x+spec.height/2 <= 0)
				spec.center.x = 500+spec.height/2;

			//if its greater than max x
			else if(spec.center.x-spec.height/2 >= 500)
				spec.center.x = -spec.height/2;

			//if its less than 0 y
			else if(spec.center.y+spec.width/2 <= 0)
				spec.center.y = 500+spec.width/2;

			//if its greater than max y
			else if(spec.center.y-spec.width/2 >= 500)
				spec.center.y = -spec.width/2;
		};

		that.update = function(time){
			that.myKeyboard.update(time);
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
				dx = (Math.cos(spec.rotation + Math.PI/2) * thrust);
				dy = (Math.sin(spec.rotation + Math.PI/2) * thrust);
				if(spec.alive >= 1000){
					that.kill = true;
				}
			}
			dx *= friction;
			dy *= friction;
			if(dy > maxspeed)
				dy = maxspeed;
			if(dy < -maxspeed)
				dy = -maxspeed;
			if(dx > maxspeed)
				dx = maxspeed;
			if(dx < -maxspeed)
				dx = -maxspeed;
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
