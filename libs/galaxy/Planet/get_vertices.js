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

if (!GALAXY._prototypes){
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * returns vertices by their IDs.
 * @param indexes [int]
 * @returns {*}
 */

GALAXY._prototypes.Planet.get_vertices = function (indexes) {

	if (indexes){
		return _.map(indexes, function(index){
			return this.iso.vertices[index];
		}, this);
	} else {
		return this.iso.vertices.slice(0);
	}

};

GALAXY._prototypes.Planet.get_vertex = function(index){
	return this.iso.vertices[index];
};