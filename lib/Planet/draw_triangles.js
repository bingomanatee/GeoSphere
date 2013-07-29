var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Canvas = require('canvas');
var Triangle = require('./Triangle');
var canvas_to_file =  require('./../util/canvas_to_file');

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

module.exports = function (h, w, cb) {


    if (_.isString(cb)){
        var file_path = cb;
        var on_done = arguments[3];

        cb = function(err, canvas){
            canvas_to_file(canvas, file_path, on_done);
        }
    }

	var triangles = faces_to_triangles(this);

	var c = new Canvas(h, w);
	var ctx = c.getContext('2d');

	triangles.forEach(function (t) {
		t.draw(ctx, h, w);
	});

	cb(null, c);
};