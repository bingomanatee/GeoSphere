var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var array_to_canvas = require('./array_to_canvas');
var canvas_to_file = require('./canvas_to_file');
var Gate = require('gate');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function Tile(params, index) {
    this.rows = 0;
    this.cols = 0;
    this.index = index;
    this.encoding = 'Int16BE';

//	console.log('tile params: %s', util.inspect(params));
    if (params) _.extend(this, params);
}

Tile.prototype = {

    min_u: function () {
        if (!this._min_u) {
            this._min_u = (this.lon_min + 180) / 360;
        }
        return this._min_u;
    },

    max_u: function () {
        if (!this._max_u) {
            this._max_u = (this.lon_max + 180) / 360;
            if (this._max_u == 1) this._max_u = 1.1;
        }
        return this._max_u;
    },

    min_v: function () {
        if (!this._min_v){
           this._min_v = (90 -this.lat_max) / 180;
        }
        return this._min_v;
    },

    max_v: function () {
        if(!this._max_v){
            this._max_v = (90 - this.lat_min) / 180;
            if (this._max_v == 1) this._max_v = 1.1;
        }
   return this._max_v;
    },

    match_uv: function (u, v) {
        return (this.min_u() <= u && this.max_u() > u && this.min_v() <= v && this.max_v() > v);
    },

    match_deg: function (lat, lon) {
        return this.lat_min <= lat && this.lat_max > lat && this.lon_min <= lon && this.lon_max > lon;
    },

    uv_height: function (u, v, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('uv_height called without callback');
        }

        if (!this.u_scale) {
            this.u_scale = (this.max_u() - this.min_u());
            this.v_scale = (this.max_v() - this.min_v());
        }

        var u_scale = (u - this.min_u()) / this.u_scale;
        var v_scale = (v - this.min_v()) / this.v_scale;
        var row = Math.min(this.rows, Math.max(0, Math.round(this.rows * u_scale)));
        var col = Math.min(this.cols, Math.max(0, Math.round(this.cols * v_scale)));
        this.rc_value(row, col, function(err, height){
            if (err) throw err;
            callback(err, height);
        });
    },

    range: function (callback) {
        var file = this.get_file_path();
        var stream = fs.createReadStream(file);

        var min = null;
        var max = null;

        stream.on('data', function (buffer) {
            var index = 0;

            _.range(0, buffer.length, 2).forEach(function (index) {
                var number = buffer.readInt16LE(index);
                if (number == -500) return;
                if (_.isNull(min)) {
                    min = max = number;
                } else {
                    min = Math.min(min, number);
                    max = Math.max(max, number);
                }
            })
        });

        stream.on('end', function () {
            console.log('done reading %s', file);
            callback(null, min, max);
        });
    },

    get_file_path: function () {
        return  path.resolve(this.index.root, this.tile);
    },

    init: function (callback) {
        var self = this;
        this.file_path = this.get_file_path();
        //console.log('initializing %s', this.file_path);
        var stat = fs.statSync(this.file_path);
      //  console.log('file size: %s; bytes per data: %s', stat.size, stat.size / (this.rows * this.cols));

        fs.open(this.file_path, 'r', function (err, handle) {
            if (err) throw err;
            if (!handle) throw new Error('no handle');
            self.handle = handle;
            callback(err);
        });
    },

    rc_value: function (r, c, callback) {
        var index = r * this.cols + c * 2;

        this.index.poll(r, c);

        if (!this.handle) {
            throw new Error('getting rc_value from uninitialized tile');
        } else {
            var buffer = new Buffer(2);
            fs.read(this.handle, buffer, 0, 2, index, function (err, count, buffer) {
                callback(null, buffer.readUInt16LE(0));
            });
        }
    },

    /**
     * this will produce a scaled - down image data set for this tile.
     * NOTE: originally designed to "slice" a subset of the region,
     * the slicing variables are currently ignored.
     *
     * @param props
     * @param callback
     */
    rc_map: function (props, callback) {
        var self = this;
        //	console.log('mapping %s with %s', this.file_path, util.inspect(props));
        props.r_max = Math.min(this.rows, props.r_max);
        props.c_max = Math.min(this.cols, props.c_max);
        props.inc |= 1;
        props.scale |= 2000;

        var gate = Gate.create();
        var out = [];
        var cols = 0;
        var rows = 0;
        var col_bytes = 2 * this.cols;

        _.range(props.r_min, props.r_max, props.inc).forEach(function (r, row_index) {
            ++rows;

            var start = 2 * this.cols * r;
            var buffer = new Buffer(col_bytes);
            var l = gate.latch();

            fs.read(this.handle, buffer, 0, col_bytes, start, function (err, bytes, buffer) {
                //	if (r < 4) console.log('bytes read: %s, desired %s', bytes, col_bytes);
                var data = [];

                _.range(0, col_bytes, 2 * props.inc).forEach(function (buffer_place) {
                    var i = buffer.readUInt16LE(buffer_place);
                    if (i > 10000) {
                        i = 0;
                    }
                    data.push(Math.min(1, Math.sqrt(i / (props.scale))));
                })
                out[row_index] = data;
                cols = data.length;
                l();
            });

        }, this);

        gate.await(function () {

            /**
             * GLOBE data is row- centric. array_to_canvas is column- centric.
             * For that reason we reverse the data order before passing it out.
             * @type {*}
             */

            var reverse_out = _.map(_.range(0, out[0].length), function (r) {
                return out.map(function (range) {
                    return range[r];
                });
            })
            //	console.log('read (rows %s x cols %s) data from %s', rows, cols, self.file_path);
            callback(null, {rows: rows, cols: cols, values: _.flatten(reverse_out)});
        })
    }, draw: function (params, callback) {
        var self = this;

        if (!this.handle) {
            return this.init(function () {
                self.draw(params, callback);
            });
        }

        //	console.log('drawing %s', params.file);
        params.r_min |= 0;
        params.r_max |= this.rows;
        params.c_min |= 0;
        params.c_max |= this.cols;
        if (!params.file) throw new Error('Must specify file');
        this.rc_map(params, function (err, data) {
            //	console.log('creating %s(%s x %s) from %s.... [%s]', params.file, data.cols, data.rows, data.values.slice(0, 50).join(','), data.values.length);
            var c = array_to_canvas(data.cols, data.rows, data.values);
            canvas_to_file(c, params.file, function () {
                console.log('_____ finished writing %s', self.file_path);
                callback();
            });
        });
    }

};

function Index(root) {
    this.root = root;
    this.tiles = [];
    this.parse_index();
}

Index.prototype = {

    init: function (cb) {
        var gate = Gate.create();

        this.tiles.forEach(function (tile) {
            tile.init(gate.latch());
        })

        gate.await(cb);
    },

    poll: function(r, c){
      if (!this._r) {
          this._r = {};
          this._c = {};
      }

        this._r[r] = true;
        this._c[c] = true;
    },

    parse_index: function () {
        var self = this;
        var data_file = fs.readFileSync(this.root + '/index.txt', 'utf8');
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

    }
};

/* ********* EXPORTS ******** */

module.exports = {
    Tile: Tile,
    Index: Index
};