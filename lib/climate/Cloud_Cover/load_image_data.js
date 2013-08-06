var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var Canvas = require('canvas');
var Gate = require('gate');

var _DEBUG = false;

/* ------------ CLOSURE --------------- */

var GLOBAL_CLOUD_REFLECTIVITY = 0.3;
var MONTH_IMAGE_FILES = require('./month_image_files.json');

/** ********************
 * Purpose: To load cloud coverage data from source image files
 */

function _image_data_to_greys(image_file, callback) {
    var canvas = new Canvas(720, 360)
        , ctx = canvas.getContext('2d');

    fs.readFile(image_file, function (err, image_data) {
        if (err) return callback(err);
        img = new Canvas.Image();
        img.src = image_data;
        ctx.drawImage(img, 0, 0, 720, 360);
        var data = ctx.getImageData(0, 0, 720, 360);
        var grey = new Buffer(720 * 360 * 2);
        for (var i = 0; i < data.data.length; i += 4) {
            grey.writeInt16LE(Number(data.data[i]), i / 2);
        }
        callback(null, grey);
    });
}


function _raw_data_to_planet(planet, cloud_cover_data) {
    planet.vertices(function (vertex) {
        var cover = [];

        MONTH_IMAGE_FILES.forEach(function (prefix) {
            var grey = cloud_cover_data[prefix];

            var x = Math.min(719, Math.round(vertex.uv.x * 720));
            var y = Math.min(359, Math.round(vertex.uv.y * 360));
            var cover_value = grey.readInt16LE((x + (y * 720)) * 2);
            if (_DEBUG) console.log('month: %s, x: %s, y: %s, cover: %s', prefix, x, y, cover_value);
            cover.push(cover_value);
        });
        vertex.data('cloud_cover', cover);
    });
}

function load_image_data(callback) {
    var GeoSphere = require('./../../../index');
    var gate = Gate.create()
        , cloud_cover_data = {}
        , self = this;

    MONTH_IMAGE_FILES.forEach(function (prefix) {
        var month_latch = gate.latch()
            , image_file = path.resolve(GeoSphere.CLIMATE_ROOT, 'cloud_cover', prefix + '.png');
        assert(fs.existsSync(image_file, 'has cloud cover file ' + image_file));

        _image_data_to_greys(image_file, function (err, greys) {
            if (_DEBUG) console.log('buffer for image %s: 5s', image_file, _.range(0, grey.length, 2).slice(720 * 50, 721 * 50).map(function (i) {
                return greys.readUInt16LE(i);
            }).join(' '));
            cloud_cover_data[prefix] = greys;
            month_latch();
        });
    });

    gate.await(function () {
        _raw_data_to_planet(self.planet, cloud_cover_data);
        callback();
    });
}

/* -------------- EXPORT --------------- */

module.exports = load_image_data;