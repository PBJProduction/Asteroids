var Player = function(x, y, rot) {
	var that = {
		x  : x,
		y  : y,
		rot: rot,
		id : null
	};

	return that;
};

exports.Player = Player;