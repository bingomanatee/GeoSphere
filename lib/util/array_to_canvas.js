var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Canvas = require('canvas');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function _channel(i){
	return Math.floor(i * 255);
}

/* ********* EXPORTS ******** */

module.exports = function (width, height, colors) {
	if (_DEBUG) console.log('drawing %s, %s with %s', width, height, util.inspect(colors));

	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');

	colors.forEach(function (color, index) {
		var y = index % height;
		var x = Math.floor(index / height);

		if (color.length < 4){
			ctx.fillStyle = util.format('rgba(%s, %s, %s, 1)',
				_channel(color[0]), _channel(color[1]), _channel(color[2]));
		} else {
			ctx.fillStyle = util.format('rgba(%s, %s, %s, %s)',
				_channel(color[0]), _channel(color[1]), _channel(color[2]), _channel(color[3]));
		}

		//	console.log('%s, %s fillStyle: %s', x, y, ctx.fillStyle);

		ctx.beginPath();
		ctx.rect(x, y, 1, 1);
		ctx.closePath();
		ctx.fill();
	});

	return canvas;
};
