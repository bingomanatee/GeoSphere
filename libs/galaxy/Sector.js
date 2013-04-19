/**
 * Boilerplate construction
 */

if (typeof module !== 'undefined') {
	var GALAXY = require('./GALAXY');
	require('./Sector/index');
} else {
	if (!window.GALAXY) window.GALAXY = {};
	var GALAXY = window.GALAXY;
}

/**
 * Class Definition
 */

GALAXY.Sector = (function () {

	function Sector(planet, params) {
		this.planet = planet;
		this.vertices = params.vertices;
		this.detail = params.detail;
		this.id = params.id;
		this.parent = params.parent;
	}

	Sector.prototype = GALAXY._prototypes.Sector;
	return Sector;
})();

if (typeof module !== 'undefined') {
	module.exports = GALAXY.Sector;
}