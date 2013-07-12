/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
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

if (!GALAXY._prototypes.Sector) {
	GALAXY._prototypes.Sector = {};
}

/**
 * a slimmer summary of the sector
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Sector.toJSON = function () {
	debugger;
	var out = {
		id: this.id,
		name: this.name
	}

	if (this.vertices && this.vertices.length){
		out.vertices = this.vertices;
	}

	if(this.children && this.children.length){
		out. children = _.map(this.children, function(child){
			return child.toJSON();
		})
	}

	return out;
};


GALAXY._prototypes.Sector.report = function () {
	var out = {
		id: this.id,
		name: this.name
	};

	if (this.children && this.children.length){
		out.center = this.center;
		out.c = _.map(this.children, function(s){
			return s.report();
		})
	}

	if (this.vertices && this.vertices.length){
		out.num_verts = this.vertices.length;
	}
	return out;
};