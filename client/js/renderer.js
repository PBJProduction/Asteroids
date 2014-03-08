/*jslint browser: true, white: true */
/*global CanvasRenderingContext2D, MYGAME */
// ------------------------------------------------------------------
//
//
// ------------------------------------------------------------------

MYGAME.graphics = function() {
	'use strict';
	
	var canvas = document.getElementById('canvas-main'),
		context = canvas.getContext('2d');
	
	//
	// Place a 'clear' function on the Canvas prototype, this makes it a part
	// of the canvas, rather than making a function that calls and does it.
	CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, canvas.width, canvas.height);
		this.restore();
	};
	
	function clear() {
		context.clear();
	}
	
	function Texture(spec) {
		var that = {};
		var dx = 0,
			dy = 0,
			thrust = 10,
			friction = 0.98,
			rotate = 0;

		that.id = null;
		
		that.rotateRight = function(elapsedTime) {
			rotate += spec.rotateRate * (elapsedTime / 1000);
		};
		
		that.rotateLeft = function(elapsedTime) {
			rotate -= spec.rotateRate * (elapsedTime / 1000);
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

		that.update = function(){
			dx *= friction;
			dy *= friction;
			spec.center.x -= dx;
			spec.center.y -= dy;
			//if its less than 0 x
			if(spec.center.x+spec.height/2 <= 0)
				spec.center.x = canvas.width+spec.height/2;

			//if its greater than max x
			else if(spec.center.x-spec.height/2 >= canvas.width)
				spec.center.x = -spec.height/2;

			//if its less than 0 y
			else if(spec.center.y+spec.width/2 <= 0)
				spec.center.y = canvas.height+spec.width/2;

			//if its greater than max y
			else if(spec.center.y-spec.width/2 >= canvas.height)
				spec.center.y = -spec.width/2;

			if(spec.rotation !== rotate){
				spec.rotation = rotate;
				return true;
			}
			if(dx <= 0.01 && dx >= -0.01){
				return false;
			}
			return true;
		};
		
		that.draw = function() {
			context.save();
			
			context.translate(spec.center.x, spec.center.y);
			context.rotate(spec.rotation);
			context.translate(-spec.center.x, -spec.center.y);
			context.drawImage(
				spec.image,
				spec.center.x - spec.width/2,
				spec.center.y - spec.height/2,
				spec.width, spec.height);
			
			context.restore();
		};
		
		return that;
	}

	return {
		clear : clear,
		Texture : Texture
	};
};
