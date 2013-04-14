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

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * creates the isosphere that is the basis of the planet
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.sector_report = function () {

	return _.map(this.sector_tree, function (s) {
		return s.report();
	})

};

GALAXY._prototypes.Planet.get_sectors = function () {
	return _.flatten(_.map(this.sector_tree, function (s) { return s.heritage(); }));
};