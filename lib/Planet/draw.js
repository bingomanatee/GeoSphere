var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var canvas_to_file = require('./../util/canvas_to_file');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To draw a blended map,
 * combining triangle drawing
 * and polar cap nearest-point mapping
 */

function draw(width, height, callback) {
    var sphere = this;

    if (_.isString(callback)) {
        var file_path = callback;
        var on_done = arguments[3];

        callback = function (err, canvas) {
            canvas_to_file(canvas, file_path, on_done);
        }
    }

    sphere.draw_triangles(width, height, function (err, triangle_canvas) {
        sphere.draw_map(width, height, function (err, polar_canvas) {
            triangle_canvas.getContext('2d').drawImage(polar_canvas, 0, 0);
            callback(null, triangle_canvas);
        })

    });

}

/* -------------- EXPORT --------------- */

module.exports = draw;