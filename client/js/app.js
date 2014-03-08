// create the module and name it asteroids
angular.module('asteroids', []);

// configure our routes
angular.module('asteroids').config(function($routeProvider) {
	$routeProvider

		// route for the main page
		.when('/', {
			templateUrl : '/html/menu.html',
			controller  : 'menuController'
		})

		// route for the help page
		.when('/help', {
			templateUrl : '/html/help.html',
			controller  : 'helpController'
		})

		// route for the about page
		.when('/about', {
			templateUrl : '/html/about.html',
			controller  : 'aboutController'
		})

		// route for the highscore page
		.when('/highscore', {
			templateUrl : '/html/highscore.html',
			controller  : 'highScoreController'
		})

		// route for the game page
		.when('/game', {
			templateUrl : '/html/game.html',
			controller  : 'gameController'
		})

		// redirect to login if anything wrong is typed in
		.otherwise({
			redirectTo: '/'
		});
});