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

	function Sector(planet, id, name, depth) {
		this.planet = planet;
		this.id = id;
		this.name = name;
		this.depth = depth;
	}

	Sector.prototype = GALAXY._prototypes.Sector;
	return Sector;
})();

if (typeof module !== 'undefined') {
	module.exports = GALAXY.Sector;
}