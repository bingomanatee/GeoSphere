var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */
var SUN_RADIUS = 695500; // 695,500 km
var sunMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var earthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

function _update() {

	this.sun_sphere.rotation.y = this.sun_angle();
	this.earth_center.position.x = this.distance_to_sun();
	this.earth_sphere.rotation.y = (this.day % 1) * 2* Math.PI;
	this.ec_counter_rotation.rotation.y = -1 * this.sun_angle();
	this.sun_sphere.updateMatrixWorld();
}

/* ********* EXPORTS ******** */

module.exports = function () {
	this.sun_sphere = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 12,12), sunMaterial);
	this.earth_sphere = new THREE.Mesh(this.planet.iso, earthMaterial);

	//@TODO: scale planet
	this.earth_center = new THREE.Mesh(new THREE.CubeGeometry(1,1,1));
	this.ec_counter_rotation = new THREE.Mesh(new THREE.CubeGeometry(1,1,1));
	this.ec_counter_rotation.eulerOrder = 'YZX';
	this.earth_axial_tilt = new THREE.Mesh(new THREE.CubeGeometry(1,1,1));
	this.sun_sphere.add(this.earth_center);
	this.earth_center.add(this.ec_counter_rotation);
	this.ec_counter_rotation.add(this.earth_axial_tilt);
	this.earth_axial_tilt.add(this.earth_sphere);
	this.earth_axial_tilt.rotation.z = this.AXIAL_TILT;

	this.update_simulation = _.bind(_update, this);

	this.write_illumination = require('./write_illumination');

}; // end export function