var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var array_to_canvas = require('./../util/array_to_canvas');
var canvas_to_file = require('./../util/canvas_to_file');
var Gate = require('gate');
var events = require("events");

var Tile = require('./Elevation/Tile.js');
var Base = require('./../util/_Base.js');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function Index(depth) {

    Base.call(this, depth);
    this.tiles = [];
}


util.inherits(Index, Base);

_.extend(Index.prototype, {

    init: function (callback) {
        var gate = Gate.create();

        this._load_tiles();

        this.tiles.forEach(function (tile) {
            tile.init(gate.latch());
        });

        var self = this;
        gate.await(function () {
            self.raw_data_to_planet(callback);
        });
    },

    poll: function (r, c) {
        if (!this._r) {
            this._r = {};
            this._c = {};
        }

        this._r[r] = true;
        this._c[c] = true;
    },

    _load_tiles: function () {
        var self = this;
        var GeoSphere = require('./../../index.js');
        var data_file = fs.readFileSync(path.resolve(GeoSphere.CLIMATE_ROOT, 'GLOBE_data', 'index.txt'), 'utf8');
        var lines = data_file.split(/[\r\n]+/);
        var index = lines[0].split(/[\s]+/);
        lines.slice(1).forEach(function (line) {
            var info = line.split(/[\s]+/).map(function (value, i) {
                return i ? parseInt(value) : value;
            });
            self.add_tile(_.object(index, info));
        });
    },

    add_tile: function (data) {
        this.tiles.push(new Tile(data, this));
    },

    uv_height: function (u, v, callback) {
        var tile = _.find(this.tiles, function (tile) {
            return tile.match_uv(u, v);
        });

        if (tile) {
            return tile.uv_height(u, v, callback);
        } else {
            callback(new Error('cannot find tile for uv ' + u + ', ' + v))
        }

    },

    raw_data_to_planet: function (callback) {

        var gate = Gate.create();
        var self = this;
        _.sortBy(this.planet.vertices(),function (vertex) {
            return (vertex.uv.y + 1) * 10 + vertex.uv.x;
        }).forEach(
            function (vertex) {
                var l = gate.latch();

                self.uv_height(vertex.uv.x, vertex.uv.y, function (err, height) {
                    //  console.log('setting %s of %s to %s', ele_word, vertex.index, height);
                    vertex.data('elevation', height);
                    l();
                })

            });

        gate.await(callback);
    },

    draw: function (width, height, file, callback) {
        this.planet.vertex_data_ops('color', '^elevation', '=', 2000, '/');
        this.planet.draw(width, height, file, callback);
    },

    buffer_size: function(){
        return 4;
    },

    buffer_to_vertex: function(vertex, buffer){
        this.planet.vertex_data('elevation', buffer.readInt16BE(0));
    },

    vertex_to_buffer: function(vertex){
        var buffer = new Buffer(2);
        var ele = vertex.data('elevation');
        if (ele > 10000) ele = 0;
        try {

            buffer.writeInt16BE(ele, 0);
        } catch(err){
            console.log('cannot transfer value %s', ele);
            throw err;
        }
        return buffer;
    }
});

/* ********* EXPORTS ******** */

module.exports = Index;