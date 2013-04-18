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
 * The load function
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.get_vertices = function (indexes) {

	var vertices = this.iso.vertices;

	if (indexes){
		return _.map(indexes, function(index){
			return vertices[index];
		});
	} else {
		return vertices;
	}

};


GALAXY._prototypes.Planet.get_vertex = function(index){
	return this.iso.vertices[index];
};