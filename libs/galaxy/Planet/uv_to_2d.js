/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var mongoose = require('mongoose');
	var _ = require('underscore');
	var util = require('util');
	var fs = require('fs');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

GALAXY._prototypes.Planet.uv_to_2d = function (height, width, point_to_color, finest_detail, spread) {
	var out = [];
	var test = new THREE.Vector2();

	_.range(0, width).forEach(function (y) {
		_.range(0, height).forEach(function (x) {
			test.x = x / height;
			test.y = y / width;

			var target  = x * width + y;
			var pt = this.closest_uv(target, finest_detail, spread);
			out[target] = point_to_color(pt);
		})
	})

	return out;
}

GALAXY._prototypes.Planet.uv_index = function(){
	if (!this._uv_index){
		this._uv_index = new GALAXY.UV_index();
		this._uv_index.divide(5);
		this._uv_index.load(this.vertices);
	}
	return(this._uv_index);
};

GALAXY._prototypes.Planet.uv_to_2d_sector = function (height, width, vertex_to_color, finest_detail) {
	var out = [];
	var test = new THREE.Vector2();

	var sample = {};
	sample.uv = test;
	_.range(0, width).forEach(function (y) {
		_.range(0, height).forEach(function (x) {
			test.x = x / height;
			test.y = y / width;

			var vertex = this.uv_index().closest(test);
			out.push(vertex_to_color(vertex));
		});
	});

	return out;
};