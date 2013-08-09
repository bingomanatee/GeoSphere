var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Gate = require('gate');
var _DEBUG = false;

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

function _bin_to_vertex_data(buffer) {
    var i = 0;
    return {
        i: buffer.readInt32BE(0),
        c: [buffer.readFloatBE(4), buffer.readFloatBE(8), buffer.readFloatBE(12)],
        u: [buffer.readFloatBE(16), buffer.readFloatBE(20)],
        n: [buffer.readInt32BE(24), buffer.readInt32BE(28),
            buffer.readInt32BE(32), buffer.readInt32BE(36),
            buffer.readInt32BE(40), buffer.readInt32BE(44)
        ],
        s: [buffer.readInt32BE(48), buffer.readInt32BE(52)]
    };
};



/** ********************
 * Purpose: to unpack the planetary data as a msgpack buffer.
 */

function unbin_planet(callback, asJSON, root) {
    if (_DEBUG)  console.log('pack args: %s', _.toArray(arguments).join(','));
    var Planet = require('./../../index.js').Planet;

    var self = this;
    var VECTORS_PER_SET = 20;
    var total_number_of_vectors = Planet.VERTEX_COUNT[this.depth];

    var file = this.bin_file(asJSON, root);

    var stat = fs.statSync(file);

  //  console.log('reading file %s (%s b)', file, stat.size);

    fs.open(file, 'r', function (err, handle) {
        if (err) throw err;

        var vertices = [];
        var gate = Gate.create();

        _.range(0, total_number_of_vectors, VECTORS_PER_SET).forEach(function (index) {

            var vectors_left = Math.min(VECTORS_PER_SET, total_number_of_vectors - index);
            var buffer = new Buffer(Planet.VERTEX_BUFFER_SIZE * vectors_left);

            var start = index * Planet.VERTEX_BUFFER_SIZE;
            var latch = gate.latch();
            fs.read(handle, buffer, 0,
                buffer.length, start, function (err, read, full_buffer) {
                    _.range(0, full_buffer.length, Planet.VERTEX_BUFFER_SIZE).forEach(function(buffer_offset){
                        var data = _bin_to_vertex_data(full_buffer.slice(buffer_offset, buffer_offset + Planet.VERTEX_BUFFER_SIZE));
                        vertices[data.i] = data;
                    });
                    latch();
                });

        });

        gate.await(function(){
            fs.close(handle);
            callback(null, vertices);
        })

    });

    /*
     var vector_sets = Math.floor(vector_count / VECTORS_PER_SET);
     var gate = Gate.create();
     var bytes_per_vector_set = Planet.VERTEX_BUFFER_SIZE * VECTORS_PER_SET;
     var size_of_all_vector_sets = vector_sets * bytes_per_vector_set;
     var size_of_file = vector_count * Planet.VERTEX_BUFFER_SIZE;

     var data = [];

     _.range(0, size_of_all_vector_sets, bytes_per_vector_set)
     .forEach(function (start, set_index) {
     var buffer = new Buffer(bytes_per_vector_set);
     var latch = gate.latch();
     fs.read(handle, buffer, 0, bytes_per_vector_set, start, function (err, read, full_buffer) {
     _.range(0, full_buffer.length, Planet.VERTEX_BUFFER_SIZE)
     .forEach(function (buffer_offset, buffer_index) {
     var sub_buffer = full_buffer.slice(buffer_offset, buffer_offset + Planet.VERTEX_BUFFER_SIZE);
     vector_data = _bin_to_vertex_data(sub_buffer);
     data[vector_data.index] = vector_data;
     });

     latch();
     })

     });

     var remaining_vectors = vector_count - (vector_sets * VECTORS_PER_SET);
     var rem_buffer = new Buffer(remaining_vectors * Planet.VERTEX_BUFFER_SIZE);
     var latch = gate.latch();
     fs.read(handle, rem_buffer, 0, rem_buffer.length, size_of_all_vector_sets, function(err, br, full_buffer){
     _.range(0, size_of_file - size_of_all_vector_sets, Planet.VERTEX_BUFFER_SIZE)
     .forEach(function (start, vector_count) {
     var vector_buffer = full_buffer.slice(start, start + Planet.VERTEX_BUFFER_SIZE);
     var vector_data = _bin_to_vertex_data(vector_buffer);
     data[vector_data.index] = vector_data;
     });
     latch();
     });

     gate.await(function(){

     return callback(null, data);
     })

     });
     }*/

}

/* -------------- EXPORT --------------- */

module.exports = unbin_planet;