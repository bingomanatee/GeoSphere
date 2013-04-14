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
var STRESS_DEPTH = 6;
var RANGE_INCREMENT_SHORT = 1, RANGE_SHORT_MIN = -5, RANGE_SHORT_MAX = 5;
var RANGE_MIN = -5, RANGE_MAX = 5, RANGE_INCREMENT = 0.25;
var RANGE2_MIN = -5, RANGE2_MAX = 5, RANGE2_INCREMENT = 1;

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
			planet.make_index();
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

		if (_DATA) {
			it('sector centers', function () {

				console.log(' ============ sector report ============= ');
				_.each(planet.sector_tree, function (sector) {
					var c = sector.center;
					console.log('%s, %s, %s, %s', sector.id, c.x, c.y, c.z)
				});
				console.log(' ============ end sector report ============= ');
			});
		}

		describe('nearest sector', function () {
			var output;

			before(function () {

				output = _.map(samples, function (sample) {

					var out = {
						closest_sectors: planet.closest_sectors(sample, 0.05),
						closest:         planet.closest_sector(sample)
					};

					out.id = out.closest.id;
					out.distance = out.closest.center.distanceToSquared(sample);
					out.ids = _.pluck(out.closest_sectors, 'id');
					out.distances = _.map(out.closest_sectors, function (sector) {
						return sector.center.distanceToSquared(sample);
					})
					out.max_distance = _.max(out.distances);

					return out;
				})
			})

			it('should be able to find the nearest sector', function () {
				output.forEach(function (out) {
					out.distances.forEach(function (distance) {
						out.max_distance.should.be.below(distance * 1.05)
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
				planet.make_index();
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
					var closest = planet.closest_vertex(sample);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);
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

			/**
			 * these tests benchmark the time taken to find the closest point compared to
			 * the brute force time -- seeing if collapsing the downstream sectors improves efficiency
			 */
			it('should find the nearest point faster than brute force - 1 collapse leaves', function () {
				planet.sector_tree.forEach(function (s) {
					s.collapse_leaves();
				});

				var time = new Date().getTime();

				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample);
				})

				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('sector vertex search: %s ms', sector_vertex_time);

				var time3 = new Date().getTime();

				samples.forEach(function (sample, i) {
					var closest = _brute_closest(sample);
				})

				var time4 = new Date().getTime();

				var brute_force_time = time4 - time3;
				if (_DATA)    console.log('sector brute force vertex search: %s ms', brute_force_time);

				brute_force_time.should.be.above(sector_vertex_time);

				if (_DATA) {
					var time5 = new Date().getTime();

					samples.forEach(function (sample, i) {
						var closest = planet.closest_sectors(sample);
					});

					var time6 = new Date().getTime();

					console.log('closest_sectors: %s ms', time6 - time5);
				}

			})
			it('should find the nearest point faster than brute force - 2 collapse leaves, one collapse', function () {
				planet.sector_tree.forEach(function (s) {
					s.collapse_leaves();
					s.collapse_leaves();
					s.collapse();
				});

				var time = new Date().getTime();

				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample);
				})

				var time2 = new Date().getTime();
				console.log("\n");
				console.log('sector vertex search: %s ms', time2 - time);

				var time3 = new Date().getTime();

				samples.forEach(function (sample, i) {
					var closest = _brute_closest(sample);
				})

				var time4 = new Date().getTime();

				console.log('sector brute force vertex search: %s ms', time4 - time3);

				var time5 = new Date().getTime();

				samples.forEach(function (sample, i) {
					var closest = planet.closest_sectors(sample);
				});

				var time6 = new Date().getTime();

				console.log('closest_sectors: %s ms', time6 - time5);

			})
			it('should find the nearest point faster than brute force - 3 collapse leaves', function () {
				planet.sector_tree.forEach(function (s) {
					s.collapse_leaves();
					s.collapse_leaves();
					s.collapse_leaves();
				});

				var time = new Date().getTime();

				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample);
				})

				var time2 = new Date().getTime();
				if (_DATA)    console.log("\n");
				if (_DATA)    console.log('sector vertex search: %s ms', time2 - time);

				var time3 = new Date().getTime();

				samples.forEach(function (sample, i) {
					var closest = _brute_closest(sample);
				})

				var time4 = new Date().getTime();

				if (_DATA)    console.log('sector brute force vertex search: %s ms', time4 - time3);

				if (_DATA) {
					var time5 = new Date().getTime();

					samples.forEach(function (sample, i) {
						var closest = planet.closest_sectors(sample);
					});

					var time6 = new Date().getTime();

					console.log('closest_sectors: %s ms', time6 - time5);
				}

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
				planet.make_index();
				if(_DATA) console.log('planet creation: %s ms', new Date().getTime() - time);
			})

			it('should be able to find the nearest point', function () {

				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);


				})
				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('sector vertex search: %s ms', sector_vertex_time);
			})

			/**
			 * collapsing the sector tree. Note that unlike the previous tests,
			 * only one planet is used and successively collapsed
			 * due to its awesome bigness.
			 */
			it('should find the nearest vertex - 1 collapse leaves', function () {
				planet.sector_tree.forEach(function (s) {
					s.collapse_leaves();
				});


				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);


				})
				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('sector vertex search: %s ms', sector_vertex_time);

			})
			it('should find the nearest vertex - 2 collapse leaves, one collapse', function () {
				planet.sector_tree.forEach(function (s) {
					s.collapse_leaves();
					s.collapse();
				});

				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);


				})
				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('sector vertex search: %s ms', sector_vertex_time);

			})
			it('should find the nearest vertex - 3 collapse leaves, one collapse', function () {
				planet.sector_tree.forEach(function (s) {
					s.collapse_leaves();
				});

				var time = new Date().getTime();
				samples.forEach(function (sample, i) {
					var closest = planet.closest_vertex(sample);
					if (_DEBUG) console.log('point %s %s closest %s', i, sample, closest);


				})
				var time2 = new Date().getTime();

				var sector_vertex_time = time2 - time;
				if (_DATA) console.log("\n");
				if (_DATA) console.log('sector vertex search: %s ms', sector_vertex_time);
			})

		})

	})
})