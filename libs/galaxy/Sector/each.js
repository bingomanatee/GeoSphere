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
 * executes a method on this sectors and all its children
 *
 * @param method {function}
 */

GALAXY._prototypes.Sector.each = function (method) {
	method(this);
	_.each(this.children, function(child){
		child.each(method);
	})

};

/**
 * return all sectors for whom method (sector) is truthy.
 * Polls heritage: called sector and all children, but not parents.
 *
 * @param method
 * @returns {*}
 */

GALAXY._prototypes.Sector.filter = function(method){
	return _.filter(this.heritage(), method);
};

/**
 * returns a flat list of called sector and all children, but not parents.
 * No guarantee of the order of the sectors.
 * @returns {*}
 */
GALAXY._prototypes.Sector.heritage = function(){
	return _.reduce(this.children, function(out, child){
		return out.concat(child.heritage());
	}, [this]);
};

GALAXY._prototypes.Sector.ancestors = function(){
	if (this.parent){
		return this.parent.ancestors().concat([this]);
	}	 else{
		return [this]
	}
};

/**
 * Calls reduce on the sectors' heritage.
 * @param method
 * @param seed
 * @returns {*}
 */
GALAXY._prototypes.Sector.reduce = function(method, seed){
	return _.reduce(this.heritage(), method, seed);
};