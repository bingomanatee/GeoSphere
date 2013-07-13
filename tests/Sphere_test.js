var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var Sphere = require('./../lib/Sphere');
var THREE = require('three');
var _DEBUG = false;

/* *********************** TEST SCAFFOLDING ********************* */

function _brute_force_closest_point(s, x, y, z) {
	var p3 = new THREE.Vector3(x, y, z);

	return _.reduce(s.vertices(),function (out, v) {
		var d = v.distanceToSquared(p3);
		if (out && out.d < d) {
			return out;
		} else {
			return {d: d, vertex: v};
		}
	}, null).vertex;
}

function _c(n) {
	return ((1 + n) / 2);
}

function _color(vertex) {
	//console.log('colors based on %s, %s, %s', vertex.x, vertex.y, vertex.z);
	var out = new THREE.Color().setRGB(_c(vertex.x), _c(vertex.y), _c(vertex.z));
//	console.log(' ... %s', out.getStyle());
	return out;
}

var SCALE = 2;
var W = 360 * SCALE, H = 180 * SCALE;

/* ************************* TESTS ****************************** */
var TIMEOUT = 1000 * 60 * 80;

tap.test('Sphere', {timeout: TIMEOUT}, function (t) {
	t.test('constructor', function (t2) {
		var sphere0 = new Sphere(0);
		t2.equal(sphere0.vertices().length, 12, '12 points on a sphere depth 0');
		t2.deepEqual(sphere0.near, [
			[ 11, 5, 1, 7, 10 ],
			[ 0, 5, 7, 9, 8 ],
			[ 11, 10, 3, 4, 6 ],
			[ 9, 4, 2, 6, 8 ],
			[ 5, 11, 3, 9, 2 ],
			[ 0, 11, 1, 9, 4 ],
			[ 10, 7, 3, 2, 8 ],
			[ 0, 1, 10, 6, 8 ],
			[ 7, 1, 3, 6, 9 ],
			[ 1, 5, 3, 4, 8 ],
			[ 0, 7, 11, 2, 6 ],
			[ 0, 5, 10, 4, 2 ]
		], 'sphere0 network');

		var sphere1 = new Sphere(1);
		t2.equal(sphere1.vertices().length, 42, '42 points on a sphere depth 1');

		t2.deepEqual(sphere1.near, [
			[ 12, 13, 15, 17, 19 ],
			[ 15, 16, 18, 22, 31 ],
			[ 26, 27, 35, 36, 38 ],
			[ 32, 33, 35, 37, 39 ],
			[ 24, 25, 33, 34, 36 ],
			[ 13, 14, 16, 23, 24 ],
			[ 28, 29, 37, 38, 40 ],
			[ 17, 18, 20, 29, 30 ],
			[ 30, 31, 39, 40, 41 ],
			[ 22, 23, 32, 34, 41 ],
			[ 19, 20, 21, 27, 28 ],
			[ 12, 14, 21, 25, 26 ],
			[ 0, 13, 11, 14, 19, 21 ],
			[ 0, 12, 14, 5, 15, 16 ],
			[ 12, 11, 13, 5, 24, 25 ],
			[ 0, 13, 16, 1, 17, 18 ],
			[ 13, 5, 15, 1, 22, 23 ],
			[ 0, 15, 18, 7, 19, 20 ],
			[ 15, 1, 17, 7, 30, 31 ],
			[ 0, 17, 20, 10, 12, 21 ],
			[ 17, 7, 19, 10, 28, 29 ],
			[ 19, 10, 12, 11, 26, 27 ],
			[ 1, 16, 23, 9, 41, 31 ],
			[ 16, 5, 22, 9, 34, 24 ],
			[ 5, 14, 25, 4, 34, 23 ],
			[ 14, 11, 24, 4, 36, 26 ],
			[ 11, 21, 27, 2, 36, 25 ],
			[ 21, 10, 26, 2, 38, 28 ],
			[ 10, 20, 29, 6, 38, 27 ],
			[ 20, 7, 28, 6, 40, 30 ],
			[ 7, 18, 31, 8, 40, 29 ],
			[ 18, 1, 30, 8, 41, 22 ],
			[ 3, 33, 9, 34, 39, 41 ],
			[ 3, 32, 34, 4, 35, 36 ],
			[ 32, 9, 33, 4, 24, 23 ],
			[ 3, 33, 36, 2, 37, 38 ],
			[ 33, 4, 35, 2, 26, 25 ],
			[ 3, 35, 38, 6, 39, 40 ],
			[ 35, 2, 37, 6, 28, 27 ],
			[ 3, 37, 40, 8, 32, 41 ],
			[ 37, 6, 39, 8, 30, 29 ],
			[ 39, 8, 32, 9, 22, 31 ]
		], 'sphere1 near');

		t2.end();
	});

	t.test('draw', function (t3) {
		var sphere0 = new Sphere(0);
		_.each(sphere0.vertices(), function (v) {
			sphere0.vertex_data(v.index, 'color', _color(v));
		});

		sphere0.draw(W, H, path.resolve(__dirname, '.out/draw_0.png'), function () {

			var sphere1 = new Sphere(1);
			_.each(sphere1.vertices(), function (v) {
				sphere1.vertex_data(v.index, 'color', _color(v));
			});

			sphere1.draw(W, H, path.resolve(__dirname, '.out/draw_1.png'), function () {
				var sphere2 = new Sphere(2);
				_.each(sphere2.vertices(), function (v) {
					sphere2.vertex_data(v.index, 'color', _color(v));
				});

				sphere2.draw(W, H, path.resolve(__dirname, '.out/draw_2.png'), function () {
					var sphere3 = new Sphere(3);
					_.each(sphere3.vertices(), function (v) {
						sphere3.vertex_data(v.index, 'color', _color(v));
					});

					sphere3.draw(W, H, path.resolve(__dirname, '.out/draw_3.png'), function () {
						t3.end();
					});
				});
			});
		});

	});

	t.test('draw_map', {timeout: TIMEOUT}, function (t5) {
		var sphere0 = new Sphere(0);
		_.each(sphere0.vertices(), function (v) {
			sphere0.vertex_data(v.index, 'color', _color(v));
		});

		var start = new Date().getTime();
		var tt = start;

		sphere0.draw_map(W, H, path.resolve(__dirname, '.out/draw_map_0.png'), function () {
			var ttt = new Date().getTime();
			console.log('time 0: %s (%s) ', ttt - start, ttt - tt);
			tt = ttt;

			var sphere1 = new Sphere(1);
			_.each(sphere1.vertices(), function (v) {
				sphere1.vertex_data(v.index, 'color', _color(v));
			});

			sphere1.draw_map(W, H, path.resolve(__dirname, '.out/draw_map_1.png'), function () {
				var ttt = new Date().getTime();
				console.log('time 1: %s (%s) ', ttt - start, ttt - tt);
				tt = ttt;

				var sphere2 = new Sphere(2);
				_.each(sphere2.vertices(), function (v) {
					sphere2.vertex_data(v.index, 'color', _color(v));
				});

				sphere2.draw_map(W, H, path.resolve(__dirname, '.out/draw_map_2.png'), function () {
					var ttt = new Date().getTime();
					console.log('time 2: %s (%s) ', ttt - start, ttt - tt);
					tt = ttt;

					var sphere3 = new Sphere(3);
					_.each(sphere3.vertices(), function (v) {
						sphere3.vertex_data(v.index, 'color', _color(v));
					});

					sphere3.draw_map(W, H, path.resolve(__dirname, '.out/draw_map_3.png'), function () {

						var ttt = new Date().getTime();
						console.log('time 3: %s (%s) ', ttt - start, ttt - tt);
						tt = ttt;

							t5.end();
					});
				});
			});
		});

	});

	t.test('nearest', function (t4) {
		var sphere0 = new Sphere(0);
		var output = [];
		var opb = [];

		_.range(-1, 1.01, 1).forEach(function (x) {
			_.range(-1, 1.01, 1).forEach(function (y) {
				_.range(-1, 1.01, 1).forEach(function (z) {
					var p = sphere0.closest_point(x, y, z);
					var bfp = _brute_force_closest_point(sphere0, x, y, z);
					var from_p = new THREE.Vector3(x, y, z);

					var cp_dist = from_p.distanceToSquared(p);
					var bfp_dist = from_p.distanceToSquared(bfp);
					if (cp_dist != bfp_dist) {
						console.log('bad find: from %s, %s, %s the brute force point %s ' +
							'is closer than the closest_point %s (closest_dist %s, bf dist %s)',
							x, y, z, util.inspect(bfp), util.inspect(p), cp_dist, bfp_dist)

					}

					t.deepEqual(cp_dist, bfp_dist
						, 'found a point equal distance to the closest point. ');

				})
			})
		});

		t4.end();
	});

	t.end();
}); // end  Sphere

