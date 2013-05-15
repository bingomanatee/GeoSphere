/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Network_Node = require('./Node');
	var util = require('util');
	var _DEBUG = false;
	var Canvas = require('canvas');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Network) {
	GALAXY._prototypes.Network = {};
}

/**
 * draws nodes on a canvas. unlike GALAXY.util.array_to_canvas, which operates on a pixel by pixel basis,
 * this function allows the node access to the canvas to do whatever it wants to .
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.draw_by_node = function (width, height, each_fn) {
	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');
	var fn = function(node){
		each_fn(node, canvas, ctx);
	};

	this.each(fn);

	return canvas;
}