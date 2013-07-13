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

function faces_to_triangles(s) {
	return _.map(s.iso.faces, function (face) {
		return new Triangle(face, s);
	});
}

function _minX(t){
	return Math.min(t.a.x, t.b.x, t.c.x);
}

/* ********* EXPORTS ******** */

module.exports = function (h, w, file, cb) {
	var triangles = faces_to_triangles(this);

	var c = new Canvas(h, w);
	var ctx = c.getContext('2d');

	triangles.forEach(function (t) {
		t.draw(ctx, h, w);
	});

	var out = fs.createWriteStream(file), stream = c.pngStream();

	stream.on('data', _.bind(out.write, out));
	stream.on('end', function () {
		process.nextTick(cb);
	});
}