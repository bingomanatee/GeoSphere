/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
	var UV_index = require('./../UV_index')
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

GALAXY._prototypes.Network.closest = (function () {
	var cardinals = _.compact(_.flatten(
		_.map([-1, 2, 1], function (x) {
			return _.map([-1, 2, 1], function (y) {
				return _.map([-1, 2, 1], function (z) {
					if (x || y || z){
						return new THREE.Vector3(x, y, z);
					}
				});
			});
		})
	));

	var short_cardinals = [
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(-1, 0, 0),
		new THREE.Vector3(0, -1, 0),
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(0, -1, 0),
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(0, 0, -1),

	]

	var iter = 0;
	//console.log('cardinals: %s', util.inspect(cardinals));

	return function (point, bf) {

		if (_DEBUG) console.log('looking for closest point %s in node_list %s', point, this.node_list.length);
		if (bf || this.node_list.length < 100) {
			var out = GALAXY.util.closest_node(point, this.node_list);
			if (_DEBUG) console.log(' ...... brute force: closest = %s', out);
			return out;
		}

		/**
		 *
		 * initializing an evenly distributed "best start" array.
		 *
		 * note - cardinal vertices are NOT nodes - they are the nodes' vertices.
		 * however they should have the same index.
		 *
		 */
		if (!this._cardinal_vertices) {
			var vertices = _.pluck(this.node_list, 'vertex');
			this._cardinal_vertices = _.map(this.node_list.length > 1000 ? cardinals : short_cardinals, function (c) {
				var out = GALAXY.util.closest_vertex(c, vertices);
				if (_DEBUG) 	console.log('setting cardinal vertex based on %s ... %s(%s)', c, out, out.index);
				return out;
			}, this);
		}

		if (_DEBUG) 	console.log('finding the closest node to the closest cardinal vertex')
		var start = this.last_match ? [this.last_match.vertex].concat(this._cardinal_vertices) : this._cardinal_vertices;
		var closest_cardinal_vertex = GALAXY.util.closest_vertex(point, start);
		if (_DEBUG) 	console.log('network closest cardinal vertex to %s ====> %s(%s of %s) -- distance %s'
			, point, closest_cardinal_vertex, closest_cardinal_vertex.index, this.node_list.length, closest_cardinal_vertex.distanceTo(point));

		var closest_cardinal_node = this.nodes[closest_cardinal_vertex.index];
		var out = closest_cardinal_node.closest(point);
		this.last_match = out;
		return out;
	}
})();
