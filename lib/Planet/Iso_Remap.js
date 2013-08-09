var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var humanize = require('humanize');

var Iso_Map = require('./Iso_Remap/Iso_Map.js')
var _reorder_cache = [];
var Gate = require('gate');

function Iso_Remapped(detail) {
    this.detail = detail;
    this.maps = [];
}

Iso_Remapped.cache = function (n) {
    return _reorder_cache[n];
}

_.extend(Iso_Remapped.prototype, {

    load_cache_from_bin: function (callback) {
        var gate = Gate.create();

        this.maps = _.range(0, this.detail + 1).map(function (detail) {
            var map = new Iso_Map(detail, true);
            map.import(gate.latch());
            return map;
        });

        var self = this;

        gate.await(function () {
            _reorder_cache = self.maps.map(function (map) {
                return map.summary();
            });

            callback();
        });

    },

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


    export_bin: function (cb, write_root) {
        var gate = Gate.create();

        this.maps.map(function (map) {
            if (write_root)  map.file_root = write_root;
            console.log('writing binary for %s', map);
            var l = gate.latch();
            map.export(true, function () {
                console.log('written binary for %s', map);
                l();
            });

        });

        gate.await(cb);
    },

    reorder_iso: function (iso, callback) {
        var map = new Iso_Map(iso);
        map.import(function () {
            callback(null, map);
        })
    },

    humanize: humanize

});


Iso_Remapped.preload = function (n) {
    var remapper = new Iso_Remapped(n);
    remapper.import_bin();

}

Iso_Remapped.reorder_iso_from_cache = function (iso) {

    if (!_reorder_cache[iso.detail]) throw new Error("have not cached iso detail " + iso.detail);

    var map = new Iso_Map(iso.detail, true);
    map.apply_cache_data(_reorder_cache[iso.detail], iso);


};

module.exports = Iso_Remapped;