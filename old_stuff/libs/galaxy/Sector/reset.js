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
 * Removes all caching
 * @param mode {string} for partial reset
 */
GALAXY._prototypes.Sector.reset = function (mode) {
	this._vertices = null;
	this._center = null;

	switch ('mode') {
		case 'children':
			break;

		default:
			this.parent = null;
	}
};