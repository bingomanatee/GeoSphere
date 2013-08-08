var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');
var THREE = require('three');
var h = require('humanize');

var GeoSphere = require('./../index.js');
var _DEBUG = false;

function _n(n) {
    return h.numberFormat(n, 3);
};

var TEST_ROOT = path.resolve(__dirname, './../test_resources');
if (!fs.existsSync(TEST_ROOT)) fs.mkdirSync(TEST_ROOT);
var WRITE_ROOT = path.resolve(TEST_ROOT, 'util_test');
if (!fs.existsSync(WRITE_ROOT)) fs.mkdirSync(WRITE_ROOT);

tap.test('util', {timeout: 1000 * 10000, skip: false }, function (suite) {

    suite.test('lat_lon_to_vertex', {timeout: 1000 * 10, skip: false }, function (llt) {
        _.range(90, -91, -45).forEach(function (lat) {
            _.range(0, 360, 45).forEach(function (lon) {
                var v = GeoSphere.util.lat_lon_to_Vector3(lat, lon, true);
               if (_DEBUG) console.log('lat: %s lon: %s, v.x: %s, vy: %s, vz: %s',
                    lat, lon, _n(v.x), _n(v.y), _n(v.z)
                );

                if (lat > 0){
                    llt.ok(v.y < 0, 'positive lat ' + lat + ' has y ' + v.y + ' < 0');
                } else if (lat < 0){
                    llt.ok(v.y > 0, 'negative lat has y > 0');
                }
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


    suite.test('Iso_Remap import', {skip: false}, function (iritest) {

        new GeoSphere.util.Iso_Remap(2).reorder_iso(new THREE.IcosahedronGeometry(1, 2), function (err, map) {

            if (_DEBUG)    console.log('imported order data: %s', map.report());

            iritest.end();
        });


    });

    suite.test('Iso_Remap preload', {skip: false}, function (irptest) {

        var ir = new GeoSphere.util.Iso_Remap(2);

        ir.load_cache_from_bin(function (err) {
            irptest.deepEqual(GeoSphere.util.Iso_Remap.cache(2), [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 42, 12, 43, 44, 45, 46, 47, 13, 14, 48, 49, 50, 51, 52, 53, 54, 15, 16, 55, 56, 57, 58, 59, 60, 61, 17, 18, 62, 63, 64, 65, 66, 67, 68, 19, 20, 69, 70, 71, 72, 73, 74, 21, 75, 76, 77, 78, 79, 80, 22, 23, 81, 82, 83, 84, 85, 86, 87, 24, 25, 88, 89, 90, 91, 92, 93, 94, 26, 27, 95, 96, 97, 98, 99, 100, 101, 28, 29, 102, 103, 104, 105, 106, 107, 108, 30, 31, 109, 110, 111, 112, 32, 113, 114, 115, 116, 117, 33, 34, 118, 119, 120, 121, 122, 123, 124, 35, 36, 125, 126, 127, 128, 129, 130, 131, 37, 38, 132, 133, 134, 135, 136, 137, 138, 39, 40, 139, 140, 141, 142, 143, 144, 41, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161
            ] , 'Can read cache 2');
            irptest.end();
        });
    });

    suite.test('Iso_Remap', {timeout: 1000 * 10000, skip: false}, function (rt) {

        var iso_remap = new GeoSphere.util.Iso_Remap(5);
        iso_remap.generate();

        iso_remap.maps.forEach(function (map) {
            map.export();
        });

        if (_DEBUG)   console.log(iso_remap.report());
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


        iso_remap.export_bin(function () {
            rt.end();
        });
    });

    suite.end();

});