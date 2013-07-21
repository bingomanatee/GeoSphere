var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var _DEBUG = false;
var THREE = require('three');
var threeE = require('./../lib/util/THREE.ext');
var canvas_to_file = require('./../lib/util/canvas_to_file');
var Planet = require('./../lib/Planet');
var Gate = require('gate');
var fs = require('fs');

/* *********************** TEST SCAFFOLDING ********************* */

var ORDER = 'XZY';
var FRAMES_PER_DAY = 4;

function about(a, b, diff) {
	return Math.abs(a - b) <= diff;
};

function _f(n) {
	return Math.round(n * 100) / 100;
}

function _a(n) {
	return Math.round(180 * n / Math.PI);
}

function _n(n){
	var n = '' + n;
	while(n.length < 4) {
		n = '0' + n;
	}
	return n;
}

function _log_point(msg, v) {
	console.log(msg + '(%s, %s, %s)',
		_f(v.x), _f(v.y), _f(v.z));
}

var _rad_to_deg = 180 / Math.PI;
var W = 720;
var H = 360;

var write_dir = path.resolve(__dirname, '../test_server/public/images');

/* ************************* TESTS ****************************** */
tap.test('Video', {timeout: 1000 * 60 * 3}, function (t) {
	var planet = new Planet(3);
	var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
	var planet_sphere = new THREE.Mesh(planet.iso, material);
	var planet_anchor = new THREE.Mesh(new THREE.CubeGeometry(), material);
	planet_anchor.position.x = -1000;
	planet_anchor.add(planet_sphere);
	var sun_center = new THREE.Mesh(new THREE.CubeGeometry(), material);
	sun_center.add(planet_anchor);

	var sun = new THREE.Mesh(new THREE.CubeGeometry(), material);
	sun.add(sun_center);
	// console.log('planet: %s', util.inspect(planet_sphere));

	var sunlight_vector = new THREE.Mesh(new THREE.CubeGeometry(), material); // the origin of the system

	var gate = Gate.create();
	_.range(0, Math.PI * 2, Math.PI / 32).forEach(function (angle, i) {
		sun_center.rotation.y = angle;
		planet_anchor.rotation.y = -angle;
		sun.updateMatrixWorld();
		var matrix = planet_sphere.matrixWorld;
		var planet_center = new THREE.Vector3().applyProjection(matrix);
		var sun_normal = sunlight_vector.position.clone().sub(planet_center).normalize();
		console.log(' ----------- %s ---------- ', i);
		planet.vertices().forEach(function (v) {
			var v_rel = v.clone().applyProjection(matrix);
			var v_sub = v_rel.clone().sub(planet_center);
			var v_normal = v_sub.normalize();

			var cos = v_normal.dot(sun_normal);
			var c = Math.max(0, cos);
			planet.vertex_data(v.index, 'color', new THREE.Color().setRGB(c, c, c));


			 var angle = Math.round(Math.acos(cos) * _rad_to_deg);
		/*	 console.log('vertex %s: %s (rel %s) planet center %s relative_point  %s normal %s',
			 v.index, v.toString(), v_rel.toString(), planet_center.toString(), v_sub.toString(), v_normal.toString());

			 console.log(' ... sun normal %s', sun_normal.toString());
			 console.log('angle %s', angle);
*/
		})

		var l = gate.latch();
		planet.draw_triangles(W, H, function (err, canvas) {
			var file = path.resolve(write_dir, 'normal_test_' + _n(i) + '.png');
			console.log('written %s', file);
			canvas_to_file(canvas, file, l);
		});
	})

	gate.await(function () {
		process.nextTick(function () {
			t.end();
		});
	})
})