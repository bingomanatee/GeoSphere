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
var _DATA = true;
var QUICK_DEPTH = 2;
var COMP_DEPTH = 4;
var STRESS_DEPTH = 4;
var RANGE_INCREMENT_SHORT = 2, RANGE_SHORT_MIN = -5, RANGE_SHORT_MAX = 5;
var RANGE_MIN = -2, RANGE_MAX = 2, RANGE_INCREMENT = 0.5;
var RANGE2_MIN = -2, RANGE2_MAX = 2, RANGE2_INCREMENT = .5;

describe('GALAXY.Planet', function () {

	/**
	 * this test validates that you can find a sector closest to a given point.
	 * This is an internal method used to find the closest vertex to a point.
	 */
	describe('#nearest_sector', function () {

		var planet;

		var samples = [];

		before(function () {
			planet = new Planet();
			planet.init_iso(QUICK_DEPTH);

			if (_DEBUG) console.log('making ranges');
			var ranges = _.range(RANGE_SHORT_MIN, RANGE_SHORT_MAX, RANGE_INCREMENT_SHORT);

			ranges.forEach(function (x) {
				ranges.forEach(function (y) {
					ranges.forEach(function (z) {
						if (x || y || z) {
							samples.push(new THREE.Vector3(x, y, z));
						}
					});
				})
			})
			if (_DATA) console.log('testing iso depth %s, %s tests', QUICK_DEPTH, samples.length);
		});

		describe('nearest sector', function () {
			var output;

			before(function () {

				output = _.map(samples, function (sample) {

					var out = {
						closest_sectors: planet.closest_top_sectors(sample, 0.05),
						closest:         planet.closest_top_sector(sample)
					};

					out.id = out.closest.id;
					out.distance = out.closest.get_center().distanceToSquared(sample);
					out.ids = _.pluck(out.closest_sectors, 'id');
					out.distances = _.map(out.closest_sectors, function (sector) {
						return sector.get_center().distanceToSquared(sample);
					})
					out.max_distance = _.max(out.distances);

					return out;
				})
			})

			it('should be able to find the nearest sector', function () {
				output.forEach(function (out) {
					out.distances.forEach(function (distance) {
						Math.sqrt(out.max_distance).should.be.below(Math.sqrt(distance)  + 0.25)
					})
				})
			})

		})

	});

	describe('#nearest_point', function () {

		/**
		 * this test validates the ACCURACY of closest_vertex by comparing its results to a brute force search;
		 * the distance between the closest point should not be greater than the distance to the brute force point
		 * although its possible that two different points are selected because they are equadistant
		 */
		describe('comparing nearest to brute force', function () {

			var planet;

			var samples = [];
			var range = _.range(RANGE_MIN, RANGE_MAX + RANGE_INCREMENT, RANGE_INCREMENT)

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
			});

			beforeEach(function () {
				var time =  new Date().getTime();
				planet = new Planet();
				if (_DEBUG) console.log('init iso...')
				planet.init_iso(COMP_DEPTH);
				if (_DEBUG) console.log('done init iso')
				if(_DATA) console.log('planet creation: %s ms', new Date().getTime() - time);
			})

			function _brute_closest(test) {
				return _.reduce(planet.get_vertices(), function (last, point) {
					if (!last) {
						return point;
					} else if (last.distanceToSquared(test) < point.distanceToSquared(test)) {
						return last;
					} else {
						return point;
					}
				}, null);
			}

			it('should be able to find the nearest point', function () {

				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample, 0, 0.15);
					if (_DEBUG ) console.log('point %s %s closest %s', i, sample, closest);
					var brute_closest = _brute_closest(sample);
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
			})

		})

		/**
		 * thes tests find the time required to find a gien point,
		 * not comparing to brute force
		 * which is massively long for a high res mesh.
		 */
		describe('stress test', function () {

			var planet;

			var samples = [];
			var range = _.range(RANGE2_MIN, RANGE2_MAX + RANGE2_INCREMENT, RANGE2_INCREMENT)

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
				if (_DATA) console.log('testing iso depth %s, %s tests', STRESS_DEPTH, samples.length);
				var time = new Date().getTime();
				planet = new Planet();
				if (_DEBUG) console.log('init iso...')
				planet.init_iso(STRESS_DEPTH);
				if (_DEBUG) console.log('done init iso')
				if(_DATA) console.log('planet creation: %s ms', new Date().getTime() - time);
			})

			it('should be able to find the closest_top_sector', function () {

				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_top_sector(sample);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);

				});

				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('closest_top_sector: %s ms', sector_vertex_time);
			})


			it('should be able to find the closest_sectors_at_detail', function () {

				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_sectors_at_detail(sample, 0, 0.15);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);

				});

				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('closest_sectors_at_detail: %s ms', sector_vertex_time);
			})


			it('should be able to find the closest_vertex', function () {

				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample, 0, 0.15);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);

				});

				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('closest_vertex: %s ms', sector_vertex_time);
			})


		})

	})
})