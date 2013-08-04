var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');
var Table = require('cli-table');

var humanize = require('humanize');
var _DEBUG = false;
var Gate = require('gate');
var THREE = require('three');

var SCALE = 3;
var TIMEOUT_SECS = 10000;

var GeoSphere = require('./../index');

var Albedo = GeoSphere.climate.Albedo;
var Cloud_Cover = GeoSphere.climate.Cloud_Cover;
var Biomes = GeoSphere.climate.Biome_Commons;
var BLACK = new THREE.Color().setRGB(0, 0, 0);

function _n(n) {
    return humanize.numberFormat(n, 4);
}

var tr = path.resolve(__dirname, './../test_resources');
if (!fs.existsSync(tr)) fs.mkdirSync(tr);
var WRITE_ROOT = path.resolve(tr, 'Season_Sim_test');
if (!fs.existsSync(WRITE_ROOT)) fs.mkdirSync(WRITE_ROOT);
var MAPS = WRITE_ROOT + '/biome_maps';
if (!fs.existsSync(MAPS)) fs.mkdirSync(MAPS);

tap.test('Season_Sim', {timeout: 1000 * TIMEOUT_SECS * 100 }, function (suite) {


    suite.test('biomes', {timeout: 1000 * TIMEOUT_SECS, skip: false}, function (bt) {

        bt.test('biome legend', function (lt) {

            Biomes.make_legend(path.resolve(WRITE_ROOT, 'biome_legend.png'), function () {
                lt.end();
            });
        });


        bt.test('seperate_maps', function (bt2) {

            var biome = new Biomes(6);

            biome.init(function () {

                var file_name = path.resolve(WRITE_ROOT, 'biomes.png');

                biome.planet.vertices(function (v) {
                    var b = v.data('biome');
                    if (_.isNull(b)) {
                        v.data('color', 0);
                    } else {
                        var bm = Biomes.biome_map[b];
                        if (_DEBUG)   console.log('drawing biome %s(%s) at %s', b, bm.color.getStyle(), v.index);
                        if (!bm) throw new Error(util.format('cannot find biome %s', b));
                        v.data('color', bm.color);
                    }
                });
                biome.planet.draw_triangles(720, 360, file_name, function () {
                    console.log('written %s', file_name);
                    bt2.end();
                });

            });
        });

        bt.test('seperate_maps', function (bt) {

            var biome = new Biomes(5);


            biome.init(function () {

                var gate = Gate.create();
                console.log('drawing maps:');

                Biomes.biome_map.forEach(function (bb) {

                    var file_name = path.resolve(MAPS, bb.name.replace(/[\W]+/g, '_') + '.png');

                    if (_DEBUG)    console.log('starting map %s for biome %s', file_name, bb.index);
                    biome.planet.vertices(function (v) {
                        var b = v.data('biome');
                        if (_.isNull(b) || (b != bb.index)) {
                            v.data('color', 0);
                        } else {
                            var bm = Biomes.biome_map[b];
                            if (_DEBUG)   console.log('drawing biome %s(%s) at %s', b, bm.color.getStyle(), v.index);
                            if (!bm) throw new Error(util.format('cannot find biome %s', b));
                            v.data('color', bm.color);
                        }
                    });
                    var l = gate.latch();
                    biome.planet.draw_triangles(720, 360, file_name, function () {
                        console.log('written %s', file_name);
                        l();
                    });
                });

                gate.await(function () {
                    bt.end();
                });
            })

        })

    });

    suite.end();

});