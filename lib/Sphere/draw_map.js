var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Canvas = require('canvas');
var Triangle = require('./Triangle');
var lat_lon_to_vertex = require('./../util/lat_lon_to_vertex');
var array_to_canvas = require('./../util/array_to_canvas');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (width, height, file, cb) {
	var data = [];
	var sphere = this;
	var H_SCALE = 180 / height;
	var W_SCALE = 360 / width;

	var last_v, last_v_min_dist, v;

	function _mnd(v) {
		return _.reduce(sphere.neighbors(v  ), function (out, v2) {
			var d = v2.distanceToSquared(v);
			if (_.isNull(out)){
				return out;
			} else {
				return Math.min(out, d);
			}
		}, null);
	}

	var minimum_distance = _.reduce(sphere.vertices(), function (out, v) {
		return Math.min(out, _mnd(v));
	}, _mnd(sphere.vertex(0)));

	_.range(0, width).forEach(function (j) {
		_.range(0, height).forEach(function (i) {
			var lat = 90 - i * W_SCALE;
			var lon = (90 + (j * H_SCALE)) % 360;

			var ll_to_v = lat_lon_to_vertex(lat, lon, true);
			if (last_v) {
				var new_distance = last_v.distanceToSquared(ll_to_v);

				if (new_distance < minimum_distance) {
					// distance to last point is less than the distance between last point and its closests neighbors
					v = last_v;
				} else {
					// transition to new closest point
					v = sphere.closest_point(ll_to_v);
				}
			} else { // first point
				v = sphere.closest_point(ll_to_v);
			}

			last_v = v;

			var index = v.index;
			var color = sphere.vertex_data(index, 'color');
			data.push([color.r, color.g, color.b]);
		});
	});

	var c = array_to_canvas(width, height, data);
	var out = fs.createWriteStream(file), stream = c.pngStream();

	stream.on('data', _.bind(out.write, out));
	stream.on('end', function () {
		process.nextTick(cb);
	});
}