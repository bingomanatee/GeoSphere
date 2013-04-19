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
 * computes the three-space center of the manifest of points in the sector.
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Sector.get_center = function () {
	if (!this.center) {
		var verts = this.planet.get_vertices(this.vertices);

		if (verts && verts.length){
			this.center = _.reduce(verts, function(c, v){
				return c.add(v);
			} , new THREE.Vector3(0,0,0));
			this.center.divideScalar(verts.length);
		} else {
			this.center = new THREE.Vector(0,0,0);
		}
		this.center = THREE.spherical_vector(this.center);
	}
	return this.center;

};