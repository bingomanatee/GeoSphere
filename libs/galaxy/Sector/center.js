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
	if (!this._center) {
		var verts;

		if (this.children && this.children.length) {
			verts = _.map(this.children, function (child) {
				return child.get_center();
			})
		} else {
			verts = this.get_vertices();
		}

		if (verts && verts.length){
			this._center = _.reduce(verts, function(c, v){
				return c.add(v);
			} , new THREE.Vector3(0,0,0));
			this._center.divideScalar(verts.length);
		} else {
			this._center = new THREE.Vector(0,0,0);
		}
		this._center = THREE.spherical_vector(this._center);
	}
	return this._center;

};