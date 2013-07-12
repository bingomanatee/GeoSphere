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

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.UV_index) {
	GALAXY._prototypes.UV_index = {};
}

GALAXY._prototypes.UV_index.contains = function (vertex) {
	var uv = vertex.uv ? vertex.uv : vertex;
	return (
		(this.min_x <= uv.x) &&
			(this.max_x > uv.x) &&
			(this.min_y <= uv.y) &&
			(this.max_y > uv.y)
		);
};