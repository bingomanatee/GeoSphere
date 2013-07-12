var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Canvas = require('canvas');
var Triangle = require('./Triangle');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function faces_to_triangles(iso) {
	var triangles = _.map(iso.faces, function (face) {
		return new Triangle(iso.vertices[face.a].uv, iso.vertices[face.b].uv, iso.vertices[face.c].uv);
	});

	return triangles;

}

function _random_color() {

	function _rh() {
		return Math.floor(255 * Math.random());
	}

	return util.format('rgba(%s,%s,%s,0.75)', _rh(), _rh(), _rh());
}

function _minX(t){
	return Math.min(t.a.x, t.b.x, t.c.x);
}

/* ********* EXPORTS ******** */

module.exports = function (h, w, file, cb) {
	var triangles = faces_to_triangles(this.iso);

	var c = new Canvas(h, w);
	var ctx = c.getContext('2d');

	function _p(p) {
		return [p.x * h, p.y * w];
	}

	_.sortBy(triangles, function(t){ return t.perimiterSquared() * -1}).forEach(function (t) {
		ctx.fillStyle = _random_color();
		ctx.beginPath();

		ctx.moveTo.apply(ctx, _p(t.a));
		ctx.lineTo.apply(ctx, _p(t.b));
		ctx.lineTo.apply(ctx, _p(t.c));
		ctx.lineTo.apply(ctx, _p(t.a));

		ctx.closePath();
		ctx.fill();

		if (t.max_x() > 1){
			t.offset(-1, 0);
			ctx.beginPath();

			ctx.moveTo.apply(ctx, _p(t.a));
			ctx.lineTo.apply(ctx, _p(t.b));
			ctx.lineTo.apply(ctx, _p(t.c));
			ctx.lineTo.apply(ctx, _p(t.a));

			ctx.closePath();
			ctx.fill();
		}


	});

	var out = fs.createWriteStream(file)
		, stream = c.pngStream();

	stream.on('data', function (chunk) {
		out.write(chunk);
	});

	stream.on('end', function () {
		process.nextTick(cb);
	});
}