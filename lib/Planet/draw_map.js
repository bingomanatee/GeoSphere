var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Canvas = require('canvas');
var Triangle = require('./Triangle');
var lat_lon_to_vertex = require('./../util/lat_lon_to_vertex');
var array_to_canvas = require('./../util/array_to_canvas');
var Gate = require('gate');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var BLEND_ENDS = [45, 55, 65, 75 , 85, 95];
var BLEND_STARTS = [30, 45, 60, 70, 80, 90];

/* ********* EXPORTS ******** */

module.exports = function (width, height, cb) {
	var data = [];
	var sphere = this;
	var H_SCALE = 180 / height;
	var W_SCALE = 360 / width;
	var index = Math.min(sphere.resolution, BLEND_STARTS.length, BLEND_ENDS.length);

	var BLEND_END = BLEND_ENDS[index];
	var BLEND_START = BLEND_STARTS[index];
	var SPREAD = BLEND_START - BLEND_END;
	var last_v, last_v_min_dist, v;

	function _mnd(v) {
		return _.reduce(sphere.neighbors(v), function (out, v2) {
			var d = v2.distanceToSquared(v);
			if (_.isNull(out)) {
				return out;
			} else {
				return Math.min(out, d);
			}
		}, null);
	}

	var minimum_distance = _.reduce(sphere.vertices(), function (out, v) {
		return Math.min(out, _mnd(v));
	}, _mnd(sphere.vertex(0)));

	var gate = Gate.create();

	_.range(0, width).forEach(function (globalJ) {
		var l = gate.latch();
		var iteration = (function(){
			var j = globalJ;
			return function () {

				_.range(0, height).forEach(function (i) {
					var lat = 90 - i * W_SCALE;

					if (Math.abs(lat) < BLEND_START) {
						data[j * height + i] = [0, 0, 0, 0];
						return;
					}
					var al = Math.abs(lat);
					if (al >= BLEND_END) {
						var alpha = 1;
					} else {
						var alpha = 1 + ((BLEND_END - al)) / SPREAD;
					}
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
					data[j * height + i] = [color.r, color.g, color.b, alpha];
				}); // end foreach;
				l();
			};
		})();
		process.nextTick(iteration);
	});

	gate.await(function () {
		var c = array_to_canvas(width, height, data);
		cb(null, c);
	});
}