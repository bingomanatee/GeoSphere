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
 * adding/replacing child node
 * @param node {Network_Node}
 */

GALAXY._prototypes.Network_Node.node_to_triangles = function () {

	function _order_nears(list){
		var target = list.pop();
		var out = [target];

		while(list.length){
			if (list.length == 1){
				out.push(list.pop());
			} else {
				var nearest = GALAXY.util.closest_node(target, list);
				list = _.reject(list, function(node){
					return node.index == nearest.index;
				});

				out.push(nearest);
				target = nearest
			}
		}
	}

	/**
	 * returns an arrray of [[vertex, vertex, vertex] .. [v,v,v]];
	 * @param node
	 */
	function make_triangles(node){
		if (!node._nears_ordered){
			node.near_nodes = _order_nears(node.near_nodes);
			node._nears_ordered = true;
		}

		var points = _.map(node.near_nodes, function(node){
			var mid = node.vertex.mid(this.vertex);
			return THREE.spherical_vector(mid);
		}, node);

		node._triangles = [[node.vertex, _.last(points), _.first(points)]];
		var l = points.length;
		for (var i = 1; i < l; ++i){
			node._triangles.push([node.vertex, points[i - 1], points[1]]);
		}
	}

	return function(){
		if (!this._triangles){
			make_triangles(this);
				
		}
		return this._triangles;
	}


};
