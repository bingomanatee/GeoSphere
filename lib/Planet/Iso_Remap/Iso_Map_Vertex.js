var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var humanize = require('humanize');
var _DEBUG = false;
var assert = require('assert');

var FLOAT_TOLERANCE = 0.0001;

function Iso_Map_Vertex(vertex, order, map) {
    this.map = map;
    this.vertex = vertex;
    this.index = vertex.hasOwnProperty('index') ? vertex.index : order;
    this.order = order;
    this.value = vertex.hasOwnProperty('x') ? vertex.toArray().join(',') : 0;
    if (isNaN(this.order)) throw new Error('bad vertex');
}

var _vertex_map_point = _.template('vertex point order: <%= order %> ' +
    '(<%= humanize.numberFormat(vertex.x, 3) %>, <%= humanize.numberFormat(vertex.y, 3) %>, <%= humanize.numberFormat(vertex.z, 3) %>)' +
    ' of map <%= map.detail %>');

_.extend(Iso_Map_Vertex.prototype, {

    report: function () {
        return   [
            this.index, this.order,
            humanize.numberFormat(this.vertex.x, 4),
            humanize.numberFormat(this.vertex.y, 4),
            humanize.numberFormat(this.vertex.z, 4),
            this.d_order(true),
            this.p_order(true),
            this.unparented_rank(),
            this.real_order(true)
        ]
    },

    import: function (handle, callback) {
        var buffer = new Buffer(this._buffer_file_size());
        var self = this;
        if (_DEBUG)     console.log('importing: %s, %s, %s', handle, buffer, 0, buffer.length);
        fs.read(handle, buffer, 0, buffer.length,
            this._buffer_file_size() * this.order, function (e, b, bb) {
                self._on_import(e, b, bb);
                callback();
            });
    },

    _on_import: function (err, br, full_buffer) {
        var ord = full_buffer.readInt32BE(0);
        var real_order = full_buffer.readInt32BE(4);
        var x = full_buffer.readFloatBE(8);
        var y = full_buffer.readFloatBE(12);
        var z = full_buffer.readFloatBE(16);

        if (_DEBUG) console.log('read from %s for vertex %s of detail %s: order %s, read_order: %s, x: %s, y: %s, z: %s',
            this.map.bin_file(), this.order, this.map.detail, ord, real_order, x, y, z);

        try {
            assert.equal(ord, this.order, 'right order read');
            if (this.vertex.hasOwnProperty('x')) {
                assert(Math.abs(x - this.vertex.x) < FLOAT_TOLERANCE, 'right x read');
                assert(Math.abs(y - this.vertex.y) < FLOAT_TOLERANCE, 'right y read');
                assert(Math.abs(z - this.vertex.z) < FLOAT_TOLERANCE, 'right z read');
            }
        } catch (err) {
            debugger;
            console.log('error on read: o: %s/, r: %s, x, %s, y: %s, z: %s on vertex %s',
                ord, this.order, real_order, x, y, z, this);
             throw err;
        }

        if (!(this.index == real_order)) {
            if (_DEBUG) console.log('resetting index from %s to %s', this.order, real_order);
        }
        this._real_order = real_order;
    },

    d_order: function (s) {
        if (this.denser) return this.denser.order;
        return s ? ' ' : -1;
    },

    _buffer_file_size: function () {
        return 4 + 4 + (3 * 4);
    },

    export: function (bin) {

        if (bin) {
            var buffer = new Buffer(this._buffer_file_size());
            buffer.writeInt32BE(this.order, 0);
            buffer.writeInt32BE(this.real_order(), 4);
            buffer.writeFloatBE(this.vertex.x, 8);
            buffer.writeFloatBE(this.vertex.y, 12);
            buffer.writeFloatBE(this.vertex.z, 16);

            if (this.map.detail == 2) {
                console.log('exporting as bin: %s, %s, %s, %s, %s',
                    this.order, this.real_order(), this.vertex.x, this.vertex.y, this.vertex.z
                );
            }
            return buffer;
        }
        return {
            o: this.order,
            r: this.real_order(),
            x: this.vertex.x,
            y: this.vertex.y,
            z: this.vertex.z
        }

    },

    p_order: function (s) {
        if (this.parent) {
            if (!this.parent.hasOwnProperty('order')) {
                throw new Error(util.format('bad parent %s', util.inspect(this.parent)));
            }
            return this.parent.order;
        }
        return s ? ' ' : -1;
    },

    toString: function () {
        return _vertex_map_point(this);
    },

    real_order: function () {
        if (this.hasOwnProperty('_real_order')) {
            return this._real_order;
        }
        if (!this.parent) {
            return this._stack_order();
        } else {
            return this.parent.real_order();
        }
    },

    rank_unparented: function () {
        var self = this;
        return this.map.unparented().reduce(function (out, vertex) {
            if (vertex.order <= self.order) {
                return out + 1;
            } else {
                return out;
            }
        }, 0);
    },

    unparented_rank: function () {
        if (!this.hasOwnProperty('unparented_rank_value')) {
            this.map.rank_unparented();
        }
        return this.unparented_rank_value;
    },

    _stack_order: function () {
        var max_parented_order = this.map.max_parented_order();
        if (_DEBUG)    console.log('vertex: %s, max_unparented_order: %s', this, max_parented_order);
        return max_parented_order + this.unparented_rank();
    },

    humanize: humanize

});

module.exports = Iso_Map_Vertex;