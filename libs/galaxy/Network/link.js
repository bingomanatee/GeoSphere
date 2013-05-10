/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Network_Node = require('./Node');
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

if (!GALAXY._prototypes.Network) {
	GALAXY._prototypes.Network = {};
}

/**
 * links points into a parent_network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.link = (function () {

	function link(parent_network) {
		if (!(parent_network.detail == (this.detail + 1))) {
			throw new Error('must link to networks 1 less detail than yours (' + (this.detail - 1) + ')');
		}

		this.parent = parent_network;

		this.each(function (node) {
			var parents = node.vertex.parents;
			if (_DEBUG)    console.log('node: %s, parents: %s', node.index, util.inspect(parents));

			if (parents) {
				node.parents = _.map(parents, function (id) {return parent_network.nodes[id]; });
			} else {
				node.parents = [parent_network.node_list[node.index]];
			}
			if (_DEBUG)    console.log('node linked: %s', node);

			_.each(node.parents, function (parent_node) {
				parent_node.children.push(node);
			})
		})
	}

	return link;
})();