var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');

var GeoSphere = require('./../../index.js');
var ALBEDO_ROOT = path.resolve(GeoSphere.CLIMATE_BINARY, 'albedo');
var BINARY_FILE = path.resolve(ALBEDO_ROOT, 'depth_%s.bin');
var PREVIEW_FILE = path.resolve(ALBEDO_ROOT, 'depth_%s.png');
var VALIDATION_FILE = path.resolve(ALBEDO_ROOT, 'depth_%s.validation.png');
var WRITTEN_VALIDATION_MSG = ' ... written validation file for depth %s';
var WRITTEN_PREVIEW_MSG = ' ... written validation file for depth %s';

var DONE_DEPTH_MSG = ' ----------- DONE WITH DEPTH %s ---------------';

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: save raw data into binary summary files.
 */

function write_albedo_data(min_depth, max_depth, width, height) {
    console.log('WRITING ALBEDO DATA');

    if (!fs.existsSync(ALBEDO_ROOT)) fs.mkdir(ALBEDO_ROOT);

    var script = [];
    _.range(min_depth, max_depth + 1).forEach(function (depth) {
        var binary_file = util.format(BINARY_FILE, depth);
        var preview_file = util.format(PREVIEW_FILE, depth);
        var validation_file = util.format(VALIDATION_FILE, depth);
        var albedo = new GeoSphere.climate.Albedo(depth);

        script = script.concat([
            function (callback) {
                console.log('loading table data ...');
                albedo.load_table(callback);
            },
            function (callback) {
                console.log('saving binary data ...');
                albedo.export(binary_file, callback);
            },
            function (callback) {
                console.log('drawing preview data ...');
                albedo.draw(width, height, preview_file, function () {
                    console.log(WRITTEN_PREVIEW_MSG, preview_file);
                    process.nextTick(callback);
                });
            },
            function (callback) {
                console.log('starting with a new file; getting binary data ...');
                albedo = new GeoSphere.climate.Albedo(depth);
                albedo.import(binary_file, callback);
            },
            function (callback) {
                console.log('drawing validation data ...');
                albedo.draw(width, height, validation_file, function () {
                    console.log(WRITTEN_VALIDATION_MSG, validation_file);
                    process.nextTick(callback);
                });
            },
        ]);
    });

    async.series(script, function () {
        console.log("\n\n ----- DONE WRITING ALBEDO %s... %s ------\n\n", min_depth, max_depth);
    });
}

/* -------------- EXPORT --------------- */

module.exports = write_albedo_data;