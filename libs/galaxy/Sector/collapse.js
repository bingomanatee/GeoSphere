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

if (!GALAXY._prototypes.Sector) {
	GALAXY._prototypes.Sector = {};
}

/**
 * absorb the descendants of this sector
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Sector.collapse = function () {

	if (_DEBUG) console.log('--------- COLLAPSING %s ----------', this.name);
	// don't collapse any sector with vertices, or no children
	if (!(this.children.length)) {
		return;
	}

	var new_childs = [];
	var new_verts = [];
	var self = this;

	if (this.children) {
		_.each(this.children, function (child) {
			var children = child.children;
			_.each(children, function (grandchild) {
				grandchild.parent = self;
			});
			new_childs = new_childs.concat(children);

			if (child.vertices) {
				new_verts = new_verts.concat(child.vertices);
			}
		});
	}

	new_childs = _.compact(new_childs);

	this.children = new_childs;
	this.vertices = _.uniq(_.sortBy((this.vertices || []).concat(new_verts), _.identity), true);
	this.reset();
	this.planet.qualify_sectors();
};

/**
 * collapse the lowest level of the tree.
 */
GALAXY._prototypes.Sector.collapse_leaves = (function () {

	return    function () {

		this.reparent();

		var leaves = this.filter(function (sector) {
			return (!sector.children) || (sector.children.length < 1);
		});

		// get all the sectors whose children are all leaves;
		var twigs = _.uniq(
			_.compact(
				_.map(leaves, function (leaf) {
					//console.log('attempting to find parent of leaf  %s ', leaf.name);
					if (leaf.parent) {
						return leaf.parent;
					} else if (leaf.is_top_sector) {
						if (_DEBUG)    console.log('LEAF %s is a parent ', leaf.name);
						return false
					} else {
						console.log('NO PARENT for leaf %s !!!!', leaf.name);
						return false;
					}
				})

			)
		);

		if (_DEBUG) console.log('%s twigs', twigs.length);

		_.each(twigs, function (twig) {
			twig.collapse();
		})

		this.reparent();
		this.planet.qualify_sectors();

	}

})();