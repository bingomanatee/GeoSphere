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

GALAXY._prototypes.UV_index.threshold = function (count) {
	if (this.children.length && this.vertices.length) {
		// should never happen
		this.redistribute();
	} else if (this.vertices.length > count) {
		this.divide(this.divisions || this.parent.divisions);
		this.redistribute();
	}

	_.each(this.children, function (uv_index) {
		uv_index.threshold(count);
	});

};