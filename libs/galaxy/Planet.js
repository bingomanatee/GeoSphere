/**
 * Boilerplate construction
 */

if (typeof module !== 'undefined') {
	var GALAXY = require('./GALAXY');
	require('./Planet/index');
	require('./util/index');
} else {
	if (!window.GALAXY) window.GALAXY = {};
	var GALAXY = window.GALAXY;
}

/**
 * Class Definition
 */

GALAXY.Planet = (function () {
	var mongoose;

	if (typeof module !== 'undefined') {
		var util = require('util');
		var _ = require('underscore');

		var THREE = require('three');
		mongoose = require('mongoose');

	} else {
		mongoose = false;
	}

	function Planet(options) {
		this.options = options || {}
	}

	Planet.prototype = GALAXY._prototypes.Planet;
	return Planet;
})();

if (typeof module !== 'undefined') {
	module.exports = GALAXY.Planet;
}