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

GALAXY._prototypes.Planet.save_JSON = function (file_path, cb, nesting) {
	var data = JSON.stringify(this.toJSON(), nesting, nesting);
	fs.writeFile(file_path, data, function () {
		console.log('done writing %s', file_path);
		cb();
	});
};

/**
 * returns an object of a planet with compressed data.
 * @returns {Object}
 */

GALAXY._prototypes.Planet.toJSON = function () {
	debugger;
	return {
		iso:     this.iso_to_JSON(),
		sectors: this.iso.sectors
	};
};

GALAXY._prototypes.Planet.sector_to_JSON = function () {
	var sectors = this.sectors.forEach(function (sector) {
		return {
			id:       sector.id,
			vertices: sector.vertices,
			parent:   sector.parent
		};
	});
	return sectors;
};

GALAXY._prototypes.Planet.iso_to_JSON = function () {

	return {
		vertices: _.map(this.iso.vertices, function (vertex) {
			return [vertex.x, vertex.y, vertex.z, vertex.uv.x, vertex.uv.y, vertex.sectors];
		}),
		faces:    _.map(this.iso.faces, function (face) {
			return [face.a, face.b, face.c];
		})
	}

};