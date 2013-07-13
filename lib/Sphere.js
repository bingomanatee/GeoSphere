var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');
var Canvas = require('canvas');

var _v2 = _.template('(<%= Math.round(x * 100) %>, <%= Math.round(y * 100) %>)');

THREE.Vector2.prototype.toString = function () {
	return _v2(this);
}

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function Sphere(resolution, radius) {
	this.resolution = resolution || 0;
	this.radius = radius || 1;
	this.iso = new THREE.IcosahedronGeometry(this.radius, this.resolution);
	this.network();

}

Sphere.prototype = {
	vertices: function () {
		return this.iso.vertices;
	},

	vertex: function(n){
		return this.iso.vertices[n];
	},

	vertex_data: require('./Sphere/vertex_data'),

	network: function () {
		this.near = [];
		this.iso.faces.forEach(function (face) {
			var points = [face.a, face.b, face.c];
			points.forEach(function (point) {
				if (!this.near[point]) {
					this.near[point] = [];
				}
				this.near[point].push(face.a, face.b, face.c);
			}, this);
		}, this);

		this.near = _.map(this.near, function (points, i) {
			return _.difference(_.uniq(points), [i]);
		})
	},

	neighbors: require('./Sphere/neighbors'),

	closest_point: require('./Sphere/closest_point'),

	draw_triangles: require('./Sphere/draw_triangles'),

	draw_map: require('./Sphere/draw_map'),

	draw: function(width, height, callback){
		var sphere = this;

		sphere.draw_triangles(width, height, function(err, triangle_canvas){
			sphere.draw_map(width, height, function(err, polar_canvas){
				triangle_canvas.getContext('2d').drawImage(polar_canvas, 0, 0);
				callback(null, triangle_canvas);
			})

		});

	}
};

/* ********* EXPORTS ******** */

module.exports = Sphere;