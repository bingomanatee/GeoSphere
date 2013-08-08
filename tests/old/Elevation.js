var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var Gate = require('gate');
var THREE = require('three');
var fs = require('fs');

var GeoSphere = require('./../.');
var reader = GeoSphere.climate.GLOBE_data_reader;
var _DEBUG = false;
var Planet = GeoSphere.Planet;

var SCALE = 4;

/* *********************** TEST SCAFFOLDING ********************* */

var tr = path.resolve(__dirname, './../test_resources');
if (!fs.existsSync(tr)) fs.mkdirSync(tr);
var gd = path.resolve(tr, 'GLOBE_data');
if (!fs.existsSync(gd)) fs.mkdirSync(gd);

/* ************************* TESTS ****************************** */

tap.test('Elevation', {timeout: 100 * 10000}, function (s) {

    s.test('reading index', {timeout: 200 * 1000, skip: false}, function (t) {
        var index = new GeoSphere.Elevation(4);

        var gate = Gate.create();
        index.tiles.forEach(function (tile) {
            tile.draw({
                    inc: 50,
                    file: path.resolve(__dirname, './../test_resources/GLOBE_data', tile.tile.toLowerCase() + '.png')
                }
                , gate.latch())
        })

        gate.await(function () {
            t.end();
        })
    }); // end tap.test 1

    s.test('range of data', {timeout: 2000 * 1000, skip: false}, function (t) {
        var gate = Gate.create();

        var index = new reader.Index(path.resolve(__dirname, './../GLOBE_data'));
        index.tiles.forEach(function (tile) {

            var l = gate.latch();
            tile.range(function (err, min, max) {
                t.equal(min, tile.e_min, ' of tile ' + tile.tile + ' min should be ' + tile.e_min);
                t.equal(max, tile.e_max, ' of tile ' + tile.tile + ' max should be ' + tile.e_max);
                l();
            })
        })

        gate.await(function () {
            t.end();
        })
    }) // end tap.test 2

    s.test('draw map of UVs', {timeout: 200 * 1000, skip: false}, function (t) {

        var draw_path = path.resolve(__dirname, './../test_resources/GLOPE_data/earth_uv.png');
        var planet = new Planet(4);
        planet.vertices().forEach(function (v, i) {
            if (_DEBUG) console.log('vertex %s index: %s', i, v.index);
            var c = new THREE.Color();
            c.setRGB(v.uv.x, v.uv.y, 1);
            planet.vertex_data(v.index, 'color', c);
            if (i < 20) console.log('vertex: %s, %s, %s, %s, %s, %s', v.index, v.x, v.y, v.z, v.uv.x, v.uv.y);

        })
        planet.draw_triangles(720, 360, draw_path, function () {
            t.end();
        });

    });

    s.test('poll icosphere', {skip: true}, function (t) {
        var planet = new Planet(3);

        console.log('iso: %s', util.inspect(planet.iso));

        planet.vertices().forEach(function (vertex, i) {
            console.log('vertex %s , %s, %s, %s, %s, %s', vertex.index, vertex.x, vertex.y, vertex.z, vertex.uv.x, vertex.uv.y);
        });

        planet.iso.faces.forEach(function (face, i) {
            console.log('face: %s, %s, %s, %s, %s', i, face.a, face.b, face.c, face.d);
        });

        t.end();
    })

    s.test('draw tessellated map of height', {timeout: 200 * 1000, skip: false}, function (t) {

        var draw_path = path.resolve(__dirname, './../test_resources/earth_tesselated.png');
        //console.log('drawing %s', draw_path);
        var planet = new Planet(5);
        var done = 0;
        var last_done = 0;

        var index = new reader.Index(path.resolve(__dirname, './../GLOBE_data'));
        index.init(function () {

           if (_DEBUG) index.tiles.forEach(function (tile) {
                console.log('tile: %s, min u: %s, max u: %s, min_v: %s, max_v: %s', tile.tile, tile.min_u(), tile.max_u(), tile.min_v(), tile.max_v())
            });

            var gate = Gate.create();
            var tasks = planet.vertices().length;

            planet.vertices().forEach(function (vertex, i) {
                var l = gate.latch();
                var task = tasks;
                index.uv_height(vertex.uv.x, vertex.uv.y, function (err, height) {
                    if (err) throw err;
                    height = parseInt(height);

                    // console.log('vertex: %s: u: %s, v: %s, height: %s',  vertex.index, vertex.uv.x, vertex.uv.y, height);
                    if (height > 10000) {
                        chroma = new THREE.Color().setRGB(0, 0.2, 1);
                    } else {

                        var chroma = Math.min(1, Math.max(0, height / 6000));
                        chroma = Math.sqrt(chroma);
                        chroma = new THREE.Color().setHSL(1 - chroma, 1, chroma);
                    }
                    if (Math.floor(done / 1000) > last_done) {
                        last_done = Math.floor(done / 1000);
                        console.log('%s done.', done);
                    }
                    ++done;

                    var color = new THREE.Color().setRGB(chroma, chroma, chroma);
                    planet.vertex_data(i, 'color', chroma);
                    --tasks;

                    if (tasks < 1) console.log('all done');
                    l();
                });

            });

            gate.await(function () {
                planet.draw_triangles(360 * SCALE, 180 * SCALE, draw_path, function () {
                    t.end();
                })
            })

        });

    });

    s.end();
})