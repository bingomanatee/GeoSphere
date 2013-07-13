var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');

var vector_azimuth = require('./vector_azimuth');
var vector_inclination = require('./vector_inclination');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (vector, list) {

	var vertex = vector.clone().normalize();
	if (list) vertex.index = list.push(vertex) - 1;

	// Texture coords are equivalent to map coords, calculate angle and convert to fraction of a circle.

	var u = vector_azimuth(vector) / 2 / Math.PI + 0.5;
	var v = vector_inclination(vector) / Math.PI + 0.5;
	vertex.uv = new THREE.Vector2(u, 1 - v);

	return vertex;
};