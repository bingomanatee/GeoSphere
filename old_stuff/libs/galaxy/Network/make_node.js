/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Network_Node = require('./Node');
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

if (!GALAXY._prototypes.Network) {
	GALAXY._prototypes.Network = {};
}

/**
 * links points into a network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.make_node = (function () {

	function make_node (vertex) {
		var index = _.isNumber(vertex) ? vertex : vertex.index;
		if (this.nodes[index]) return this.nodes[index];

		if (_DEBUG) console.log('making node %s', index);
		var node = new GALAXY.Network_Node(this, vertex);
		this.nodes[index] = node;
		return node;
	}

	return make_node;
})();