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
 *
 * runs a function that iterates over a networks lower resolution parents.
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.inherit = (function () {

	function inherit(iter, init, fin) {

		if (init) {
			this.each(function (node) {
				init(node, node.influencers);
			})
		}

		this.each(function (node) {
			if (init) {
				init(node, node.influencers);
			}
			_.each(node.parents, function (parent) {
				iter(node, parent);
			});

		});

		if (fin) {
			this.each(function (node) {
				fin(node, node.influencers);
			})
		}
	}

	return inherit;
})();