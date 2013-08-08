var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To record and reorder the vertices of an Isocehedron
 */

var THREE = require('three');
var humanize = require('humanize');
var assert = require('assert');
var _DEBUG = false;
var Iso_Map_Vertex = require('./Iso_Map_Vertex');
var Gate = require('gate');
var table = require('cli-table');

var VERTEX_COUNT = [
    12,
    42,
    162,
    242,
    2562,
    10242,
    40962,
    163842
];

function Iso_Map(detail, import_bin) {

    if (import_bin) {
        this.detail = detail;
        this.vertices = [];
        _.range(0, VERTEX_COUNT[detail]).forEach(function (order) {
            this.vertices[order] = new Iso_Map_Vertex({}, order, this);
        }, this);
    } else {
        if (_.isNumber(detail)) {
            this.iso = new THREE.IcosahedronGeometry(1, detail);
            this.detail = detail;
        } else {
            this.iso = detail;
            this.detail = this.iso.detail;
            console.log('detail: %s', this.detail);
        }

        this.vertices = this.iso.vertices.map(function (vertex, i) {
            return new Iso_Map_Vertex(vertex, i, this);
        }, this);
    }
}

var _map = _.template('vertex map [DETAIL <%= detail %>; mpo <%= max_parented_order() %>]');

_.extend(Iso_Map.prototype, {

    import: function (cb) {

        var gate = Gate.create();
        var self = this;
        var file = this.bin_file();
        console.log('reading %s', file);
        fs.open(file, 'r', function (err, handle) {
            if (err) throw err;
            self.vertices.forEach(function (vertex, i) {
                vertex.import(handle, gate.latch());
            });

            gate.await(function () {
                fs.close(handle);
                if (self.iso) self.reorder_iso();
                cb();
            })
        });
    },

    summary: function(){
        return this.vertices.map(function(v){
            return v.real_order();
        })
    },

    reorder_iso: function (iso) {
        if (!iso) iso = this.iso;

        this.vertices.forEach(function (vertex) {
            iso.vertices[vertex.order].index = vertex.real_order();
        }, this);

        iso.vertices = _.sortBy(iso.vertices, 'index');

        iso.faces.forEach(function (face) {
            face.a = this.vertices[face.a].real_order();
            face.b = this.vertices[face.b].real_order();
            face.c = this.vertices[face.c].real_order();
        }, this);

        this.iso.vertices = _.sortBy(this.iso.vertices, 'index');
    },

    find_value: function (value) {
        if (_DEBUG) console.log('looking for point value %s', value);
        return _.find(this.vertices, function (vertex) {
            return vertex.value == value;
        })
    },

    _unparented_ranked: false,

    rank_unparented: function () {
        if (!this._unparented_ranked) {
            this.vertices.forEach(function (v) {
                v.unparented_rank_value = 0;
            });
            _.sortBy(this.unparented(), 'order').forEach(function (v, i) {
                v.unparented_rank_value = i + 1;
            })
            this._unparented_ranked = true;
        }
    },

    unparented: function () {
        if (!this._unparented) {
            this._unparented = this.vertices.filter(function (vertex) {
                return !(vertex.p_order() > -1);
            })
        }
        return this._unparented;
    },

    parented: function () {
        var self = this;
        if (!this._parented) {
            this._parented = this.vertices.filter(function (vertex) {
                return vertex.p_order() > -1;
            })
        }
        return this._parented;
    },

    max_parented_order: function () {
        if (!this._max_parented_order) {
            this._max_parented_order = this.parented().reduce(function (out, vertex) {
                return Math.max(out, vertex.p_order())
            }, -1);
        }
        return this._max_parented_order;
    },

    report: function () {

        var t = new table({
            head: ['index', 'order', 'x', 'y', 'z', 'd order', 'p order', 'unp rank', 'real_order'],
            colWidths: [12, 12, 10, 10, 10, 12, 12, 12, 12],
            colAligns: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right']
        });


        this.vertices.forEach(function (v) {
            t.push(v.report())
        });

        try {
            return util.format("\n MAP %s \n%s", this, t.toString().replace(/[├───┼───┤]+\n/g, ""));
        } catch (err) {
            console.log('cannot report table %s: %s', util.inspect(t), err);
            throw err;
            return '';
        }
    },

    toString: function () {
        return _map(this);
    },

    link_to: function (denser_map) {

        if (!denser_map) return;

        this.denser = denser_map;
        denser_map.parent = this;

        this.vertices.forEach(function (vertex) {

            var denser = this.denser.find_value(vertex.value);

            if (denser) {
                vertex.denser = denser;
                denser.parent = vertex;
                if (_DEBUG) console.log('matching vertex point %s with denser point %s', vertex, denser);
            } else {
                if (_DEBUG)      console.log('cannot match vertex point %s with map %s', vertex, denser_map);
            }

        }, this);

    },

    bin_file: function () {
        if (this.file_root){
            return path.resolve(this.file_root, 'detail_' + this.detail + '.bin');
        } else {
            var GeoSphere = require('./../../../index.js');
            return  path.resolve(GeoSphere.CLIMATE_BINARY, 'order_remap/detail_' + this.detail + '.bin');
        }
    },

    export: function (bin, cb) {
        var file;
        if (bin) {
            if (!_.isFunction(cb)) {
                throw new Error('export bin must have callback');
            }
            file = this.bin_file();

            var stream = fs.createWriteStream(file, {encoding: 'utf8'});
            var self = this;

            var buffers = [];

            var i = 0;

            function _do_point_set() {
                //   console.log('writing set %s of map %s', i, self);
                if (i >= self.vertices.length) {
                    if (buffers.length) {
                        stream.write(Buffer.concat(buffers));
                    }
                    //  console.log('closing %s', self);
                    stream.end();
                    return;
                }

                while (i < self.vertices.length && buffers.length < 100) {
                    buffers.push(self.vertices[i].export(true));
                    ++i;
                }

                if (buffers.length) {
                    stream.write(Buffer.concat(buffers), _do_point_set);
                    buffers = [];
                } else {
                    _do_point_set();
                }

            }

            stream.on('finish', function () {
                console.log('done writing set %s of map %s', i, self);

                cb();
            });

            _do_point_set();

        } else {

            var out = this.vertices.map(function (v) {
                return v.export();
            });

            fs.writeFileSync(this.bin_file(), JSON.stringify(out));
        }
    },

    humanize: humanize

});

/* -------------- EXPORT --------------- */

module.exports = Iso_Map;