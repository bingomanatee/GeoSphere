var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var canvas_to_file = require('./../canvas_to_file');
var THREE = require('three');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */
function _log_point(){

}
/* ********* EXPORTS ******** */

module.exports = function (write_dir, cb, day, hour) {
	var e = this;
	e.day = day || 0;
	e.hour = hour  || 0;
	e.update_simulation();

	//console.log('simulating planet with resolution %s', this.planet.resolution);

	var sunlight_vector = e.sun_to_earth().normalize();
	_log_point('sunlight_vector: ', sunlight_vector);

	var origin = new THREE.Vector3().getPositionFromMatrix(e.earth_sphere.matrixWorld);
	_log_point(' origin: ', origin);

	e.planet.iso.vertices.forEach(function (vertex, i) {
		vertex = vertex.clone().normalize();
		var normal = vertex.clone().applyMatrix4(e.earth_sphere.matrixWorld);
		normal.sub(origin).normalize();

		var dot = normal.dot(sunlight_vector);
		var c = Math.max(0, dot);
		e.planet.vertex_data(i, 'color', new THREE.Color().setRGB(c, c, c));
	});

	e.planet.draw_triangles(720, 360, function (err, c) {
		var file = path.resolve(write_dir, 'sunlight_' + e.day + '.' + e.hour + '.png');
		if (!(day % 10)) console.log('writing %s', file);
		canvas_to_file(c, file, function(){
			cb(null, c);
		});
	});
}