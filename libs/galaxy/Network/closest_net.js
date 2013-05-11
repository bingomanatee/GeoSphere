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

GALAXY._prototypes.Network.closest_net = function (point, depth) {

	var  tested = {};

	var closest = GALAXY.util.closest_node(point, this.node_list, tested);

	if (_DEBUG) console.log("CLOSEST NET: closest initial point to %s \n    at depth %s in network %s \n    is %s", point, depth, this, closest);
	while (closest.network.depth > depth) {
		if (_DEBUG) console.log('   searching children of %s in %s', closest, closest.network);
		closest = GALAXY.util.closest_node(point, closest.children, tested);
		if (_DEBUG) console.log('   .. closest child is %s of network %s', closest, closest.network);
	}

	return closest;
};