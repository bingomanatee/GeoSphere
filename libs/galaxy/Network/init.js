/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
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

if (!GALAXY._prototypes.Network) {
	GALAXY._prototypes.Network = {};
}

/**
 * links points into a network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.init = (function () {

	function init () {
		var sectors = this.planet.sectors_by_detail[this.detail];
		if (_DEBUG) console.log('found %s sectors for detail %s', sectors.length, this.detail);
		_.each(sectors, function(sector){
			_.each(sector.vertices, function(vertex){
				var node = this.make_node(vertex);
				_.each(sector.vertices, function(near_vertex){

					if (vertex != near_vertex){
						if (_DEBUG > 1) console.log('adding near: %s to node %s', near_vertex, node.index);
						node.add_near(near_vertex);
					}
				});
			}, this);
		}, this);

		this.node_list = _.values(this.nodes);
		_.each(this.nodes, function(node){
			node.near_list = _.values(node.nears);
		})

		if (_DEBUG){
			console.log('... %s nodes for detail %s', this.node_list.length, this.detail);
		}

	}

	return init;
})();