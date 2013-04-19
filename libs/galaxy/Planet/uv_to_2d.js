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

GALAXY._prototypes.Planet.uv_to_2d_sector = function (height, width, sector_to_color, finest_detail) {
	var out = [];
	var test = new THREE.Vector2();

	_.range(0, width).forEach(function (y) {
		_.range(0, height).forEach(function (x) {
			test.x = x / height;
			test.y = y / width;

			var target  = x * width + y;
			var sector = this.closest_sector(target, finest_detail);
			out[target] = sector_to_color(sector);
		});
	});

	return out;
};