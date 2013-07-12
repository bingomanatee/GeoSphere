/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Sector) {
	GALAXY._prototypes.Sector = {};
}

/**
 * adds one or more sectors as child
 * @param children
 * @param replace
 */
GALAXY._prototypes.Sector.remove_children = function (children) {
	if (children == 'all') {
		_.each(this.children, function (child) {
			child.reset();
		})
		this.children = [];
	} else {
		var ids = _.pluck(children, 'id');

		function match(child) {
			return _.contains(ids, child.id);
		}

		_.each(
			_.filter(this.children, match),
			function (child) {
				child.reset();
			});

		this.children = _.reject(this.children, match);
	}

	this.reset('children');
};