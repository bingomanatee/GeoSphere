/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
	var canvas = require('Canvas');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
	var _DEBUG = window._DEBUG || false;
}

if (!GALAXY.util) {
	GALAXY.util = {};
}

GALAXY.util.channel = function(value){
	return Math.max(0, Math.min(255, Math.round(value)));
};

GALAXY.util.alpha = function(value){
	return Math.max(0, Math.min(1, value));
};

GALAXY.util.array_to_canvas = function (width, height, colors) {
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');

	colors.forEach(function (color, index) {
		var x = index % width;
		var y = Math.floor(index / width);

		if (color.length == 3){

			ctx.fillStyle = util.format('rgba(%s, %s, %s, 1)',
				GALAXY.util.channel(color[0]), GALAXY.util.channel(color[1]), GALAXY.util.channel(color[2]));
		} else {
			ctx.fillStyle = util.format('rgba(%s, %s, %s, 1)',
				GALAXY.util.channel(color[0]), GALAXY.util.channel(color[1]), GALAXY.util.channel(color[2]),GALAXY.util.alpha(color[3]));
		}

		ctx.beginPath();
		ctx.rect(x, y, 1, 1);
		ctx.closePath();
		ctx.fill();
	});

};