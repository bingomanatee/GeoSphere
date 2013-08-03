var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var _DEBUG = false;
var THREE = require('three');
var threeE = require('./../lib/util/THREE.ext');
var canvas_to_file = require('./../../lib/util/canvas_to_file');
var Planet = require('./../../lib/Planet');
var Gate = require('gate');
var fs = require('fs');
var file_index = 0;

var solar_transfer = require('./../../lib/util/weather/solar_transfer');

/**
 * surface area of earth: 510,072,000 km^2
 * m^2 in a km^2:  1,000,000
 * vertices at division 3: 642
 *
 * Solar constant 1,368 W/m^2 = 1,368,000 kW/km^2
 *
 * each point represents 510,072,000 km^2/642
 *  = 794504 km^2 ~ 800,000 km^2
 *
 * solar constant per point = 1,086,882,392,523,364 W/point
 *                          = 1,086,882 GW/point
 *                          ~ 1.25 GW/km^2
 *                          ~ 1,250,000,000 W/km^2
 *                          ~ 1,250 W/m^2;
 *
 * @type {string}
 *
 * Temperature Scale:
 *
 * Worldwide temperature varies betwen 0 and 1.4; mapping this to
 * -10 C .. 50 C (14 ... 122) for normal extremes for a total spread of
 * 60 C, the conversion of expressed temperature to celsious is 43 * temperature -10;
 *
 * conversely 1 degree celsius = 0.023364.
 *
 * Tempuerateure and elevation
 *
 * add 2 degrees celsius per 300m, or 0.0267 / 300 m = 0.0000778816 per meter
 */

/* *********************** TEST SCAFFOLDING ********************* */

var _deg_to_rad = Math.PI / 180;
var RENDER_IMAGE = true;
var YEAR_COUNT = 2;
var REPORT_DAILY = true;
var REPORT_HOURLY = false;
var DAILY_REPORT_INC = 14;
var RENDER_INC = 4;
var TEMP_MAX_SCALE = 0.7;
var DEPTH = 3;
var COUNT_DIGITS = 6;

function about(a, b, diff) {
    return Math.abs(a - b) <= diff;
}

function _f(n, p) {
    if (!p) p = 6;
    var out = '' + Math.round(n * 100) / 100;
    while (out.length < p) {
        out = ' ' + out;
    }
    return  out;
}

function _n(n) {
    var n = '' + n;
    while (n.length < COUNT_DIGITS) {
        n = '0' + n;
    }
    return n;
}

function _log_point(msg, v) {
    console.log(msg + '(%s, %s, %s)',
        _f(v.x), _f(v.y), _f(v.z));
}

function _a(n) {

    var out = '' + Math.floor(n / _deg_to_rad) + 'º';
    while (out.length < 5) {
        out = ' ' + out;
    }
    return  out;
}

function _report_planet(hr, day, planet) {
    var data = [];
    _.range(0, 12).forEach(function (vert_index) {
        var sunlight = planet.vertex_data(vert_index, 'sunlight');
        var temp = planet.vertex_data(vert_index, 'temp');
        var v = planet.vertex(vert_index);
        //	console.log('lat: %s, lon: %s, sunlight: %s, temp: %s',
        //		        _a((v.uv.y - 0.5) * Math.PI), _a(v.uv.x * 2 * Math.PI),  _f(sunlight), _f(temp));
        data.push({lat: _a((v.uv.y - 0.5) * Math.PI), lon: _a(v.uv.x * 2 * Math.PI),
            sunlight: _f(sunlight),
            temp: _f(temp)
        });
    })
    if (hr == 0) console.log('lat     :,,, %s', _.pluck(data, 'lat').join(',  '));
    if (hr == 0) console.log('lon     :,,, %s', _.pluck(data, 'lon').join(',  '));
    console.log('DAY: %s, HOUR: %s, sunlight:, %s, temp: , %s',
        day, hr,
        _.pluck(data, 'sunlight').join(',  '),
        _.pluck(data, 'temp').join(',  '));
}

function _daily_report(day, planet) {
    var data = [];
    _.range(0, 12).forEach(function (vert_index) {
        var hi = planet.vertex_data(vert_index, 'high');
        var lo = planet.vertex_data(vert_index, 'low');
        var v = planet.vertex(vert_index);

        data.push({
            lat: _a((v.uv.y - 0.5) * Math.PI),
            lon: _a(v.uv.x * 2 * Math.PI),
            day: day,
            high: _f(hi),
            low: _f(lo)
        });
    })

    if (day == 0) {
        console.log('lat     :,,,, %s', _.pluck(data, 'lat').join(',  '));
        console.log('lon     :,,,, %s', _.pluck(data, 'lon').join(',  '));
    }
    console.log('day and year, %s, %s, high: , %s, low: , %s',
        day % 365, Math.floor(day / 365),
        _.pluck(data, 'high').join(',  '),
        _.pluck(data, 'low').join(',  ')
    );
}

var _rad_to_deg = 180 / Math.PI;
var W = 360;
var H = 180;

var write_dir = path.resolve(__dirname, '../test_resources/sunlight');

/* ************************* TESTS ****************************** */
tap.test('Video', {timeout: 10000 * 60 * 3}, function (t) {
    var planet = new Planet(DEPTH);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var planet_sphere = new THREE.Mesh(planet.iso, material);

    var planet_anchor = new THREE.Mesh(new THREE.CubeGeometry(), material);
    planet_anchor.position.x = -500;

    var planet_tilt = new THREE.Mesh(new THREE.CubeGeometry(), material);
    planet_tilt.rotation.z = 23 * _deg_to_rad;
    planet_anchor.add(planet_tilt);
    planet_tilt.add(planet_sphere);

    var sun_center = new THREE.Mesh(new THREE.CubeGeometry(), material);
    sun_center.add(planet_anchor);

    var sun = new THREE.Mesh(new THREE.CubeGeometry(), material);
    sun.add(sun_center);
    // console.log('planet: %s', util.inspect(planet_sphere));

    var sunlight_vector = new THREE.Mesh(new THREE.CubeGeometry(), material); // the origin of the system
    var DAYS = 365 * YEAR_COUNT;
    var gate = Gate.create();


    var index = new reader.Index(path.resolve(__dirname, './../GLOBE_data'));
    index.init(function () {

        index.tiles.forEach(function (tile) {
            console.log('tile: %s, min u: %s, max u: %s, min_v: %s, max_v: %s', tile.tile, tile.min_u(), tile.max_u(), tile.min_v(), tile.max_v())

        });

        var gate = Gate.create();
        console.log('mapping %s vertices', planet.vertices().length);
        var tasks = planet.vertices().length;

        planet.vertices().forEach(function (vertex, i) {
            var l = gate.latch();
            var task = tasks;
            index.uv_height(vertex.uv.x, vertex.uv.y, function (err, height) {
                planet.vertex_data(vertex.index, 'height', height);
            })
        });

        gate.await(function () {

            function rotate_planet(hour) {
                var solar_orbit_angle = hour * Math.PI * 2 / ( 365 * 24);
                planet_sphere.rotation.y = (hour % 24) * Math.PI / 12;
                sun_center.rotation.y = solar_orbit_angle;
                planet_anchor.rotation.y = -solar_orbit_angle;
            }

            _.range(0, DAYS).forEach(function (d) {
                process.nextTick(function () {
                    planet.vertex_data_all('high', '--');
                    planet.vertex_data_all('low', '--');
                });

                _.range(0, 24).forEach(function (h, i) {
                    var iter = (function () {
                        var hour = h + 24 * d;

                        var hour_of_day = h;
                        var day_number = d;

                        var nt = gate.latch();


                        return function () {
                            rotate_planet(hour);

                            sun.updateMatrixWorld();
                            var matrix = planet_sphere.matrixWorld;
                            var planet_center = new THREE.Vector3().applyProjection(matrix);
                            var sun_normal = sunlight_vector.position.clone().sub(planet_center).normalize();

                            solar_transfer(planet, sun_normal, planet_center, matrix, day_number, hour_of_day);

                            if (REPORT_HOURLY) {
                                _report_planet(hour_of_day, day_number, planet);
                            }

                            if (RENDER_IMAGE) {
                                if (day_number > 364 && (!(hour_of_day % RENDER_INC))) {
                                    planet.vertices(true).forEach(function (index) {
                                        var w = Math.min(1, Math.max(0, planet.vertex_data(index, 'temp average'))) / TEMP_MAX_SCALE;
                                        planet.vertex_data(index, 'color', new THREE.Color().setRGB(w, w * w * w, 1 - w));
                                    });
                                    var l = gate.latch();
                                    planet.draw_triangles(W, H, function (err, canvas) {
                                        var file = path.resolve(write_dir, 'normal_test_' + _n(file_index) + '.png');
                                        ++file_index;
                                        if (!(file_index % 300)) console.log('written %s', file);
                                        canvas_to_file(canvas, file, l);
                                    });
                                }
                            }
                            nt();
                        }

                    })();
                    process.nextTick(iter);
                });
                // end of each day
                var rpt = (function () {
                    var day = d;
                    var daily_report_latch = gate.latch();
                    return function () {
                        if (REPORT_DAILY) {
                            if ((!(day % DAILY_REPORT_INC))) {
                                //_daily_report(day, planet);
                                console.log('averages: ', _.map(_.range(0, 12),function (i) {
                                    return _f(planet.vertex_data(i, 'average'));
                                }).join(', '));
                            }
                            planet.vertex_data_all('high', '--');
                            planet.vertex_data_all('low', '--');
                        }

                        daily_report_latch();
                    }
                })();
                process.nextTick(rpt);
            })

            gate.await(function () {
                process.nextTick(function () {
                    t.end();
                });
            })
        })

    })

})