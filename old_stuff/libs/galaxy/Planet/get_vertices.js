/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
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

/**
 * returns vertices by their IDs.
 * note that there are two "modes" of vertex storage.
 * One uses a THREE.js model of the object,
 * one uses a local store, defined on import of networks.
 *
 * @param indexes [int]
 * @returns {*}
 */

GALAXY._prototypes.Planet.get_vertices = function (indexes) {
	if (this._vertices) {
		if (indexes) {
			return _.map(indexes, function (index) {
				return this._vertices[index];
			}, this);
		} else {
			return this._vertices.slice(0)

		}
	}

	if (indexes) {
		return _.map(indexes, function (index) {
			return this.iso.vertices[index];
		}, this);
	} else {
		return this.iso.vertices.slice(0);
	}

};

GALAXY._prototypes.Planet.get_vertex = function (index) {
	return this._vertices ? this._vertices[index] : this.iso.vertices[index];
};

GALAXY._prototypes.Planet.set_vertex = function (vertex, to_iso) {
	if (to_iso ){
		this.iso.verices[index] = vertex.index;
	} else {
		if (!this._vertices){
			this._vertices = [];
		}
		this._vertices[vertex.index] = vertex;
	}
};