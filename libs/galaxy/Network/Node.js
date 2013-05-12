/**
 * Boilerplate construction
 */

if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	require('./Network_Node/index');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) window.GALAXY = {};
	var GALAXY = window.GALAXY;
}

/**
 * Class Definition
 */

GALAXY.Network_Node = (function () {

	var nid = 0;

	function Network_Node(network, vertex) {
		if (!network instanceof GALAXY.Network){
			throw new Error('node made with non-network %s', util.inspect(network));
		}
		this.nid = ++nid;
		this.data = {};
		this.nears = {};
		this.near_nodes = [];
		this.parents = [];
		this.children = [];
		this.influence_parents = [];
		this.near_nodes = [];
		this.network = network;

		if(arguments.length < 2) {
			return;
		}

		if (_DEBUG) console.log('creating network node %s for network %s', vertex, util.inspect(network, false, 0));
		if (_.isNumber(vertex)){
			vertex = network.planet.get_vertex(vertex);
		}
		this.vertex = vertex;
		this.index = vertex.index;
		this.detail = network.detail;
		this.uv = vertex.uv;
	}

	Network_Node.prototype = GALAXY._prototypes.Network_Node;
	return Network_Node;
})();

if (typeof module !== 'undefined') {
	module.exports = GALAXY.Network_Node;
}