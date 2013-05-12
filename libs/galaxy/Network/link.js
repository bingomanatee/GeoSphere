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
 * links points into a parent network to the network;
 * parents are lower resolution
 * with a higher detail number
 * and fewer points.
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
		parent_network.child = this;


		function max_near_dist(node) {
			return _.reduce(node.near_nodes, function (o, near) {
				return Math.max(o, near.vertex.distanceTo(node.vertex));
			}, 0);
		}

		this.each(function (node) {
			var parents = node.vertex.parents;
			if (_DEBUG)    console.log('node: %s, parents: %s', node.index, util.inspect(parents));
			node.influencers = [];

			if (parents) {
				var direct_parents = _.map(parents, function (id) {return parent_network.nodes[id]; });
				node.parents = direct_parents;
				node.influencers.push({weight: 2, node: direct_parents[0]});
				node.influencers.push({weight: 2, node: direct_parents[1]});

				var indirect_indexes = _.union(_.pluck(direct_parents[0].nears, 'index'), _.pluck(direct_parents[1].nears, 'index'));
				_.each(indirect_indexes, function (index) {
					node.influencers.push({weight: 1, node: direct_parents[0].network.nodes[index]});
				});
			} else {
				var parent = parent_network.node_list[node.index];
				node.parents = [parent];
				node.influencers.push({weight: 2, node: parent});
				_.each(parent.near_nodes, function (near_node) {
					node.influencers.push({weight: 1, node: near_node});
				});
			}
			if (_DEBUG)    console.log('node linked: %s', node);


			_.each(node.parents, function (parent_node) {

				var dist = parent_node.vertex.distanceTo(node.vertex);

				var mcd = max_near_dist(parent_node);
				if (mcd < dist) {
					return;
				}

				for (var i = 0; i < parent_node.near_nodes.length; ++i){
					if (parent_node.near_nodes[i].index == node.index){
						return;
					}
				}
				parent_node.add_child(node);
			})
		})
	}

	return link;
})();