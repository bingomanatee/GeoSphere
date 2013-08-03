var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');
var lat_lon_to_Vector3 = require('./../lib/util/lat_lon_to_Vector3');
var h = require('humanize');

function _n(n){ return h.numberFormat(n, 3);};

tap.test('util', {timeout: 1000 * 10, skip: false }, function (suite) {

    suite.test('lat_lon_to_vertex', {timeout: 1000 * 10, skip: false }, function (llt) {
        _.range(90, -91, -45).forEach(function(lat){
        _.range(0, 360, 45).forEach(function (lon) {
                var v = lat_lon_to_Vector3(lat, lon, true);
                console.log('lat: %s lon: %s, v.x: %s, vy: %s, vz: %s',
                    lat, lon, _n(v.x), _n(v.y), _n(v.z)
                );
            })
        });


        llt.end();
    });


    suite.test('misc', {timeout: 1000 * 10, skip: true }, function (mt) {

        mt.end();
    });

    suite.end();

});