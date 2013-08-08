var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');
var lat_lon_to_Vector3 = require('./../lib/util/lat_lon_to_Vector3');
var Iso_Remap = require('./../lib/util/Iso_Remap.js');
var GeoSphere = require('./../index.js');

var THREE = require('three');
var h = require('humanize');

function _n(n) {
    return h.numberFormat(n, 3);
};

var TEST_ROOT = path.resolve(__dirname, './../test_resources');
if (!fs.existsSync(TEST_ROOT)) fs.mkdirSync(TEST_ROOT);
var WRITE_ROOT = path.resolve(TEST_ROOT, 'util_test');
if (!fs.existsSync(WRITE_ROOT)) fs.mkdirSync(WRITE_ROOT);

tap.test('util', {timeout: 1000 * 10000, skip: false }, function (suite) {

    suite.test('lat_lon_to_vertex', {timeout: 1000 * 10, skip: true }, function (llt) {
        _.range(90, -91, -45).forEach(function (lat) {
            _.range(0, 360, 45).forEach(function (lon) {
                var v = lat_lon_to_Vector3(lat, lon, true);
                console.log('lat: %s lon: %s, v.x: %s, vy: %s, vz: %s',
                    lat, lon, _n(v.x), _n(v.y), _n(v.z)
                );
            })
        });

        llt.end();
    });

    suite.test('Vertex Consistency', {skip: true}, function (vctest) {

        _.range(0, 3).forEach(function (detail) {

            var iso = new THREE.IcosahedronGeometry(1, detail);

            console.log('-------- ISO %s ------', iso.detail);

            iso.vertices.forEach(function (v, i) {

                console.log("%s\t%s\t%s\t%s\t%s", v.index, i, v.x, v.y, v.z);
            })


        })

        vctest.end();
    });

    suite.test('Iso_Remap', {timeout: 1000 * 10000, skip: false }, function (rt) {

        var iso_remap = new GeoSphere.util.Iso_Remap(7);
        iso_remap.maps.forEach(function(map){
           map.export();
        });

        console.log(iso_remap.report());
        iso_remap.maps[0].vertices.forEach(function (vertex) {
            rt.ok(vertex.d_order() > -1, 'all parents of first map found');
        });
        var points0 = iso_remap.maps[0].vertices.map(function (vertex) {
            return vertex.real_order()
        });
        rt.deepEqual(_.sortBy(points0, _.identity).join(','), _.range(0, 12).join(','), 'real_order for map 0 is sequential');

        iso_remap.maps[1].vertices.forEach(function (vertex) {
            rt.ok(vertex.d_order() > -1, 'all parents of second map found');
        });
        var points1 = iso_remap.maps[1].vertices.map(function (vertex) {
            return vertex.real_order()
        });
        rt.deepEqual(_.sortBy(points1, _.identity).join(','), _.range(0, 42).join(','), 'real_order for map 1 is sequential');

        iso_remap.maps[2].vertices.forEach(function (vertex) {
            rt.ok(vertex.d_order() > -1, 'all parents of third map found');
        });
        var points2 = iso_remap.maps[2].vertices.map(function (vertex) {
            return vertex.real_order()
        });
        rt.deepEqual(_.sortBy(points2, _.identity).join(','), _.range(0, 162).join(','), 'real_order for map 2 is sequential');


        iso_remap.export_bin(function(){
            rt.end();
        })
    });

    suite.end();

});