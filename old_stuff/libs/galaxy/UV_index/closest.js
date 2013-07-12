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

	//console.log('looking for closest to %s in %s', util.inspect(vertex), this);

	if (!this.contains(vertex)){
		if (asArray){
			return [];
		} else {
			throw new Error(util.format('vertex not contained by %s', vertex, this));
		}
	}

	if (this.children.length) {
		verts =  _.compact(_.flatten([ _.map(this.children, function (uv_index) {
			return uv_index.closest(vertex, true);
		}), this.vertices]));
	} else if (this.vertices.length){
		verts = this.vertices;
	} else {
		return [];
	}

	if (!verts || !verts.length) {
		//console.log('cannot find vertices list for %s, %s', this, this.report());
		return asArray ? [] : false;
		//throw new Error('closest: no list');
	}

	//console.log('verts: %s', util.inspect(verts));

	if (asArray){
		return _.compact(verts);
	}else {
	//	console.log('returning util closest from %s', util.inspect(verts));
		return GALAXY.util.closest_uv(vertex, _.flatten(verts));
	}
};
