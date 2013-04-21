/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
	var humanize = require('humanize');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
	var humanize = require('humanize');
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.UV_index) {
	GALAXY._prototypes.UV_index = {};
}

function _n(value) {
	return humanize.numberFormat(value, 2);
};

GALAXY._prototypes.UV_index._toString = _.template('uv_index depth <%= depth %>(<%= min_x %> ~ <%= max_x %>, <%= min_y %> ~ <%= max_y %>): <%= children %> children, <%= vertices %> vertices');
GALAXY._prototypes.UV_index.toString = function () {

	return GALAXY._prototypes.UV_index._toString(
		{
			depth:    this.depth(),
			min_x:    _n(this.min_x),
			max_x:    _n(this.max_x),
			min_y:    _n(this.min_y),
			max_y:    _n(this.max_y),
			children: this.children.length,
			vertices: this.vertices.length
		}
	);

};


GALAXY._prototypes.UV_index.report = function(){
	var out = [this.toString()];
	_.each(this.children, function(child){
		out.push(child.report());
	});

	return out.join("\n");
};