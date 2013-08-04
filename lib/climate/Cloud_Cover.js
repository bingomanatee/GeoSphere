var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Canvas = require('canvas');
var Planet = require('./../Planet');
var Gate = require('gate');
var assert = require('assert');

var MONTH_IMAGE_FILES = '01jan,02feb,03mar,04apr,05may,06jun,07jul,08aug,09sep,10oct,11nov,12dec'.split(',');
var IMG_ROOT = path.resolve(__dirname, './../../climate_data/cloud_cover');
assert(fs.existsSync(IMG_ROOT), 'image root exists');
var GLOBAL_CLOUD_REFLECTIVITY = 0.3;

function Cloud_Cover(depth) {
    if (_.isObject(depth)) {
        this.planet = depth;
    } else {
        this.planet = new Planet(depth);
    }

    this.images = {};
}

_.extend(Cloud_Cover.prototype, {

    init: function (callback) {

        var gate = Gate.create();
        var self = this;
        MONTH_IMAGE_FILES.forEach(function (prefix) {
            var canvas = new Canvas(720, 360);
            var l = gate.latch()
                , ctx = canvas.getContext('2d')
                , image_file = path.resolve(IMG_ROOT, prefix + '.png');
            fs.readFile(image_file, function (err, image_data) {

                if (err) throw err;
                img = new Canvas.Image();
                img.src = image_data;
                ctx.drawImage(img, 0, 0, 720, 360);
                var data = ctx.getImageData(0, 0, 720, 360);
                var grey = new Buffer(720 * 360 * 2);
                for (var i = 0; i < data.data.length; i += 4) {
                    grey.writeUInt16LE(Number(data.data[i]), i / 2);
                }
                self.images[prefix] = grey;
                l();
            });
        });

        gate.await(function () {
            self.extract();
            callback();
        });
    },

    extract: function () {
        var self = this;
        var samples = 0;
        var total_cloud_cover = 0;
        this.planet.vertices(function (vertex) {
            var cover = [];

            MONTH_IMAGE_FILES.forEach(function (prefix, i) {
                var grey = self.images[prefix];
                ++samples;

                var x = Math.min(719, Math.round(vertex.uv.x * 720));
                var y = Math.min(Math.round(vertex.uv.y * 360), 359);
                var vertex_cover = grey.readUInt16LE((x + (y * 720)) * 2)/255;
                total_cloud_cover += vertex_cover;

                cover.push(vertex_cover, i * 2);
            });
            vertex.data('cloud_cover', cover);
        });

        var average_cloud_cover = total_cloud_cover / samples;

        var reflection_scale = GLOBAL_CLOUD_REFLECTIVITY / average_cloud_cover;

        this.planet.vertices(function (vertex) {
            var cloud_cover = vertex.data('cloud_cover');
            vertex.data('cloud_reflectivity', cloud_cover.map(function (cover) {
                return cover * reflection_scale;
            }))


        });
    }
});

module.exports = Cloud_Cover;