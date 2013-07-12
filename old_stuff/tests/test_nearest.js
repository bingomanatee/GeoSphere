/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var Planet = require('./../libs/galaxy/Planet');
var chai = require('chai');
var humanize = require('humanize');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;
var _DATA = true;
var COMP_DEPTH = 6;
var RANGE_MIN = -2, RANGE_MAX = 2, RANGE_INCREMENT = 0.5;
var UV_RANGE_INCREMENT = 0.01;
describe('GALAXY.Planet', function () {

	var planet;

	before(function () {
		var time = new Date().getTime();
		planet = new Planet();
		planet.init_iso(COMP_DEPTH);
		var t2 = new Date().getTime();

		if (_DATA) console.log('planet creation: %s detail, %s ms', COMP_DEPTH, t2 - time);
	});

	describe('#nearest_point', function () {

		/**
		 * this test validates the ACCURACY of closest_vertex by comparing its results to a brute force search;
		 * the distance between the closest point should not be greater than the distance to the brute force point
		 * although its possible that two different points are selected because they are equadistant
		 */
		describe('comparing nearest to brute force', function () {

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
				if (_DATA) console.log('testing point, %s tests', samples.length);
				var time = new Date().getTime();
				closest_brute_force = _.map(samples, _brute_closest);
				var t2 = new Date().getTime();

				if (_DATA) console.log('brute force time: %s', t2 - time);
			});

			it('should be able to find the nearest point', function () {
				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample, 0, 0.15);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);
					var brute_closest = closest_brute_force[i];
					try {
						brute_closest.index.should.eql(closest.index);
					} catch (err) {
						var bd = brute_closest.distanceToSquared(sample);
						var cd = closest.distanceToSquared(sample);
						var message = util.format('bad match: brute %s distance %s; closest %s distance %s',
							brute_closest, bd,
							closest, cd
						);
						if (bd != cd) {
							throw new Error(message);
						} else if (_DEBUG) {
							console.log('equadistance point: %s', message);
						}
					}
				})

				var t2 = new Date().getTime();

				if (_DATA) console.log('indexed closest vertex: %s ms', t2 - time);
			})

		})

	})
	describe('#nearest_uv', function () {

		/**
		 * this test validates the ACCURACY of closest_vertex by comparing its results to a brute force search;
		 * the distance between the closest point should not be greater than the distance to the brute force point
		 * although its possible that two different points are selected because they are equadistant
		 */
		describe('comparing nearest to brute force', function () {

			var samples = [];
			var closest_brute_force = [];
			var range = _.range(0, 1, UV_RANGE_INCREMENT);

			function _brute_closest(test) {
				return _.reduce(planet.vertices, function (last, point) {
					if (!last) {
						return point;
					} else if (last.uv.distanceToSquared(test) < point.uv.distanceToSquared(test)) {
						return last;
					} else {
						return point;
					}
				}, null);
			}

			before(function () {
				range.forEach(function (x) {
					range.forEach(function (y) {
						if (x || y) {
							samples.push(new THREE.Vector2(x, y));
						}
					})
				});

				var time = new Date().getTime();
				closest_brute_force = _.map(samples, _brute_closest);
				var t2 = new Date().getTime();

				if (_DATA) console.log('brute force time: %s', t2 - time);
			});

			it('should be able to find the nearest point', function () {
				var time = new Date().getTime();
				var bad = 0;

				samples.forEach(function (sample, i) {
					var closest = planet.closest_uv(sample, 0, 0.15);
					var brute_closest = closest_brute_force[i];
					try {
						brute_closest.index.should.eql(closest.index);
					} catch (err) {
						var bd = brute_closest.uv.distanceToSquared(sample);
						var cd = closest.uv.distanceToSquared(sample);
						var message = util.format('brute %s distance %s; closest %s distance %s distance between %s',
							brute_closest, bd,
							closest, cd,
							brute_closest.distanceTo(closest)
						);
						if (bd != cd) {
							//console.log(message);
							++bad;
						}
					}

				});

				if (_DEBUG) 	console.log('error: %s, samples: %s', bad, samples.length);
				(bad / samples.length).should.be.below(0.1, 'acceptable error rate');

				var t2 = new Date().getTime();

				if (_DATA) console.log('indexed closest uv: %s ms', t2 - time);
			})

		})

	})
})