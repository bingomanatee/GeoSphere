/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var Planet = require('./../../libs/galaxy/Planet');
var chai = require('chai');
var humanize = require('humanize');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;

describe('GALAXY.Planet', function () {
	describe('drawing sectors', function () {
		var planet;

		var samples = [];
		var closest_brute_force = [];
		var range = _.range(RANGE_MIN, RANGE_MAX + RANGE_INCREMENT, RANGE_INCREMENT)

		function _brute_closest(test) {
			return _.reduce(planet.vertices, function (last, point) {
				if (!last) {
					return point;
				} else if (last.distanceToSquared(test) < point.distanceToSquared(test)) {
					return last;
				} else {
					return point;
				}
			}, null);
		}

		before(function () {
			range.forEach(function (x) {
				range.forEach(function (y) {
					range.forEach(function (z) {
						if (x || y || z) {
							samples.push(new THREE.Vector3(x, y, z).normalize());
						}
					});
				})
			})
			if (_DATA) console.log('testing iso depth %s, %s tests', COMP_DEPTH, samples.length);
			var time = new Date().getTime();
			planet = new Planet();
			planet.init_iso(COMP_DEPTH);
			var t2 = new Date().getTime();

			if (_DATA) console.log('planet creation: %s ms', t2 - time);

			closest_brute_force = _.map(samples, _brute_closest)
			var t3 = new Date().getTime();

			if (_DATA) console.log('brute force time: %s', t3 - t2);
		})

	})
})