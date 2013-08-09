var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var msgpack = require('msgpack-js');
var _DEBUG = false;
var Gate = require('gate');

/* ------------ CLOSURE --------------- */
_chunk = function (array, chunkSize) {
    return _.reduce(array,function (reducer, item, index) {
        reducer.current.push(item);
        if (reducer.current.length === chunkSize || index + 1 === array.length) {
            reducer.chunks.push(reducer.current);
            reducer.current = [];
        }
        return reducer;
    }, {current: [], chunks: []}).chunks
};
/** ********************
 * Purpose: to pack the planetary data as a msgpack buffer.
 */

function bin_planet(callback, asJSON, root) {
    var GeoSphere = require('./../../index.js');
    if (_DEBUG)  console.log('pack args: %s', _.toArray(arguments).join(','));
    this.ensure_sectors();

    var file = this.bin_file(asJSON, root);

    if (asJSON) {
        var data = this.vertices(function (v) {
            return {
                i: v.index,
                c: v.toArray(),
                u: v.uv.toArray(),
                n: v.planet.neighbors(v.index, true).concat([-1, -1, -1, -1, -1]).slice(0, 6),
                s: v.data('sectors').concat([-1, -1]).slice(0, 2)
            };
        });

        return fs.writeFile(file, JSON.stringify(data), callback);
    }


    var stream = fs.createWriteStream(file);
    var datas = [];

    this.vertices(function (v) {

        var buffer = new Buffer(GeoSphere.Planet.VERTEX_BUFFER_SIZE);

        buffer.writeInt32BE(v.index, 0);
        buffer.writeFloatBE(v.x, 4);
        buffer.writeFloatBE(v.y, 8);
        buffer.writeFloatBE(v.z, 12);
        buffer.writeFloatBE(v.uv.x, 16);
        buffer.writeFloatBE(v.uv.y, 20);
        // 6 4-byte numbers
        v.planet.neighbors(v.index, true).concat([-1, -1, -1, -1, -1, -1]).slice(0, 6)
            .forEach(function (neighbor, i) {
                buffer.writeInt32BE(neighbor, i * 4 + 24);
            });
        // 6 4-bytes numbers
        v.data('sectors').concat([-1, -1]).slice(0, 2)
            .forEach(function (s, i) {
                buffer.writeInt32BE(s, 48 + (i * 4));
            });
        // 2 2-byte numbers

        datas.push(buffer);
    });

    while (datas.length) {
        var buffers = Buffer.concat(datas.splice(0, 40));
      //  console.log('writing %s to %s', buffers.length, file);
        stream.write(buffers);
    }

    stream.on('finish', callback);
    stream.end();
}

/* -------------- EXPORT --------------- */

module.exports = bin_planet;