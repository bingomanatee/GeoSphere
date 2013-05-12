/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Sector = require('./../Sector');
	var util = require('util');
	var Network = require('./../Network');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * creates the isosphere that is the basis of the planet
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.init_networks = function (depth) {
	if (arguments.length < 1) {
		depth = this.depth;
	} else {
		depth = Math.min(depth, this.depth);
	}

	if (!this.networks) {
		this.networks = [];
	}

	_.each(_.range(0, depth + 1), function (d) {
		var network = new Network(this, d);
		this.networks[d] = network;
		if (d > 0) {
			var dd = d - 1;
			var prev_network = this.networks[dd];
			prev_network.link(network);
		}
	}, this);

};