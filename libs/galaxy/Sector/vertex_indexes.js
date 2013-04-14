/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
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
 *
 * return the sector whose center is closest to the passed-in point
 * @param uv {THREE.Vector2}
 * @returns {GALAXY.Sector}
 */
GALAXY._prototypes.Sector.vertex_indexes = function () {
	if (this.vertices && this.vertices.length){
		return this.vertices;
	} else	if (!this._vertex_indexes) {
	 if (_DEBUG)	console.log(' setting vertex indexes of %s', this.name)
		if (this.children) {
			if (_DEBUG)	console.log(' ... getting children indexes:')
			this._vertex_indexes = _.flatten(_.map(this.children, function(sector){
				return sector.vertex_indexes();
			}))
			if (_DEBUG)	console.log(' ... sum of %s child vertices: %s', this.name, util.inspect(this._vertex_indexes));

		} else {
			this._vertex_indexes = [];
		}

		this._vertex_indexes = _.uniq(this._vertex_indexes);
	}

	return this._vertex_indexes;

};