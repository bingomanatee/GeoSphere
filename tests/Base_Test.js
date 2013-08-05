var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');
var GeoSphere = require('./../index');
var Gate = require('gate');
var THREE = require('three');
var _DEBUG = 0;

/* ------------------ SUPPORT ------------------ */

var tr = path.resolve(__dirname, './../test_resources');
if (!fs.existsSync(tr)) fs.mkdirSync(tr);
var WRITE_ROOT = path.resolve(tr, 'Base_Test');
if (!fs.existsSync(WRITE_ROOT)) fs.mkdirSync(WRITE_ROOT);

var HUGE_FIBE = path.resolve(WRITE_ROOT, 'huge.bin');
var ROWS = 250;
var COLUMNS = 500;

function _make_a_huge_binary_file(file, cb) {

    var buffer;
    var index = 0;

    var handle = fs.createWriteStream(file);

    function _new_buffer() {
        if (buffer) handle.write(buffer);
        buffer = new Buffer(COLUMNS * 4);
        index = 0;
    }

    _new_buffer();

    _.range(0, ROWS).forEach(function (r) {
        _.range(0, COLUMNS).forEach(function (c) {
            if (index + 2 > buffer.length) _new_buffer();
            buffer.writeInt16BE(r, index);
            index += 2;
            if (index + 2 > buffer.length) _new_buffer();
            buffer.writeInt16BE(c, index);
            index += 2;
        })
    });

    handle.end(buffer);

    handle.on('finish', cb);

}

function XY_Reader(planet, rows, cols, data_size) {

    GeoSphere.util._Base.call(this, planet);

    this.rows = rows;
    this.cols = cols;
    this.data_size = data_size;

}

util.inherits(XY_Reader, GeoSphere.util._Base);

_.extend(XY_Reader.prototype, {

    init: function (callback) {

        this.data_to_points(HUGE_FIBE, this.rows, this.cols, this.data_size, function (err, points) {
            points.forEach(function (point) {

                var vertex = point.vertex;
                point.r = point.data.readInt16BE(0) / ROWS;
                point.c = point.data.readInt16BE(2) / COLUMNS;
                vertex.data('color', new THREE.Color().setRGB(point.r, point.c, 1))
            });

            callback();

            points = _.sortBy(points, 'col');
            points = _.sortBy(points, 'row');

            points.forEach(function (point) {

                if (_DEBUG)  console.log('row: %s(%s), col: %s(%s), r: %s, c: %s', point.row, point.row / ROWS, point.col, point.col / COLUMNS, point.r, point.c);
            })

        });
    }

});

/* --------------- TESTS --------------------- */

tap.test('Base', {timeout: 1000 * 1000, skip: false }, function (suite) {

    suite.test('Binary Data Reader', {timeout: 1000 * 100, skip: false }, function (bintest) {
        _make_a_huge_binary_file(HUGE_FIBE, function () {
            console.log('huge test file written');
            var reader = new XY_Reader(2, ROWS, COLUMNS, 4);

            reader.init(function () {

                reader.planet.draw_triangles(720, 360, path.resolve(WRITE_ROOT, 'huge.png'), function () {
                    bintest.end();
                })
            })
        })
    });


    suite.test('data slice', {timeout: 1000 * 1000, skip: false }, function (t) {
        var count = 0;
        var r = 0;
        var c = 0;
        var n = 0;
        var row = 0;
        var start = row * (4 * COLUMNS);
        var stream = fs.createReadStream(HUGE_FIBE, {start: start, end: start + (4 *  COLUMNS) });
        var err = false;
        var out = [];

        stream.on('data', function (buffer) {

            _.range(0, buffer.length - 2, 2).forEach(function (i) {
                var value = (buffer.readInt16BE(i));
                out.push(value);
            });
        });

        stream.on('end', function () {
            console.log('binary data: %s ... %s', out.slice(0, 10).join(','), out.slice(-10).join(','));
            _.range(0, out.length, 8).forEach(function(start){

                console.log(out.slice(start, start + 8).map(function(n){var n = n + ''; while(n.length < 5){ n = ' ' + n}; return n}).join(','));

            });
            console.log('done with read test');
            t.end();
        })
    });


    suite.test('data validation', {timeout: 1000 * 1000, skip: true }, function (t) {
        var count = 0;
        var r = 0;
        var c = 0;
        var n = 0;
        var stream = fs.createReadStream(HUGE_FIBE);
        var err = false;

        stream.on('data', function (buffer) {
            var out = [];

            _.range(0, buffer.length, 2).forEach(function (i) {

                var value = (buffer.readInt16BE(i));
                out.push(value);
                if (err || (count > ROWS * COLUMNS)) return;
                switch (n) {
                    case 0:
                        t.equal(value, r, 'big data row ' + r);
                        if (r != value) err = true;
                        n = 1;
                        break;

                    case 1:
                        t.equal(value, c, 'big data col ' + c);
                        if (value != c) err = true;
                        n = 0;
                        ++c;
                        break;
                }
                if (c >= COLUMNS) {
                    console.log("breaking C: %s", c)
                    ++r;
                    c = 0;
                }
                ++count;
            });
            if (_DEBUG)    console.log('binary data: %s', out.join(','));
        });

        stream.on('end', function () {
            console.log('done with read test');
            t.end();
        })
    });

    suite.end();

});