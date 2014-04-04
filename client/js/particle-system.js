/*jslint browser: true, white: true, plusplus: true */
/*global Random */
function particleSystem(spec, graphics) {
	'use strict';
	var that = {},
		nextName = 1,	// unique identifier for the next particle
		particles = {};	// Set of all active particles

	that.remove = false;
	
	that.create = function() {
		var direction = Random.nextCircleVector();
		if(spec.direction)
			direction = spec.direction;
		if(spec.asteroid)
			direction = Random.nextEllipseVector();
		var p = {
				image: spec.image,
				size: Random.nextGaussian(spec.size.mean, spec.size.stdev),
				center: {x: spec.center.x, y: spec.center.y},
				direction: direction,
				speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
				rotation: 0,
				lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),	// How long the particle should live, in seconds
				alive: 0	// How long the particle has been alive, in seconds
			};
		
		//
		// Ensure we have a valid size - gaussian numbers can be negative
		p.size = Math.max(1, p.size);
		//
		// Same thing with lifetime
		p.lifetime = Math.max(0.01, p.lifetime);
		//
		// Assign a unique name to each particle
		particles[nextName++] = p;
	};
	
	that.update = function(elapsedTime) {
		var removeMe = [],
			value,
			particle;
		elapsedTime /= 1000;
		
		for (value in particles) {
			if (particles.hasOwnProperty(value)) {
				particle = particles[value];
				//
				// Update how long it has been alive
				particle.alive += elapsedTime;
				
				//
				// Update its position
				particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
				particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
				
				//
				// Rotate proportional to its speed
				particle.rotation += particle.speed / 500;
				
				//
				// If the lifetime has expired, identify it for removal
				if (particle.alive > particle.lifetime) {
					removeMe.push(value);
					that.remove = true;
				}
			}
		}

		//
		// Remove all of the expired particles
		for (particle = 0; particle < removeMe.length; particle++) {
			delete particles[removeMe[particle]];
		}
		removeMe.length = 0;
	};

	that.render = function() {
		var value,
			particle;
		
		for (value in particles) {
			if (particles.hasOwnProperty(value)) {
				particle = particles[value];
				graphics.drawImage(particle);
			}
		}
	};
	
	return that;
}
