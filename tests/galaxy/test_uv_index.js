/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var UV_index = require('./../../libs/galaxy/UV_index');
var chai = require('chai');
var humanize = require('humanize');
var THREE = require('three');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;

describe('UV_index', function () {
	var myUvUndex;

	function _test_index_results_against_brute_results(test_items, index_results, brute_results) {
		var errs = 0;
		test_items.forEach(function (vertex, i) {
			var brute_result = brute_results[i]
			var brute_result_distance_to_test_item = brute_result.uv.distanceToSquared(vertex.uv);
			var index_result = index_results[i];
			var index_result_distance_to_test_item = index_result.uv.distanceToSquared(vertex.uv);
			try {

				brute_result_distance_to_test_item.should.eql(index_result_distance_to_test_item);
			} catch (err) {
				++errs;
			}
		});

		return errs / test_items.length;
	}

	beforeEach(function () {
		myUvUndex = new UV_index();
	});

	it('should be able to create and divide an index', function () {
		myUvUndex.min_x.should.eql(0);
		myUvUndex.max_x.should.eql(1);
		myUvUndex.min_y.should.eql(0);
		myUvUndex.max_y.should.eql(1);
	});

	describe.skip('#divide', function () {

		it('should be able to divide in two', function () {

			myUvUndex.divide(2);
			var children = _.sortBy(myUvUndex.children, function (uv_index) {
				return uv_index.min_x;
			});

			children.length.should.eql(4);

			children[0].min_x.should.eql(0);
			children[0].max_x.should.eql(0.5);
			children[0].min_y.should.eql(0);
			children[0].max_y.should.eql(0.5);

			children[1].min_x.should.eql(0);
			children[1].max_x.should.eql(0.5);
			children[1].min_y.should.eql(0.5);
			children[1].max_y.should.eql(1);

			children[2].min_x.should.eql(0.5);
			children[2].max_x.should.eql(1);
			children[2].min_y.should.eql(0);
			children[2].max_y.should.eql(0.5);

			children[3].min_x.should.eql(0.5);
			children[3].max_x.should.eql(1);
			children[3].min_y.should.eql(0.5);
			children[3].max_y.should.eql(1);
		})
	});

	describe.skip('#match', function () {
		var test_items = [];
		var myUvUndex;

		beforeEach(function () {
			myUvUndex = new UV_index();
			myUvUndex.divide(2);
			myUvUndex.load(test_items);
		})

		before(function () {

			_.range(0, 1, 0.2).forEach(function (x, i) {
				_.range(0, 1, 0.2).forEach(function (y, j) {
					var vertex = new THREE.Vector3(i, j, 0);
					vertex.uv = new THREE.Vector2(x, y);
					test_items.push(vertex);
				})
			});

		})

		it('should be able to find the closest uvs', function () {

			myUvUndex.load(test_items);
			if (_DEBUG)    console.log("\n AFTER CHILDREN LOADED %s ITEMS", test_items.length);
			if (_DEBUG)    console.log(myUvUndex.report());
			myUvUndex.vertices.length.should.eql(0);

			test_items.forEach(function (vertex) {
				var match = myUvUndex.closest(vertex);
				if (_DEBUG)    console.log('MATCH TEST: seeking closest to %s ====> %s', vertex.uv, match.uv);
				match.should.eql(vertex, util.format('%s should be closest to itself', vertex.uv));
			});
		})
	});

	describe.skip('#match - performance', function () {

		var test_items;
		var DIVISOR = 0.01;

		function _brute_closest(test) {
			return _.reduce(test_items, function (last, point) {
				if (!last) {
					return point;
				} else if (last.uv.distanceToSquared(test.uv) < point.uv.distanceToSquared(test.uv)) {
					return last;
				} else {
					return point;
				}
			}, null);
		}

		var test_items = [];
		var myUvUndex;

		beforeEach(function () {
			myUvUndex = new UV_index();
			myUvUndex.divide(2);
			myUvUndex.load(test_items);
		})

		before(function () {
			_.range(0, 1, DIVISOR).forEach(function (x, i) {
				_.range(0, 1, DIVISOR).forEach(function (y, j) {
					var vertex = new THREE.Vector3(i, j, 0);
					vertex.uv = new THREE.Vector2(x, y);
					test_items.push(vertex);
				})
			});
		})

		it('should have a valid _brute_force to compare to', function () {
			test_items.forEach(function (vertex) {
				vertex.uv.should.eql(_brute_closest(vertex).uv);
			})
		});

		it('should be able to find the closest uvs', function () {

			var b1 = new Date().getTime();
			test_items.forEach(function (vertex) {
				_brute_closest(vertex);
			})
			var b2 = new Date().getTime();
			var brute_time = b2 - b1;

			var i1 = new Date().getTime();
			test_items.forEach(function (vertex) {
				myUvUndex.closest(vertex);
			});
			var i2 = new Date().getTime();

			var index_time = i2 - i1;
			if (_DEBUG) console.log('tests: %s, brute time: %s, indexed time: %s', test_items.length, brute_time, index_time);
			(brute_time / 2).should.be.above(index_time);
		})
	});

	_.range(0, 10).forEach(function () {

		describe('#match - random', function () {

			var test_items = [];
			var sample_items;
			var myUvUndex;
			var SAMPLES = 50;
			var TESTS = 10;

			function _brute_closest(test) {
				return _.reduce(sample_items, function (last, point) {
					if (!last) {
						return point;
					} else if (last.uv.distanceToSquared(test.uv) < point.uv.distanceToSquared(test.uv)) {
						return last;
					} else {
						return point;
					}
				}, null);
			}

			before(function () {
				_.range(0, SAMPLES + TESTS).forEach(function () {
					var vertex = new THREE.Vector3(Math.random(), Math.random(), 0);
					vertex.uv = new THREE.Vector2(Math.random(), Math.random());
					test_items.push(vertex);
				})
				sample_items = test_items.slice(TESTS);
				test_items = test_items.slice(0, TESTS);
			});

			beforeEach(function () {
				myUvUndex = new UV_index();
				myUvUndex.divide(2);
				myUvUndex.load(sample_items);
			});

			it('should be able to find the closest uvs', function () {

				var brute_results = [];
				var index_results = [];
				test_items.forEach(function (vertex) {
					index_results.push(myUvUndex.closest(vertex));
					brute_results.push(_brute_closest(vertex));
				});

				_test_index_results_against_brute_results(test_items, index_results, brute_results).should.be.below(0.01);
			})
		});

		describe('#match - random - performance - 2 initial divisions', function () {

			var test_items = [];
			var sample_items;
			var SAMPLES = 50000;
			var TESTS = 1000;

			function _brute_closest(test) {
				return _.reduce(sample_items, function (last, point) {
					if (!last) {
						return point;
					} else if (last.uv.distanceToSquared(test.uv) < point.uv.distanceToSquared(test.uv)) {
						return last;
					} else {
						return point;
					}
				}, null);
			}

			describe(' testing random points', function () {
				var brute_time, index_time, index_results, brute_results, myUvUndex;

				before(function () {
					_.range(0, SAMPLES + TESTS).forEach(function () {
						var vertex = new THREE.Vector3(Math.random(), Math.random(), 0);
						vertex.uv = new THREE.Vector2(Math.random(), Math.random());
						test_items.push(vertex);
					})
					sample_items = test_items.slice(TESTS);
					test_items = test_items.slice(0, TESTS);
				});

				beforeEach(function () {
					myUvUndex = new UV_index();
					myUvUndex.divide(2);
					myUvUndex.load(sample_items);

					brute_results = [];
					var b1 = new Date().getTime();
					test_items.forEach(function (vertex, i) {
						brute_results[i] = _brute_closest(vertex);
					});
					var b2 = new Date().getTime();
					brute_time = b2 - b1;

					index_results = [];
					var i1 = new Date().getTime();
					test_items.forEach(function (vertex, i) {
						index_results[i] = myUvUndex.closest(vertex);
					});
					var i2 = new Date().getTime();
					index_time = i2 - i1;

				})

				it('should be faster doing indexed searches than brute force', function () {
					console.log('tests: %s, brute time: %s, indexed time: %s', test_items.length, brute_time, index_time);
					try {
						index_time.should.be.below(brute_time);
					} catch (err) {
						console.log('slow index: ');
						console.log(myUvUndex.report());
						throw err;
					}
				})

				it('should be accurate', function () {

					var accuracy = _test_index_results_against_brute_results(test_items, index_results, brute_results);
					console.log('accuracy: %s', 100 * (1 - accuracy));
					accuracy.should.be.below(0.01);
				})
			})

		});

		describe('#match - random - performance - 4 initial divisions', function () {

			var test_items = [];
			var sample_items;
			var SAMPLES = 50000;
			var TESTS = 1000;

			function _test_index_results_against_brute_results(test_items, index_results, brute_results) {
				var errs = 0;
				test_items.forEach(function (vertex, i) {
					var brute_result = brute_results[i]
					var brute_result_distance_to_test_item = brute_result.uv.distanceToSquared(vertex.uv);
					var index_result = index_results[i];
					var index_result_distance_to_test_item = index_result.uv.distanceToSquared(vertex.uv);
					try {

						brute_result_distance_to_test_item.should.eql(index_result_distance_to_test_item);
					} catch (err) {
						++errs;
					}
				});

				return errs / test_items.length;
			}

			function _brute_closest(test) {
				return _.reduce(sample_items, function (last, point) {
					if (!last) {
						return point;
					} else if (last.uv.distanceToSquared(test.uv) < point.uv.distanceToSquared(test.uv)) {
						return last;
					} else {
						return point;
					}
				}, null);
			}

			describe(' testing random points', function () {
				var brute_time, index_time, index_results, brute_results, myUvUndex;

				before(function () {
					_.range(0, SAMPLES + TESTS).forEach(function () {
						var vertex = new THREE.Vector3(Math.random(), Math.random(), 0);
						vertex.uv = new THREE.Vector2(Math.random(), Math.random());
						test_items.push(vertex);
					})
					sample_items = test_items.slice(TESTS);
					test_items = test_items.slice(0, TESTS);
				});

				beforeEach(function () {
					myUvUndex = new UV_index();
					myUvUndex.divide(4);
					myUvUndex.load(sample_items);

					brute_results = [];
					var b1 = new Date().getTime();
					test_items.forEach(function (vertex, i) {
						brute_results[i] = _brute_closest(vertex);
					});
					var b2 = new Date().getTime();
					brute_time = b2 - b1;

					index_results = [];
					var i1 = new Date().getTime();
					test_items.forEach(function (vertex, i) {
						index_results[i] = myUvUndex.closest(vertex);
					});
					var i2 = new Date().getTime();
					index_time = i2 - i1;

				})

				it('should be faster doing indexed searches than brute force', function () {
					console.log('tests: %s, brute time: %s, indexed time: %s', test_items.length, brute_time, index_time);
					try {
						index_time.should.be.below(brute_time);
					} catch (err) {
						console.log('slow index: ');
						console.log(myUvUndex.report());
						throw err;
					}
				})

				it('should be accurate', function () {

					var accuracy = _test_index_results_against_brute_results(test_items, index_results, brute_results);
					console.log('accuracy: %s', 100 * (1 - accuracy));
					accuracy.should.be.below(0.01);
				})
			})

		});

		describe('#match - random - performance - 6 initial divisions', function () {

			var test_items = [];
			var sample_items;
			var SAMPLES = 50000;
			var TESTS = 1000;

			function _test_index_results_against_brute_results(test_items, index_results, brute_results) {
				var errs = 0;
				test_items.forEach(function (vertex, i) {
					var brute_result = brute_results[i]
					var brute_result_distance_to_test_item = brute_result.uv.distanceToSquared(vertex.uv);
					var index_result = index_results[i];
					var index_result_distance_to_test_item = index_result.uv.distanceToSquared(vertex.uv);
					try {

						brute_result_distance_to_test_item.should.eql(index_result_distance_to_test_item);
					} catch (err) {
						++errs;
					}
				});

				return errs / test_items.length;
			}

			function _brute_closest(test) {
				return _.reduce(sample_items, function (last, point) {
					if (!last) {
						return point;
					} else if (last.uv.distanceToSquared(test.uv) < point.uv.distanceToSquared(test.uv)) {
						return last;
					} else {
						return point;
					}
				}, null);
			}

			describe(' testing random points', function () {
				var brute_time, index_time, index_results, brute_results, myUvUndex;

				before(function () {
					_.range(0, SAMPLES + TESTS).forEach(function () {
						var vertex = new THREE.Vector3(Math.random(), Math.random(), 0);
						vertex.uv = new THREE.Vector2(Math.random(), Math.random());
						test_items.push(vertex);
					})
					sample_items = test_items.slice(TESTS);
					test_items = test_items.slice(0, TESTS);
				});

				beforeEach(function () {
					myUvUndex = new UV_index();
					myUvUndex.divide(6);
					myUvUndex.load(sample_items);

					brute_results = [];
					var b1 = new Date().getTime();
					test_items.forEach(function (vertex, i) {
						brute_results[i] = _brute_closest(vertex);
					});
					var b2 = new Date().getTime();
					brute_time = b2 - b1;

					index_results = [];
					var i1 = new Date().getTime();
					test_items.forEach(function (vertex, i) {
						index_results[i] = myUvUndex.closest(vertex);
					});
					var i2 = new Date().getTime();
					index_time = i2 - i1;

				})

				it('should be faster doing indexed searches than brute force', function () {
					console.log('tests: %s, brute time: %s, indexed time: %s', test_items.length, brute_time, index_time);
					try {
						index_time.should.be.below(brute_time);
					} catch (err) {
						console.log('slow index: ');
						console.log(myUvUndex.report());
						throw err;
					}
				})

				it('should be accurate', function () {

					var accuracy = _test_index_results_against_brute_results(test_items, index_results, brute_results);
					console.log('accuracy: %s', 100 * (1 - accuracy));
					accuracy.should.be.below(0.01);
				})
			})
		});

	});

});