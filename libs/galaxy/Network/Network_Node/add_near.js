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
 * links points into a network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network_Node.add_near = (function () {

	function add_near(vertex) {
		if (_.isNumber(vertex)) {
			vertex = this.network.planet.get_vertex(vertex);
		}
		var near = this.network.nodes[vertex.index];
		if (!near) {
			near = this.network.make_node(vertex);
			if (_DEBUG)    console.log('made and adding near %s to %s', near.index, this.index);
		}
		this.nears[near.index] = near;
		this.near_nodes = _.values(this.nears);
	}

	return add_near;
})();