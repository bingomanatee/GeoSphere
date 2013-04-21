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

GALAXY._prototypes.UV_index.contains_fudge = function (vertex) {
	if (!this.fudge) {
		this.init_fudge(2);
	}

	return (
			(this.fudge.min_x <= vertex.uv.x) &&
			(this.fudge.max_x > vertex.uv.x) &&
			(this.fudge.min_y <= vertex.uv.y) &&
			(this.fudge.max_y > vertex.uv.y)
		);
};

GALAXY._prototypes.UV_index.init_fudge = function (fudge) {
	var local_fudge = this.width() * 2;

	this.fudge = {
		min_x: this.min_x - local_fudge,
		max_x: this.max_x + local_fudge,
		min_y: this.min_y - local_fudge,
		max_y: this.max_y + local_fudge
	}

	_.each(this.children, function(child){
		child.init_fudge(fudge);
	});
};