/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var THREE = require('three');
var vertices = require('./../../libs/planet/Vertices.js');
var chai = require('chai');
if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = 0;

describe('Vertices', function () {

	describe('categorize', function () {

		describe('multiple category', function () {

			var verts;
			var vert_pts = [new THREE.Vector2(83, 75).divideScalar(100),
				new THREE.Vector2(96, 41).divideScalar(100),
				new THREE.Vector2(91, 3).divideScalar(100),
				new THREE.Vector2(30, 61).divideScalar(100),
				new THREE.Vector2(20, 36).divideScalar(100),
				new THREE.Vector2(52, 53).divideScalar(100),
				new THREE.Vector2(68, 25).divideScalar(100),
				new THREE.Vector2(15, 25).divideScalar(100),
				new THREE.Vector2(69, 53).divideScalar(100),
				new THREE.Vector2(3, 10).divideScalar(100),
				new THREE.Vector2(17, 34).divideScalar(100),
				new THREE.Vector2(55, 39).divideScalar(100),
				new THREE.Vector2(84, 32).divideScalar(100),
				new THREE.Vector2(39, 6).divideScalar(100),
				new THREE.Vector2(56, 15).divideScalar(100),
				new THREE.Vector2(55, 88).divideScalar(100),
				new THREE.Vector2(9, 88).divideScalar(100),
				new THREE.Vector2(23, 93).divideScalar(100),
				new THREE.Vector2(74, 52).divideScalar(100),
				new THREE.Vector2(4, 5).divideScalar(100),
				new THREE.Vector2(66, 22).divideScalar(100),
				new THREE.Vector2(78, 62).divideScalar(100),
				new THREE.Vector2(37, 36).divideScalar(100),
				new THREE.Vector2(11, 85).divideScalar(100),
				new THREE.Vector2(14, 14).divideScalar(100),
				new THREE.Vector2(39, 63).divideScalar(100),
				new THREE.Vector2(64, 99).divideScalar(100),
				new THREE.Vector2(17, 26).divideScalar(100),
				new THREE.Vector2(83, 26).divideScalar(100),
				new THREE.Vector2(32, 28).divideScalar(100),
				new THREE.Vector2(13, 82).divideScalar(100),
				new THREE.Vector2(29, 39).divideScalar(100),
				new THREE.Vector2(58, 43).divideScalar(100),
				new THREE.Vector2(38, 28).divideScalar(100),
				new THREE.Vector2(44, 88).divideScalar(100),
				new THREE.Vector2(27, 82).divideScalar(100),
				new THREE.Vector2(98, 26).divideScalar(100),
				new THREE.Vector2(73, 37).divideScalar(100),
				new THREE.Vector2(10, 74).divideScalar(100),
				new THREE.Vector2(62, 37).divideScalar(100),
				new THREE.Vector2(7, 64).divideScalar(100),
				new THREE.Vector2(71, 66).divideScalar(100),
				new THREE.Vector2(77, 25).divideScalar(100),
				new THREE.Vector2(50, 51).divideScalar(100),
				new THREE.Vector2(43, 78).divideScalar(100),
				new THREE.Vector2(51, 12).divideScalar(100),
				new THREE.Vector2(1, 40).divideScalar(100),
				new THREE.Vector2(18, 94).divideScalar(100),
				new THREE.Vector2(20, 88).divideScalar(100),
				new THREE.Vector2(32, 11).divideScalar(100),
				new THREE.Vector2(29, 49).divideScalar(100),
				new THREE.Vector2(31, 64).divideScalar(100),
				new THREE.Vector2(78, 31).divideScalar(100),
				new THREE.Vector2(89, 40).divideScalar(100),
				new THREE.Vector2(67, 72).divideScalar(100),
				new THREE.Vector2(89, 44).divideScalar(100),
				new THREE.Vector2(25, 23).divideScalar(100),
				new THREE.Vector2(86, 95).divideScalar(100),
				new THREE.Vector2(30, 40).divideScalar(100),
				new THREE.Vector2(88, 36).divideScalar(100),
				new THREE.Vector2(56, 2).divideScalar(100),
				new THREE.Vector2(45, 24).divideScalar(100),
				new THREE.Vector2(54, 33).divideScalar(100),
				new THREE.Vector2(8, 50).divideScalar(100),
				new THREE.Vector2(73, 33).divideScalar(100),
				new THREE.Vector2(7, 86).divideScalar(100),
				new THREE.Vector2(93, 68).divideScalar(100),
				new THREE.Vector2(68, 27).divideScalar(100),
				new THREE.Vector2(68, 23).divideScalar(100),
				new THREE.Vector2(32, 30).divideScalar(100),
				new THREE.Vector2(1, 40).divideScalar(100),
				new THREE.Vector2(70, 53).divideScalar(100),
				new THREE.Vector2(49, 65).divideScalar(100),
				new THREE.Vector2(30, 3).divideScalar(100),
				new THREE.Vector2(59, 98).divideScalar(100),
				new THREE.Vector2(0, 35).divideScalar(100),
				new THREE.Vector2(17, 27).divideScalar(100),
				new THREE.Vector2(41, 10).divideScalar(100),
				new THREE.Vector2(16, 39).divideScalar(100),
				new THREE.Vector2(13, 16).divideScalar(100),
				new THREE.Vector2(35, 78).divideScalar(100),
				new THREE.Vector2(37, 30).divideScalar(100),
				new THREE.Vector2(28, 78).divideScalar(100),
				new THREE.Vector2(92, 83).divideScalar(100),
				new THREE.Vector2(62, 1).divideScalar(100),
				new THREE.Vector2(41, 81).divideScalar(100),
				new THREE.Vector2(51, 71).divideScalar(100),
				new THREE.Vector2(48, 33).divideScalar(100),
				new THREE.Vector2(60, 67).divideScalar(100),
				new THREE.Vector2(27, 98).divideScalar(100),
				new THREE.Vector2(51, 59).divideScalar(100),
				new THREE.Vector2(23, 82).divideScalar(100),
				new THREE.Vector2(60, 87).divideScalar(100),
				new THREE.Vector2(18, 91).divideScalar(100),
				new THREE.Vector2(58, 49).divideScalar(100),
				new THREE.Vector2(64, 62).divideScalar(100),
				new THREE.Vector2(43, 69).divideScalar(100),
				new THREE.Vector2(97, 57).divideScalar(100),
				new THREE.Vector2(12, 23).divideScalar(100),
				new THREE.Vector2(30, 3).divideScalar(100)];

			before(function () {
				verts = new vertices.Vertices({
					vertices: vert_pts
				}, 0.125);

			});


			it('#closest_row to point (0.25, 0.225)', function(){

				var  test_point = new THREE.Vector2(0.25, 0.225);
				var row = verts.closest_row(test_point);
				//console.log('closest row: %s', row);
				row.min_y.should.be.below(test_point.y);
				row.max_y.should.be.above(test_point.y);
				row.min_y_fudge.should.be.below(test_point.y);
				row.max_y_fudge.should.be.above(test_point.y);
			}),

			it('should be able to find point closest to 0.7, 0.4', function () {

				var point = new THREE.Vector2(0.7, 0.4);

				var pt_near = verts.closest(point);
				pt_near.should.eql({
					"x": 0.73,
					"y": 0.37});
			});


			it('should be faster than brute force near search', function () {
				var start_time = new Date().getTime();
				var nears = [];
				var step = 0.01;
				_.each(_.range(0, 1, step), function (x) {
					_.each(_.range(0, 1, 0.01), function (y) {
						var p = new THREE.Vector2(x, y);
						var near = verts.closest(p);
						nears.push([p, near]);
					});
				});

				var end_time = new Date().getTime();
				var q_time = end_time - start_time;

				if (_DEBUG) console.log('%s matches: time %s', nears.length, q_time);

				start_time = new Date().getTime();
				var nears_brute_force = [];
				_.each(_.range(0, 1, step), function (x) {
					_.each(_.range(0, 1, 0.01), function (y) {
						var p = new THREE.Vector2(x, y);
						var near = verts.closest(p, true);
						nears_brute_force.push([p, near]);
					});
				});
				end_time = new Date().getTime();

				var b_time = end_time - start_time;

				if(_DEBUG) console.log('%s brute force matches: time %s', nears_brute_force.length, b_time);

				q_time.should.be.below(b_time);
				//nears.should.eql(nears_brute_force);

				var misses = 0;
				_.each(nears, function (near, i) {
					var match = near[1];
					var brute_match = nears_brute_force[i][1];
					try {
						match.should.eql(brute_match);
					} catch (err) {
						misses++;
						if(_DEBUG)	console.log(
							'comparing %s, cat match %s, brute force match %s'
							, near[0]
							, match
							, brute_match);
					}
				});

				var err_percent = Math.round(
					misses * 100/ nears.length);

			if(_DEBUG) console.log('error rate: %s/%s: %s%',
					misses , nears.length,
					err_percent);
				err_percent.should.be.below(2);
			})

		});
	});

});