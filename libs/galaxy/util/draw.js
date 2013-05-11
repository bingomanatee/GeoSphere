/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
	var fs = require('fs');
	var Canvas = require('Canvas');
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

/**
 * returns a canvas given size and a pixel interpolation function
 * @param width
 * @param height
 * @param pt_to_color
 * @returns Canvas
 */
GALAXY.util.draw = function(width, height, pt_to_color){
	var out = [];
	_.each(_.range(0, width), function(x){
		_.each(_.range(0, height), function(y){
			out.push(pt_to_color(x, y));
		})
	})

	return GALAXY.util.array_to_canvas(width, height, out);
};

GALAXY.util.bg_color = function(ctx, width,height, color){
	if (color.getStyle) color = color.getStyle();

	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.closePath();
	ctx.fill();
};

GALAXY.util.canvas_to_png = function(canvas, file_path, done){

	var out = fs.createWriteStream(file_path);
	var stream = canvas.pngStream();

	stream.on('data', function (c) {
		out.write(c);
	});

	stream.on('end', function () {
		var delay =  Math.sqrt(canvas.width * canvas.height)/5;
		console.log('width: %s, height: %s, delay: %s', canvas.width, canvas.height, delay);
		setTimeout(done,  Math.min(4000,delay));
	})
};

GALAXY.util.array_to_canvas = function (width, height, colors) {
	if (_DEBUG) console.log('drawing %s, %s with %s', width, height, util.inspect(colors));

	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');

	colors.forEach(function (color, index) {
		var y = index % height;
		var x = Math.floor(index / height);

		if (color.length < 4){
			ctx.fillStyle = util.format('rgba(%s, %s, %s, 1)',
				GALAXY.util.channel(color[0]), GALAXY.util.channel(color[1]), GALAXY.util.channel(color[2]));
		} else {
			ctx.fillStyle = util.format('rgba(%s, %s, %s, 1)',
				GALAXY.util.channel(color[0]), GALAXY.util.channel(color[1]), GALAXY.util.channel(color[2]),GALAXY.util.alpha(color[3]));
		}

	//	console.log('%s, %s fillStyle: %s', x, y, ctx.fillStyle);

		ctx.beginPath();
		ctx.rect(x, y, 1, 1);
		ctx.closePath();
		ctx.fill();
	});

	return canvas;
};
