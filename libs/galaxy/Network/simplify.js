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
 * runs a function that iterates over a networks higher resolution children.
 * note - influencers are parents and parent nearbys
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.simplify = (function () {

	function simplify(iter, init, fin) {

		if (init) {
			this.each(function (node) {
				init(node, node.children);
			});
		}

		this.each(function(node){
			_.each(node.children, function(child){
				iter(node, child);
			});
		});

		if (fin){
			this.each(function (node) {
				fin(node, node.influencers);
			});
		}
	}

	return simplify;
})();