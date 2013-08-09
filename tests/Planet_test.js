var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var fs = require('fs');
var THREE = require('three');

var GeoSphere = require('./../index');

var Planet = GeoSphere.Planet;
var canvas_to_file = GeoSphere.util.canvas_to_file;
var msgpack = require('msgpack-js');

var _DEBUG = false;

var RES_ROOT = path.resolve(__dirname, '../test_resources');
if (!fs.existsSync(RES_ROOT)) fs.mkdirSync(RES_ROOT);
var WRITE_ROOT = path.resolve(__dirname, '../test_resources/Planet_test');
if (!fs.existsSync(WRITE_ROOT)) fs.mkdirSync(WRITE_ROOT);

/* *********************** TEST SCAFFOLDING ********************* */

function _brute_force_closest_point(s, x, y, z) {
    var p3 = new THREE.Vector3(x, y, z);

    return _.reduce(s.vertices(),function (out, v) {
        var d = v.distanceToSquared(p3);
        if (out && out.d < d) {
            return out;
        } else {
            return {d: d, vertex: v};
        }
    }, null).vertex;
}

function _c(n) {
    return ((1 + n) / 2);
}

function _color(vertex) {
    return new THREE.Color().setRGB(_c(vertex.x), _c(vertex.y), _c(vertex.z));
}

var SCALE = 1;
var W = 360 * SCALE, H = 180 * SCALE;

function _draw_map(n, t) {
    var sphere = new Planet(n);
    _.each(sphere.vertices(), function (v) {
        sphere.vertex_data(v.index, 'color', _color(v));
    });
    var t1 = new Date().getTime();
    sphere.draw_map(W, H, function (err, c) {
        canvas_to_file(c, path.resolve(WRITE_ROOT, 'draw_map_' + n + '.png'), function () {
            console.log('drawing map for sphere %s , %s seconds', n, (new Date().getTime() - t1) / 1000);
            t.end();
        });
    });
}

function _draw(n, t) {
    var sphere = new Planet(n);
    _.each(sphere.vertices(), function (v) {
        sphere.vertex_data(v.index, 'color', _color(v));
    });
    var t1 = new Date().getTime();
    sphere.draw(W, H, function (err, c) {
        if (err) throw err;
        canvas_to_file(c, path.resolve(WRITE_ROOT, 'draw_' + n + '.png'), function () {
            console.log('drawing combined sphere %s, %s seconds', n, (new Date().getTime() - t1) / 1000);
            t.end();
        })
    });
}

function _draw_triangles(n, t) {
    var sphere = new Planet(n);
    sphere.vertices().forEach(function (v) {
        v.data('color', _color(v));
    });
    var t1 = new Date().getTime();
    sphere.draw_triangles(W, H
        , path.resolve(WRITE_ROOT, 'draw_triangles_' + n + '.png'),
        function (err) {
            if (err) throw err;
            console.log('drawing face-based sphere %s, %s seconds', n, (new Date().getTime() - t1) / 1000);
            t.end();
        });
}

function _sorted(d2array) {
    return d2array.map(function (a) {
        return _.sortBy(a, _.identity);
    })
}


function _cleanF(n) {
    return Math.round(1000 * n) / 1000
};
function _clean_floats(data) {
    data.map(function (item) {
        item.c = item.c.map(_cleanF);
        item.u = item.u.map(_cleanF);
    })
}

/* ************************* TESTS ****************************** */
var TIMEOUT = 1000 * 60 * 80;

GeoSphere.init_to_detail(7, function () {

    tap.test('Planet', {timeout: TIMEOUT}, function (t) {
        t.test('constructor', function (t2) {
            var sphere0 = new Planet(0);
            t2.equal(sphere0.vertices().length, 12, '12 points on a sphere depth 0');
            if (_DEBUG)  console.log(' nears: %s', util.inspect(_sorted(sphere0.near)));

            t2.deepEqual(_sorted(sphere0.near), _sorted([
                [ 11, 5, 1, 7, 10 ],
                [ 0, 5, 7, 9, 8 ],
                [ 11, 10, 3, 4, 6 ],
                [ 9, 4, 2, 6, 8 ],
                [ 5, 11, 3, 9, 2 ],
                [ 0, 11, 1, 9, 4 ],
                [ 10, 7, 3, 2, 8 ],
                [ 0, 1, 10, 6, 8 ],
                [ 7, 1, 3, 6, 9 ],
                [ 1, 5, 3, 4, 8 ],
                [ 0, 7, 11, 2, 6 ],
                [ 0, 5, 10, 4, 2 ]
            ]), 'sphere0 network');

            var sphere1 = new Planet(1);
            t2.equal(sphere1.vertices().length, 42, '42 points on a sphere depth 1');

            t2.deepEqual(_sorted(sphere1.near), _sorted([
                [ 12, 13, 15, 17, 19 ],
                [ 15, 16, 18, 22, 31 ],
                [ 26, 27, 35, 36, 38 ],
                [ 32, 33, 35, 37, 39 ],
                [ 24, 25, 33, 34, 36 ],
                [ 13, 14, 16, 23, 24 ],
                [ 28, 29, 37, 38, 40 ],
                [ 17, 18, 20, 29, 30 ],
                [ 30, 31, 39, 40, 41 ],
                [ 22, 23, 32, 34, 41 ],
                [ 19, 20, 21, 27, 28 ],
                [ 12, 14, 21, 25, 26 ],
                [ 0, 13, 11, 14, 19, 21 ],
                [ 0, 12, 14, 5, 15, 16 ],
                [ 12, 11, 13, 5, 24, 25 ],
                [ 0, 13, 16, 1, 17, 18 ],
                [ 13, 5, 15, 1, 22, 23 ],
                [ 0, 15, 18, 7, 19, 20 ],
                [ 15, 1, 17, 7, 30, 31 ],
                [ 0, 17, 20, 10, 12, 21 ],
                [ 17, 7, 19, 10, 28, 29 ],
                [ 19, 10, 12, 11, 26, 27 ],
                [ 1, 16, 23, 9, 41, 31 ],
                [ 16, 5, 22, 9, 34, 24 ],
                [ 5, 14, 25, 4, 34, 23 ],
                [ 14, 11, 24, 4, 36, 26 ],
                [ 11, 21, 27, 2, 36, 25 ],
                [ 21, 10, 26, 2, 38, 28 ],
                [ 10, 20, 29, 6, 38, 27 ],
                [ 20, 7, 28, 6, 40, 30 ],
                [ 7, 18, 31, 8, 40, 29 ],
                [ 18, 1, 30, 8, 41, 22 ],
                [ 3, 33, 9, 34, 39, 41 ],
                [ 3, 32, 34, 4, 35, 36 ],
                [ 32, 9, 33, 4, 24, 23 ],
                [ 3, 33, 36, 2, 37, 38 ],
                [ 33, 4, 35, 2, 26, 25 ],
                [ 3, 35, 38, 6, 39, 40 ],
                [ 35, 2, 37, 6, 28, 27 ],
                [ 3, 37, 40, 8, 32, 41 ],
                [ 37, 6, 39, 8, 30, 29 ],
                [ 39, 8, 32, 9, 22, 31 ]
            ]), 'sphere1 near');

            t2.end();
        });

        t.test('draw triangles', function (t) {

            t.test('draw triangles 0', {timeout: 60 * 1000}, function (tt) {
                _draw_triangles(0, tt);
                tt.end();
            });
            t.test('draw triangles 1', {timeout: 60 * 1000}, function (tt) {
                _draw_triangles(1, tt);
            });
            t.test('draw triangles 2', {timeout: 60 * 1000}, function (tt) {
                _draw_triangles(2, tt);
            });
            t.test('draw triangles 3', {timeout: 60 * 1000}, function (tt) {
                _draw_triangles(3, tt);
            });
            t.test('draw triangles 4', {timeout: 60 * 1000}, function (tt) {
                _draw_triangles(4, tt);
            });
            t.end();
        });

        t.test('draw', {timeout: 60 * 1000, skip: true}, function (t) {

            t.test('draw 0', {timeout: 60 * 1000}, function (tt) {
                _draw(0, tt);
            });
            t.test('draw 1', {timeout: 60 * 1000}, function (tt) {
                _draw(1, tt);
            });
            t.test('draw 2', {timeout: 60 * 1000}, function (tt) {
                _draw(2, tt);
            });
            t.test('draw 3', {timeout: 60 * 1000}, function (tt) {
                _draw(3, tt);
            });
            t.test('draw 4', {timeout: 60 * 1000}, function (tt) {
                _draw(4, tt);
            });
            t.test('draw map 0', {timeout: 60 * 1000}, function (tt) {
                _draw_map(0, tt);
            });
            t.test('draw map 1', {timeout: 60 * 1000}, function (tt) {
                _draw_map(1, tt);
            });
            t.test('draw map 2', {timeout: 60 * 1000}, function (tt) {
                _draw_map(2, tt);
            });
            t.test('draw map 3', {timeout: 60 * 1000}, function (tt) {
                _draw_map(3, tt);
            });
            t.test('draw map 4', {timeout: 60 * 1000}, function (tt) {
                _draw_map(4, tt);
            });

            t.end();
        });

        t.test('nearest', {skip: true}, function (t4) {
            var sphere0 = new Planet(0);

            _.range(-1, 1.01, 1).forEach(function (x) {
                _.range(-1, 1.01, 1).forEach(function (y) {
                    _.range(-1, 1.01, 1).forEach(function (z) {
                        var p = sphere0.closest_point(x, y, z);
                        var bfp = _brute_force_closest_point(sphere0, x, y, z);
                        var from_p = new THREE.Vector3(x, y, z);

                        var cp_dist = from_p.distanceToSquared(p);
                        var bfp_dist = from_p.distanceToSquared(bfp);
                        if (cp_dist != bfp_dist) {
                            console.log('bad find: from %s, %s, %s the brute force point %s ' +
                                'is closer than the closest_point %s (closest_dist %s, bf dist %s)',
                                x, y, z, util.inspect(bfp), util.inspect(p), cp_dist, bfp_dist)

                        }

                        t.deepEqual(cp_dist, bfp_dist
                            , 'found a point equal distance to the closest point. ');

                    })
                })
            });

            t4.end();
        });

        t.test('vertex_data', {skip: true}, function (t5) {

            var sphere_2a = new Planet(0);
            sphere_2a.vertices(1).map(function (index) {
                sphere_2a.vertex_data(index, '2x', 2 * index);
            });

            t.deepEqual(sphere_2a.vertex_data('2x'), _.range(0, 12).map(function (n) {
                return 2 * n
            }), 'sphere_2a.vertex_data("2x") should equal 0,2,4..22');

            sphere_2a.vertex_data_all('5s', 5);

            t.deepEqual(sphere_2a.vertex_data('5s'), _.range(0, 12).map(function (n) {
                return 5
            }), 'sphere_2a.vertex_data("5") should equal 5,5,...5');

            sphere_2a.vertices(function (vertex) {
                vertex.data('5s_+_2x', vertex.data('5s') + vertex.data('2x'))
            });


            t.deepEqual(sphere_2a.vertex_data('5s_+_2x'), _.range(0, 12).map(function (n) {
                return 5 + 2 * n;
            }), 'sphere_2a.vertex_data("5s_+_2x") should equal 5,7...27');

            sphere_2a.vertices(function (vertex) {
                sphere_2a.vertex_data_op(vertex.index, '6x', '^2x', '=', 3, '*');
            });

            t.deepEqual(sphere_2a.vertex_data('6x'), _.range(0, 12).map(function (n) {
                return 6 * n;
            }), 'sphere_2a.vertex_data("6x") should equal 0,2,4..22');

            t5.end();

        });

        t.test('bin planet', function (t7) {

            var planet = new GeoSphere.Planet(0);

            planet.bin_planet(function (err) {
                planet.bin_planet(function (err) {
                    planet.unbin_planet(function (err, data) {
                        var planet_packed_0 = require(planet.pack_file(true, WRITE_ROOT));
                        // console.log('bin data: %s', JSON.stringify(data, true, 3));
                        debugger;
                        t7.deepEqual(_clean_floats(data), _clean_floats(planet_packed_0), 'can read planet packed 0');
                        t7.end();
                    }, false, WRITE_ROOT);
                }, true, WRITE_ROOT);
            }, false, WRITE_ROOT);
        });

        t.test('bin planet speed', {timeout: TIMEOUT, skip: false}, function (bin_test) {

            var planet = new GeoSphere.Planet(6);

            var t1 = new Date().getTime();
            planet.bin_planet(function (err) {
                planet.bin_planet(function (err) {
                    var t2 = new Date().getTime();
                    planet.unbin_planet(function (err, data) {
                        var t3 = new Date().getTime();
                        var planet_json = require(planet.bin_file(true, WRITE_ROOT));
                        var t4 = new Date().getTime();

                        var unbin_time = t3 - t2;
                        var r_time = t4 - t3;

                        console.log('unbin time: %s', unbin_time);
                        console.log('require time: %s', r_time);
                        bin_test.end();
                    }, false, WRITE_ROOT);
                }, false, WRITE_ROOT);
            }, true, WRITE_ROOT);
        });

        t.test('pack planet', {skip: true}, function (t6) {

            var planet = new GeoSphere.Planet(0);

            planet.pack_planet(function (err) {
                planet.pack_planet(function (err) {
                    fs.readFile(planet.pack_file(false, WRITE_ROOT), function (err, buffer) {
                        var data = msgpack.decode(buffer);
                        var planet_packed_0 = require(planet.pack_file(true, WRITE_ROOT));
                        t6.deepEqual(data, planet_packed_0, 'can read planet packed 0');
                        t6.end();
                    });
                }, true, WRITE_ROOT);
            }, false, WRITE_ROOT);
        });

        t.test('pack planet speed', {timeout: TIMEOUT, skip: true}, function (t6) {

            var planet = new GeoSphere.Planet(6);

            var t1 = new Date().getTime();
            planet.pack_planet(function (err) {
                var t2 = new Date().getTime();
                fs.readFile(planet.pack_file(false, WRITE_ROOT), function (err, buffer) {
                    var data = msgpack.decode(buffer);
                    var t3 = new Date().getTime();

                    planet.pack_planet(function (err) {
                        var t4 = new Date().getTime();
                        var json_data = require(planet.pack_file(true, WRITE_ROOT));
                        var t5 = new Date().getTime();

                        console.log('time to read packed file: %s', t3 - t2);
                        console.log('time to write and read JSON: %s', t5 - t4);
                        t6.deepEqual(data, json_data, 'json data and buffer data same for p6')
                        t6.end();
                    }, true, WRITE_ROOT);

                });
            }, false, WRITE_ROOT);
        });

        t.end();
    }); // end  Planet

});
