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

GALAXY._prototypes.UV_index._toString = _.template('uv_index depth <%= depth %>(<%= humanize.numberFormat(min_x, 4) %> ~ <%= humanize.numberFormat(max_x, 4) %>, <%= humanize.numberFormat(min_y, 4) %> ~ <%= humanize.numberFormat(max_y, 4) %>): <%= children %> children, <%= vertices %> vertices: <%= verts %>');
GALAXY._prototypes.UV_index.toString = function () {

	return GALAXY._prototypes.UV_index._toString(
		_.extend({
			children: this.children.length,
			vertices: this.vertices.length,
			verts: this.vertices.join(),
			humanize: humanize
		}, this)

	);

};


GALAXY._prototypes.UV_index.report = function(){
	var out = [this.toString()];
	_.each(this.children, function(child){
		out.push(child.report());
	});

	return out.join("\n");
};