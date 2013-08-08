var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var table = require('cli-table');

var THREE = require('three');
var humanize = require('humanize');
var assert = require('assert');
var _DEBUG = false;
var Iso_Map_Vertex = require('./Iso_Remap/Iso_Map_Vertex');
var Gate = require('gate');

function Iso_Map(detail) {
    this.iso = new THREE.IcosahedronGeometry(1, detail);

    this.vertices = this.iso.vertices.map(function (vertex, i) {
        return new Iso_Map_Vertex(vertex, i, this);
    }, this);

    this.detail = detail;
}

var _map = _.template('vertex map [DETAIL <%= detail %>; mpo <%= max_parented_order() %>]');

_.extend(Iso_Map.prototype, {

    find_value: function (value) {
        if (_DEBUG) console.log('looking for point value %s', value);
        return _.find(this.vertices, function (vertex) {
            return vertex.value == value;
        })
    },

    _unparented_ranked: false,

    rank_unparented: function(){
        if (!this._unparented_ranked){
            this.vertices.forEach(function(v){
                v.unparented_rank_value = 0;
            });
             _.sortBy(this.unparented(), 'order').forEach(function(v, i){
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

    export: function (bin, cb) {
        var file;
        if (bin) {
            if (!_.isFunction(cb)) {
                throw new Error('export bin must have callback');
            }
            file = path.resolve(__dirname, '_isomaps/detail_' + this.detail + '.bin');

            var stream = fs.createWriteStream(file, {encoding: 'utf8'});
            var self = this;

            var buffers = [];

            var i = 0;

            function _do_point_set(){
             //   console.log('writing set %s of map %s', i, self);
                if (i >= self.vertices.length){
                    if (buffers.length){
                        stream.write(Buffer.concat(buffers));
                    }
                  //  console.log('closing %s', self);
                    stream.end();
                    return;
                }

                while(i < self.vertices.length && buffers.length < 100){
                    buffers.push(self.vertices[i].export(true));
                  ++i;
                }

                if (buffers.length){
                    stream.write(Buffer.concat(buffers), _do_point_set);
                    buffers = [];
                } else {
                  _do_point_set();
                }

            }

            stream.on('finish', function(){
                console.log('done writing set %s of map %s', i, self);

                cb();
            });

            _do_point_set();

        } else {

            var out = this.vertices.map(function (v) {
                return v.export();
            });

            file = path.resolve(__dirname, '_isomaps/detail_' + this.detail + '.json');

            fs.writeFileSync(file, JSON.stringify(out));
        }
    },

    humanize: humanize


});

function Iso_Remapped(detail) {
    this.detail = detail;

    this.generate();
}

_.extend(Iso_Remapped.prototype, {

    generate: function () {
        this.maps = _.range(0, this.detail + 1).map(function (detail) {
            return new Iso_Map(detail);
        });

        this.maps.forEach(function (map, i) {
            map.link_to(this.maps[i + 1]);
        }, this);

    },

    report: function () {

        return this.maps.slice(0, 3).map(function (map) {
            return map.report();
        }).join("\n\n\n")
    },

    export_bin: function (cb) {
        var gate = Gate.create();

        this.maps.map(function (map) {
            console.log('writing binary for %s', map);
            var l = gate.latch();
            map.export(true, function () {
                console.log('written binary for %s', map);
                l();
            });

        });

        gate.await(cb);
    },

    humanize: humanize

});

module.exports = Iso_Remapped;