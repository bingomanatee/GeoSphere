/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Sector) {
	GALAXY._prototypes.Sector = {};
}

/**
 * returns an array of vertices from this sectors' list of vertex indexes.

 * @returns {[THREE.Vector3]}
 */

GALAXY._prototypes.Sector.get_vertices = function () {
	if(!(this.vertices && this.vertices.length)) return [];
	/*
	if (!this._vertices) {
		if (this.vertices) {
			this._vertices = _.filter(this.planet.iso.vertices, function (vertex) {
				return _.contains(this.vertices, vertex.index);
			}, this);
		} else {
			this._vertices = [];
		}
	}
	return this._vertices; */

	return this.planet.get_vertices(this.vertices);
};
