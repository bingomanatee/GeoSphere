/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Sector = require('./../Sector');
	var util = require('util');
	var Network = require('./../Network');
	var path = require('path');
	var async = require('async');
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

/**
 * creates the isosphere that is the basis of the planet
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.get_node = function (index, detail) {
	if (!this.networks[detail]){
		throw new Error('cannot get network ' + detail);
	}
	return this.networks[detail].nodes[index];
};