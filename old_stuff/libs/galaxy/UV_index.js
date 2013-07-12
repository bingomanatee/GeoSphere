/**
 * Boilerplate construction
 */

if (typeof module !== 'undefined') {
	var GALAXY = require('./GALAXY');
	require('./UV_index/index');
	require('./util/index');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) window.GALAXY = {};
	var GALAXY = window.GALAXY;
}

/**
 * Class Definition
 */

GALAXY.UV_index = (function () {

	function UV_index(min_x, max_x, min_y, max_y, parent, fudge) {

		this.parent = parent;

		this.min_x = min_x || 0;
		this.max_x = max_x || 1;

		this.min_y = min_y || 0;
		this.max_y = max_y || 1;
		this.vertices = [];
		this.children = [];
	}

	UV_index.prototype = GALAXY._prototypes.UV_index;
	return UV_index;
})();

if (typeof module !== 'undefined') {
	module.exports = GALAXY.UV_index;
}