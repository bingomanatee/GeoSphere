/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var Sector = require('./../Sector');
	var mongoose = require('mongoose');
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

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * The load function
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.each_sector = function (fn, deep, map) {
	if (deep) {
		var sectors = this.get_sectors();
		if (map) {

			return _.map(sectors, fn, this);
		} else {
			sectors.forEach(fn, this);
		}
	} else {
		if (map){
			return _.map(this.sector_tree, fn, this);
		} else {
			this.sector_tree.forEach(fn, this);
		}
	}
};
