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
GALAXY._prototypes.Sector.add_children = function (children, replace, planet) {
	children = _.compact(_.toArray(children));

	if (replace){
		this.remove_children('all');
	}

	if (!this.children){
		this.children = [];
	}
	_.each(children, function(child){
		child.reset();
		child.parent = this;
		child.planet = planet ? planet : this.planet;
		this.children.push(child);
	}, this);

	this.reparent();
};

GALAXY._prototypes.Sector.reparent = function () {

	if (this.children){
		_.each(this.children, function(c){
			c.parent = this;
		}, this)
	}
};