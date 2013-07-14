var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var Earth = require('./../lib/util/Earth');
var _DEBUG = false;
var THREE = require('three');

/* *********************** TEST SCAFFOLDING ********************* */
var about = function (a, b, diff) {
	return Math.abs(a - b) <= diff;
}

function _f(n) {
	return Math.round(n * 100) / 100;
}
function _a(n){
	return Math.round(180 * n/Math.PI);
}
/* ************************* TESTS ****************************** */
tap.test('Earth', function (t) {

	t.test('Starting Radius ', function (t2) {
		var e = new Earth();

		console.log('day: %s', e.day);
		console.log('distance_to_sun: %s, A - C: %s', e.distance_to_sun(), e.A - e.C);
		console.log('angle: %s (%s radians)', e.sun_angle(), e.sun_angle() / (Math.PI))

		t2.ok(about(e.day, 0, 2), 'day is about 0');
		t2.ok(about(e.sun_angle(), 0, 0.1), 'starting angle is 0')
		t2.ok(about(e.distance_to_sun(), e.A - e.C, 50), 'distance_to_sun is about A - C');
		t2.end();
	})

	t.test('Perihelion ', function (t3) {
		var e = new Earth();
		e.day = e.DAYS_PER_YEAR / 4;

		var radius = e.distance_to_sun();
		var rad = Math.sqrt(e.C * e.C + e.B * e.B);

		console.log('---- 1/4 year ---');
		console.log('day: %s', e.day);
		console.log('distance_to_sun: %s, B: %s', radius, e.B);
		console.log('angle: %s (%s radians)', e.sun_angle(), e.sun_angle() / (Math.PI))

		t3.ok(about(e.day, 91, 2), 'day is about 1/4 year');
		t3.ok(about(e.sun_angle(), Math.PI / 2, 0.05), '1/4 year angle is about PI/2');
		t3.ok(about(radius, rad, 50), 'radius after 1/4 year is about Bish');
		t3.end();
	})

	t.test('Distance to sun over a year', function (t4) {
		var e = new Earth();
		_.range(0, 366, 7).forEach(function (d) {
			e.day = d;
			console.log('day: %s, date: %s, angle: %s, radius: %s GM',
				e.day,
				e.date().format('DD-MMM'),
				Math.round(e.sun_angle() * 180 / Math.PI),
				_f(e.distance_to_sun() / e.GM)
			);
		})

		t4.end();
	})

	t.test('Earth Simulation', function (t5) {
		var e = new Earth();
		e.simulation();
		e.update_simulation();

		var m = new THREE.Vector3();
		m.getPositionFromMatrix(e.earth_sphere.matrixWorld);
		var r = new THREE.Vector3();
		r.setEulerFromRotationMatrix(e.earth_sphere.matrixWorld, 'ZYX');

		console.log('first earth position: %s, %s, %s', m.x, m.y, m.z);
		console.log('first earth rotation: %s, %s, %s', _a(r.x), _a(r.y), _a(r.z));

		t5.ok(about(m.x, e.A - e.C, 50), 'distance_to_sun is about A - C');
		t5.ok(about(r.y, 0, 0.1), 'should be about 0 degree rotation at midnight')

		e.hour = 12;
		e.update_simulation();

		var r2 = new THREE.Vector3();
		r2.setEulerFromRotationMatrix(e.earth_sphere.matrixWorld, 'ZYX');

		console.log('earth rotation after 12 hours: %s, %s, %s', _a(r2.x), _a(r2.y), _a(r2.z));

		t5.ok(about(r2.y, Math.PI, 0.1), 'should be about 180 degree rotation at noon')
		t5.ok(about(r2.z, -1 * e.AXIAL_TILT, 0.1), 'axial tilt perserved');

		e.day = e.DAYS_PER_YEAR/4;
		e.hour = 0;
		e.update_simulation();

		var m2 = new THREE.Vector3();
		m2.getPositionFromMatrix(e.earth_sphere.matrixWorld);
		console.log('April 3ish earth position: %s, %s, %s', m2.x, m2.y, m2.z);
		var distance = m2.length();
		var rad = Math.sqrt(e.C * e.C + e.B * e.B);
		var r3 = new THREE.Vector3();
		r3.setEulerFromRotationMatrix(e.earth_sphere.matrixWorld, 'YZX');
		console.log('ration of the earth at midnight on April 3ish: %s, %s, %s', _a(r3.x), _a(r3.y), _a(r3.z));

		t5.ok(about(distance, rad, 50), 'radius after 1/4 year is about Bish');
		t5.ok(about(r3.y, 0, 0.1), 'midight ration at April 3ish is zero');
		t5.ok(about(r3.z, e.AXIAL_TILT, 0.1), 'axial tilt perserved');
		t5.end();
	})
})