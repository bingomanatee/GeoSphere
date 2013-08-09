var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Gate = require('gate');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To save point data as a binary data for faster loading
 */

function write_vertex_data(min_depth, max_depth, width, height) {

    var GeoSphere = require('./../../index.js');

    var gate = Gate.create();

    var iso_remap = new GeoSphere.util.Iso_Remap(max_depth + 1);
    iso_remap.generate();

    iso_remap.maps.forEach(function (map) {
        map.export(true, gate.latch());
    });

    gate.await(function () {
        GeoSphere.init_to_detail(max_depth + 1, function () {

            var script = [];
            _.range(min_depth, max_depth + 1).forEach(function (depth) {
                var planet = new GeoSphere.Planet(depth);

                script = script.concat([
                    function (callback) {
                        planet.bin_planet(callback); // writing binary
                    },
                    function (callback) {
                        if (depth > 5) return callback();
                        planet.bin_planet(function () {
                            console.log('done writing JSON for %s', depth);
                            callback();
                        }, true); // writing JSON
                    },
                    function (callback) {
                        if (depth > 5) return callback();
                        var file = path.resolve(GeoSphere.PLANET_BINARY, 'packed_data', depth + '.png');
                        planet.graph(width, height, file, function () {
                            console.log('depth %s done writing %s', depth, file);

                            callback();
                        });
                    }
                ]);
            });

            async.series(script, function () {
                console.log("\n\n ----- DONE WRITING PLANET %s... %s ------\n\n", min_depth, max_depth);
            });
        })
    })


}

/* -------------- EXPORT --------------- */

module.exports = write_vertex_data;