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
			rotate = 0,
			y = spec.center.y,
			x = spec.center.x;

		that.id = null;

		that.getBullets = function(){
			return spec.bullets;
		};

		that.setBullets = function(bulletsIn){
			spec.bullets = bulletsIn;
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

		that.disable = function() {
		    spec.disabled = true;
		}

		that.enable = function() {
		    spec.disabled = false;
		}

		that.isEnabled = function() {
		    if (spec.disabled === undefined) {
		        return true;
		    } else {
		        if (spec.disabled) {
		            return false;
		        } else {
		            return true;
		        }
		    }
		}
		
		return that;
	}

	function drawImage(spec) {
		context.save();
		
		context.translate(spec.center.x, spec.center.y);
		context.rotate(spec.rotation);
		context.translate(-spec.center.x, -spec.center.y);
		
		context.drawImage(
			spec.image, 
			spec.center.x - spec.size/2, 
			spec.center.y - spec.size/2,
			spec.size, spec.size);
		
		context.restore();
	}

	return {
		clear : clear,
		Texture : Texture,
		drawImage : drawImage,
		context : context
	};
};
