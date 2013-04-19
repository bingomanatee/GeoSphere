/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Sector = require('./../Sector');
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

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * creates the isosphere that is the basis of the planet
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.init_iso = function (depth) {
	if (!depth) {
		depth = this.options.depth || 0;
	}

	this.iso = new THREE.IcosahedronGeometry(1, depth);
	this.vertices = this.iso.vertices;
	this.sectors = _.map(this.iso.sectors, function(data){
		return new Sector(this, data);
	}, this);

	this.index_sectors();
	this.options.depth = depth;


};