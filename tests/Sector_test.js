var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');
var GeoSphere = require('./../index.js');

var TEST_ROOT = path.resolve(__dirname, './../test_resources');
if (!fs.existsSync(TEST_ROOT)) fs.mkdirSync(TEST_ROOT);
var WRITE_ROOT = path.resolve(TEST_ROOT, 'Sector_test');
if (!fs.existsSync(WRITE_ROOT)) fs.mkdirSync(WRITE_ROOT);

tap.test('Sector', {timeout: 1000 * 1000, skip: false }, function (suite) {

    suite.test('generate sectors', {timeout: 1000 * 1000, skip: false }, function (gen_test) {
        var sector = new GeoSphere.Sector(3);

        var sectors = sector.sectors(0);

        gen_test.deepEqual([
            [ 0, 5, 11 ],
            [ 0, 1, 5 ],
            [ 0, 1, 7 ],
            [ 0, 7, 10 ],
            [ 0, 10, 11 ],
            [ 1, 5, 9 ],
            [ 4, 5, 11 ],
            [ 2, 10, 11 ],
            [ 6, 7, 10 ],
            [ 1, 7, 8 ],
            [ 3, 4, 9 ],
            [ 2, 3, 4 ],
            [ 2, 3, 6 ],
            [ 3, 6, 8 ],
            [ 3, 8, 9 ],
            [ 4, 5, 9 ],
            [ 2, 4, 11 ],
            [ 2, 6, 10 ],
            [ 6, 7, 8 ],
            [ 1, 8, 9 ]
        ], sectors, 'get ordered first set of points');

        var sectors1 = sector.sectors(1);
        console.log('sectors 1: %s', util.inspect(sectors1));
        gen_test.deepEqual(sectors1, [
            [
                0,
                5,
                11,
                12,
                13,
                14
            ],
            [
                0,
                1,
                5,
                13,
                15,
                16
            ],
            [
                0,
                1,
                7,
                15,
                17,
                18
            ],
            [
                0,
                7,
                10,
                17,
                19,
                20
            ],
            [
                0,
                10,
                11,
                12,
                19,
                21
            ],
            [
                1,
                5,
                9,
                16,
                22,
                23
            ],
            [
                4,
                5,
                11,
                14,
                24,
                25
            ],
            [
                2,
                10,
                11,
                21,
                26,
                27
            ],
            [
                6,
                7,
                10,
                20,
                28,
                29
            ],
            [
                1,
                7,
                8,
                18,
                30,
                31
            ],
            [
                3,
                4,
                9,
                32,
                33,
                34
            ],
            [
                2,
                3,
                4,
                33,
                35,
                36
            ],
            [
                2,
                3,
                6,
                35,
                37,
                38
            ],
            [
                3,
                6,
                8,
                37,
                39,
                40
            ],
            [
                3,
                8,
                9,
                32,
                39,
                41
            ],
            [
                4,
                5,
                9,
                23,
                24,
                34
            ],
            [
                2,
                4,
                11,
                25,
                26,
                36
            ],
            [
                2,
                6,
                10,
                27,
                28,
                38
            ],
            [
                6,
                7,
                8,
                29,
                30,
                40
            ],
            [
                1,
                8,
                9,
                22,
                31,
                41
            ]
        ], 'second set of points');

        console.log('sectors 3: %s', util.inspect(sector.sectors(3)));

        gen_test.test('draw level 0 planet', function (t) {

            var planet = new GeoSphere.Planet(0);
            planet.graph(720, 360, path.resolve(WRITE_ROOT, 'planet_0_graph.png'), function () {
                t.end();
            })
        });

        gen_test.test('draw level 1 planet', {timeout: 1000 * 1000}, function (t) {

            var planet = new GeoSphere.Planet(1);
            planet.graph(600, 600, path.resolve(WRITE_ROOT, 'planet_1_graph.png'), function () {
                t.end();
            })
        })

        gen_test.test('draw level 2 planet',{timeout: 1000 * 1000},  function (t) {

            var planet = new GeoSphere.Planet(2);
            planet.graph(600, 600, path.resolve(WRITE_ROOT, 'planet_2_graph.png'), function () {
                t.end();
            })
        })

        gen_test.test('draw level 3 planet',{timeout: 1000 * 1000},  function (t) {

            var planet = new GeoSphere.Planet(3);
            planet.graph(600, 600, path.resolve(WRITE_ROOT, 'planet_3_graph.png'), function () {
                t.end();
            })
        })

        gen_test.end();
    });


    suite.test('sector_io', {timeout: 1000 * 10, skip: false }, function (io_test) {

        io_test.end();
    });

    suite.end();

});