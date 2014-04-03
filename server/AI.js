//pseudocode for Asteroids AI

//create AI
var AI = {};

AI.update = function() {
	for (var index in MYGAME.main.asteroids) {
		var asteroid = MYGAME.main.asteroids[index],
			distance = Math.sqrt(Math.pow(asteroid.x - this.x, 2) + Math.pow(asteroid.y - this.y, 2)), 
			whereAt = null, 
			howFar = 0, 
			i = 0;
			
		if (distance < 50) {
			if (this.x > asteroid.x && distance < 50) { //asteroid is to the left of AI
				press(KeyEvent.DOM_VK_D);
				release(KeyEvent.DOM_VK_D);
				howFar++;
				whereAt = "left";
				if (this.y < asteroid.y) { //QIII
					press(KeyEvent.DOM_VK_D);
					release(KeyEvent.DOM_VK_D);
				}

				press(KeyEvent.DOM_VK_W);
				release(KeyEvent.DOM_VK_W);

				distance = Math.sqrt(Math.pow(asteroid.x - AI.x, 2) + Math.pow(asteroid.y - this.y, 2));
			}

			if (AI.x < asteroid.x && distance < 50) { //asteroid to the right of AI
	 			press(KeyEvent.DOM_VK_A);
	 			release(KeyEvent.DOM_VK_A);
	 			whereAt = "right";
	 			howFar++;
	 			if (this.y < asteroid.y) { //QIV
	 				press(KeyEvent.DOM_VK_A);
	 				release(KeyEvent.DOM_VK_A);
	 			}

	 			press(KeyEvent.DOM_VK_W);
	 			release(KeyEvent.DOM_VK_W);

	 			distance = Math.sqrt(Math.pow(asteroid.x - this.x, 2) + Math.pow(asteroid.y - this.y, 2));
			}
		}

		if (whereAt !== null) {
			if (whereAt === "left") {
				for (i = 0; i < howFar; ++i) {
					press(KeyEvent.DOM_VK_A);
					release(KeyEvent.DOM_VK_A);
				}
			}

			else {
				for (i = 0; i < howFar; ++i) {
					press(KeyEvent.DOM_VK_D);
					release(KeyEvent.DOM_VK_D);
				}
			}

			press(KeyEvent.DOM_VK_SPACE);
			release(KeyEvent.DOM_VK_SPACE);
		}
	}
};

exports.AI = AI;