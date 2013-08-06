var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');

var GeoSphere = require('./../../index.js');
var CLOUD_ROOT = path.resolve(GeoSphere.CLIMATE_BINARY, 'cloud_cover');
var BINARY_FILE = path.resolve(CLOUD_ROOT, 'depth_%s.bin');
var MONTH_VALIDATION_FILE = path.resolve(CLOUD_ROOT, 'month_%s_depth_%s.validation.png');
var WRITTEN_VALIDATION_MSG = ' ... written validation file for depth %s, month %s';

var DONE_DEPTH_MSG = ' ----------- DONE WITH DEPTH %s ---------------';

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: save raw data into binary summary files.
 */

function write_albedo_data(MIN_DEPTH, MAX_DEPTH, WIDTH, HEIGHT) {
    if (!fs.existsSync(CLOUD_ROOT)) fs.mkdir(CLOUD_ROOT);

    var script = [];

    _.range(MIN_DEPTH, MAX_DEPTH + 1).forEach(function (depth) {

        script.push(_load_image_data(depth, WIDTH, HEIGHT));

        script.push(_load_binary_data(depth, WIDTH, HEIGHT));

        script.push(function(callback){
            console.log(DONE_DEPTH_MSG, depth);
            callback();
        })
    });

    async.series(script, function () {
        console.log("\n\n ----- DONE WRITING CLOUDS %s... %s ------\n\n", MIN_DEPTH, MAX_DEPTH);
    });
}

function _load_image_data(depth, width, height) {
    return function (callback) {
        var cloud = new GeoSphere.climate.Cloud_Cover(depth);

        var WRITTEN_PREVIEW_FILE = util.format(' ... written preview file for depth %s, month %s', cloud.planet.depth, '%s');
        var MONTH_PREVIEW_FILE = util.format(path.resolve(CLOUD_ROOT, 'month_%s_depth_%s.preview.png'), '%s', cloud.planet.depth);
        var binary_file = util.format(BINARY_FILE, cloud.planet.depth);

        cloud.load_image_data(function (err) {
            var script = [];
            _.range(0, 12).forEach(function (month) {
                script.push(_write_preview(
                    cloud, month,
                    util.format(MONTH_PREVIEW_FILE, month),
                    util.format(WRITTEN_PREVIEW_FILE, month),
                    width, height));
            });

            script.push(_save_binary_data(cloud, binary_file));

            async.series(script, function () {
                console.log('done saving binary data.');
                callback();
            });
        });
    }
}

function _write_preview(cloud, month, file, msg, width, height) {
    return function (callback) {
        console.log('starting to write file %s ... ', file);
        cloud.draw(file, month, function () {
            if (msg) {
                console.log(msg);
                callback(null);
            }
        }, width, height)
    }
}

function _save_binary_data(cloud, binary_file) {
    return function (callback) {
        console.log('saving binary file %s', binary_file);
        cloud.export(binary_file, callback);
    }
}

function _load_binary_data(depth, width, height) {

    return function (callback) {
        var cloud = new GeoSphere.climate.Cloud_Cover(depth);
        cloud.import(util.format(BINARY_FILE, depth), function () {

            var script = [];
            _.range(0, 12).forEach(function (month) {
                script.push(_write_preview(cloud, month,
                    util.format(MONTH_VALIDATION_FILE, month, depth),
                    util.format(WRITTEN_VALIDATION_MSG, depth, month),
                    width, height));
            });

            async.series(script, callback);
        })

    }

}

/* -------------- EXPORT --------------- */

module.exports = write_albedo_data;