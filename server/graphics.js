var input = require('./input.js');

var graphics = function() {
	function Texture(spec) {
		var that = {};
		var dx = 0,
			dy = 0,
			thrust = 10,
			friction = 1;

		that.id = null;

		that.myKeyboard = input.Keyboard();
		
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
				spec.center.x = 1000+spec.height/2;

			//if its greater than max x
			else if(spec.center.x-spec.height/2 >= 1000)
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
			dx *= friction;
			dy *= friction;
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
