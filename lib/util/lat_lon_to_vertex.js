var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');
var spherical_vector = require('./spherical_vector.js');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var geometry = new THREE.SphereGeometry(1, 4, 4);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

/* ********* EXPORTS ******** */

module.exports = function (lat, lon, degrees) {
	if (degrees) {
		lat *= Math.PI / 180;
		lon *= Math.PI / 180;
	}

	var origin = new THREE.Mesh(geometry, material);
	var origin2 = new THREE.Mesh(geometry, material);
	var offset = new THREE.Mesh(geometry, material);

	offset.position.z = 1;
	origin.add(origin2);
	origin2.add(offset);

	origin.rotation.y = lon;
	origin2.rotation.x = lat;
	origin.updateMatrixWorld();

	var abs = new THREE.Vector3();
	abs.getPositionFromMatrix(offset.matrixWorld);
	return spherical_vector(abs);
};