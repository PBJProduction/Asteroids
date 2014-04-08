angular.module('asteroids').controller('highScoreController', function($scope) {
	$.getJSON("v1/high-scores", function (data) {
		var items = [];

		$.each(data, function(key, value) {
			items.unshift("<li><pre>Name: " + key + " \tScore: " + value + "</pre></li>");
		});

		if(items.length > 10) {
			items.length = 10;
		}

		$("<ol/>", {
			"class" : "none",
			html: items.join("")
		}).appendTo("#toAdd");
	});

});