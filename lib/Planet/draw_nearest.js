var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Canvas = require('canvas');
var Triangle = require('./Triangle')
var lat_lon_to_vertex = require('./../util/lat_lon_to_Vector3');
var array_to_canvas = require('./../util/array_to_canvas');
var Gate = require('gate');

var canvas_to_file = require('./../util/canvas_to_file');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var BLEND_ENDS = [45, 55, 65, 75 , 85, 95];
var BLEND_STARTS = [30, 45, 60, 70, 80, 90];

/* ********* EXPORTS ******** */

module.exports = function (width, height, callback) {

    if (_.isString(callback)) {
        var file_path = callback;
        var on_done = arguments[3];

        callback = function (err, canvas) {
            canvas_to_file(canvas, file_path, on_done);
        }
    }

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

    _.range(0, width).forEach(function (j) {
        var l = gate.latch();

        _.range(0, height).forEach(function (i) {
            var lat = 90 - i * W_SCALE,
             lon = (90 + (j * H_SCALE)) % 360;

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
            data[j * height + i] = [color.r, color.g, color.b];
        }); // end foreach;
        l();
    });

    gate.await(function () {
        var c = array_to_canvas(width, height, data);
        callback(null, c);
    });
}