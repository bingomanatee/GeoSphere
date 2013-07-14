var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');
var moment = require('moment');

/* ************************************
 * 
 * ************************************ */

var KM = 1000;
var A = 149598000; // 149,598,000 km major axis of earth orbit around center of ellipse
var B = 149231000; // 149,231,000 km minor axis of earth orbit
var C = 2502000;   // 2,502,000 km deviation of Sun from center of ellipse
var DAYS_PER_YEAR = 365.242;
var E = C / A;
var E2 = E * E;
var GM = 1000.94; // gm Calculations
var AXIAL_TILT = 23 * Math.PI/180;

/* ******* CLOSURE ********* */

function Earth() {
	this.day = 0;
	this.hour = 0;
	this.A = A;
	this.B = B;
	this.C = C;
	this.E = E;
	this.E2 = E2;
	this.DAYS_PER_YEAR = DAYS_PER_YEAR;
	this.GM = GM;
	this.AXIAL_TILT = AXIAL_TILT;
}

Earth.prototype = {
	date:            function () {
		var d = moment('2000-01-03', 'YYYY-MM-DD');
		d.add('days', this.day);
		return d;
	},
	distance_to_sun: function () {
		return this.sun_to_earth().length();
	},
	sun_angle:       function () {
		return Math.PI * 2 * (this.day / this.DAYS_PER_YEAR);
	},
	sun_to_earth:    function () {
		var x = Math.cos(this.sun_angle()) * this.A - this.C;
		var y = Math.sin(this.sun_angle()) * this.B;

		return new THREE.Vector3(x, y, 0); // note - NOT taking orbital rotation at this point.
	},
	earth_to_sun:    function () {
		return sun_to_earth().multiplyScalar(-1);
	},
	simulation:      require('./Earth/simulation')

};

/* ********* EXPORTS ******** */

module.exports = Earth;