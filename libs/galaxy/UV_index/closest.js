/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
	var _DEBUG = false;
	var humanize = require('humanize');
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

if (!GALAXY._prototypes.UV_index) {
	GALAXY._prototypes.UV_index = {};
}

GALAXY._prototypes.UV_index.closest = function (vertex, asArray) {
	var verts;

	if (!this.contains(vertex)){
		if (asArray){
			return [];
		} else {
			throw new Error(util.format('vertex not contained by %s', vertex, this));
		}
	}

	if (this.children.length) {

		verts = _.map(this.children, function (uv_index) {
			return uv_index.closest(vertex, true);
		})
	} else {
		verts = this.vertices;
	}

	if (!verts || !verts.length) {
		console.log('cannot find vertices list for %s, %s', this, this.report());
		throw new Error('closest: no list');
	}

	if (asArray){
		return verts;
	}else {
		return GALAXY.util.closest_uv(vertex, _.flatten(verts));
	}
};
