/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Network_Node) {
	GALAXY._prototypes.Network_Node = {};
}

/**
 * exports a node as an array of integers
 * @returns {Array}
 *
 * data pattern:
 * [
 *  index,
 *  x, y, z,
 *  uvx, uvy,
 *  #nears,nearIndex1..nearIndexN,
 *  #children, childIndex1..childIndexN
 *  #parents, parentIndex1..parentIndexN
 *  #influence_parents, infIndex1...infIndexN
 *  ]
 */

GALAXY._prototypes.Network_Node.export = function () {
	var out = [
		['int', this.index]
	];


	out.push(['float', this.vertex.x]);
	out.push(['float', this.vertex.y]);
	out.push(['float', this.vertex.z]);
	out.push(['float', this.vertex.uv.x]);
	out.push(['float', this.vertex.uv.y]);

	out.push(['int', this.near_nodes.length]);
	_.pluck(this.near_nodes, 'index').forEach(function (index) {
		out.push(['int', index]);
	})

	out.push(['int', this.children.length]);
	if (this.children.length) {
		_.pluck(this.children, 'index').forEach(function (index) {
			out.push(['int', index]);
		});
	}

	out.push(['int', this.parents.length]);
	if (this.parents.length) {
		_.pluck(this.parents, 'index').forEach(function (index) {
			out.push(['int', index]);
		});
	}

	return out;
	out.push(['int', this.influence_parents.length]);
	if (this.influence_parents.length) {
		_.pluck(this.influence_parents, 'index').forEach(function (index) {
			out.push(['int', index]);
		});
	}

	return out;
};