var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');
var Table = require('cli-table');
var Season_Sim = require('./../lib/util/weather/Season_Sim');
var humanize = require('humanize');
var _DEBUG = false;
var Gate = require('gate');

var SCALE = 3;
var TIMEOUT_SECS = 10000;
var Albedo = require('./../lib/util/weather/Albedo');
var Cloud_Cover = require('./../lib/util/weather/Cloud_Cover');
var Surface_Radiation_Budget = require('./../lib/util/weather/Surface_Radiation_Budget');
var THREE = require('three');

function _n(n) {
    return humanize.numberFormat(n, 4);
}

function _lat(n) {
    return  Math.round(((1 - n) - 0.5) * 180);
}

function _lon(n) {
    return Math.round(360 * n - 180);
}

function _render_sim(sim, hour, callback) {

    var table = new Table({
        head: ['index', 'x', 'y', 'z', 'uv x', 'uv y', 'lon', 'lat', 'sunlight'],
        colAligns: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right'],
        colWidths: [6, 12, 12, 12, 12, 12, 12, 12, 12]
    });

    sim.planet.vertices(function (vertex) {
        table.push([vertex.index,
            _n(vertex.x), _n(vertex.y), _n(vertex.z),
            _n(vertex.uv.x), _n(vertex.uv.y),
            _lon(vertex.uv.x), _lat(vertex.uv.y),
            _n(vertex.data('sunlight'))]);
    });

    console.log(table.toString());

    var file = path.resolve(__dirname, './../test_resources/Season_Sim_Test/sunlight_' + hour + '.png');
    sim.planet.vertices(function (vertex) {
        sim.planet.vertex_data_op(vertex.index, 'color', '^sunlight', '=');
    })

    sim.planet.draw_triangles(360 * SCALE, 180 * SCALE, file, callback);
}

function _write_cache(test, depth) {

    var sim = new Season_Sim(depth);

    var time = new Date().getTime();
    var file = path.resolve(__dirname, './../test_resources/Season_Sim_Test/sunlight_cache.' + depth + '.bin');
    var handle = fs.createWriteStream(file, {encoding: 'utf8'});

    _.range(0, 365).forEach(function (day) {
        _.range(0, 24).forEach(function (hour) {
            sim.set_time(day, hour);
            var sunlight = _.pluck(sim.planet.export_vertex_data('sunlight'), 'sunlight');
            var buffer = new Buffer(sunlight.length * 4);
            sunlight.forEach(function (sun, i) {
                if (!sun) {
                    sun = 0;
                }
                buffer.writeFloatLE(sun, i * 4);
            });

            handle.write(buffer);
        })
    });

    handle.end();

    handle.on('finish', function () {
        process.nextTick(function () {
            console.log('file at depth %s written in %s seconds', depth, _n((new Date().getTime() - time) / 1000));
            test.end();
        })
    })

}


tap.test('Season_Sim', {timeout: 1000 * TIMEOUT_SECS, skip: false }, function (suite) {

    suite.test('sunlight generation', {timeout: 1000 * 10, skip: true }, function (ss_test) {

        var gate = Gate.create();

        var sim = new Season_Sim(1);

        sim.set_time(0, 0);

        console.log('sun at hour 0');
        _render_sim(sim, 0, gate.latch());

        sim.set_time(0, 12);
        console.log('sun at hour 12');
        _render_sim(sim, 12, gate.latch());

        gate.await(function () {
            ss_test.end();
        })
    });

    suite.test('caching sunlight', {timeout: 1000 * TIMEOUT_SECS, skip: true }, function (cache_test) {

        cache_test.test('depth 1', {timeout: 1000 * TIMEOUT_SECS, skip: false }, function (t) {

            _write_cache(t, 1);

        });

        cache_test.test('depth 2', {timeout: 1000 * TIMEOUT_SECS, skip: false }, function (t) {

            _write_cache(t, 2);

        });

        cache_test.test('depth 3', {timeout: 1000 * TIMEOUT_SECS, skip: false }, function (t) {

            _write_cache(t, 3);

        });

        cache_test.test('depth 4', {timeout: 1000 * TIMEOUT_SECS, skip: false }, function (t) {

            _write_cache(t, 4);

        });


        cache_test.test('depth 5', {timeout: 1000 * TIMEOUT_SECS, skip: false }, function (t) {

            _write_cache(t, 5);

        });


        cache_test.test('depth 6', {timeout: 1000 * TIMEOUT_SECS, skip: true }, function (t) {

            _write_cache(t, 6);

        });

        cache_test.end();
    });

    suite.test('reading albedo', {timeout: 1000 * TIMEOUT_SECS, skip: true}, function (albedo_test) {

        var albedo = new Albedo(5);

        albedo.load(function () {
            console.log('done reading albedo');
            var scale = 5;

            albedo.planet.vertices(function (vertex) {
                var color = new THREE.Color();
                var elevation = vertex.data('elevation');
                if (elevation > 10000) elevation = 0;
                var albedo = vertex.data('albedo') / 100;

                // color.setRGB(elevation/1000, Math.sqrt(albedo), elevation ? 0 : 1);
                // console.log('index: %s, elevation: %s, albedo: %s', vertex.index, elevation, albedo);
                vertex.data('color', albedo);
            });

            albedo.planet.draw_triangles(360 * scale, 180 * scale, path.resolve(__dirname, './../test_resources/Season_Sim_Test/albedo.png'), function () {
                albedo_test.end();
            })
        })

    });

    suite.test('cloud cover', {skip: true}, function (cct) {

        var cover = new Cloud_Cover(4);

        var gate = Gate.create();
        cover.init(function () {

            _.range(0, 12).forEach(function (month) {

                cover.planet.vertices(function (vertex) {
                    var cc = vertex.data('cloud_cover');
                    vertex.data('color', cc[month]);
                });

                cover.planet.draw_triangles(720, 360,
                    path.resolve(__dirname, './../test_resources/Season_Sim_Test/cloud_cover_' + month + '.png'),
                    gate.latch());

            });

            gate.await(function () {
                cct.end();
            })

        })

    });

    suite.test('Surface Radiation Budget', {timeout: 100 * TIMEOUT_SECS * 1000}, function (srb) {

        var index = 0;
        var time = new Date().getTime();
        var sim = new Season_Sim(3);
        var MIN_ENERGY = -1400;
        var MAX_ENERGY = 100;
        var RANGE = MAX_ENERGY - MIN_ENERGY;
        var gate = Gate.create();

        sim.init(function () {
            _.range(0, 10).forEach(function (day) {
                _.range(0, 24).forEach(function (hour) {
                        sim.set_time(day, hour);

                        sim.planet.vertices(function (vertex) {
                            var radiation = vertex.data('radiation');
                            if (!day && !hour){
                                console.log('vertex: %s , radiation: %s', vertex.index, radiation);
                            }
                            vertex.data('color', 1 - (radiation - MIN_ENERGY) / RANGE);
                        })

                        var file = path.resolve(__dirname, './../test_resources/Season_Sim_Test/srb/radiation.' + index + '.png');
                        sim.planet.draw_triangles(720, 360, file, gate.latch());
                        ++index;

                });
            });

            gate.await(function () {
                var duration = new Date().getTime() - time;
                duration /= 1000;
                console.log('time: %s, per image: %s', _n(duration), _n(duration/index));
                srb.end();
            })

        });


    })

    suite.end();

});