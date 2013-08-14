var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Gate = require('gate');
var THREE = require('three');
var _DEBUG = false;

var async = require('async');
var GeoSphere = require('./../../index.js');

var Point = GeoSphere.model.Point();

/* ------------ CLOSURE --------------- */

/**
 * representing a single sector at a given depth
 *
 * @param sector_number {number}
 * @param depth {number}
 * @param pos [{number}] the real_order ids of the points in the sector
 * @constructor
 */
function Sector(sector_number, depth, pos) {
    this.sector_number = sector_number;
    this.point_orders = pos;
    this.depth = depth;
    this.points = [];
    this.child_scctor = null;
}

Sector.prototype = {

    get_points: function (cb) {
        var self = this;
        GeoSphere.model.Point.find({depth: this.depth, real_order: {$in: this.point_orders}},
            function (err, points) {
                self.points = points;
                cb();
            });
    },

    save: function (cb) {
        var self = this;
        GeoSphere.model.Sector.findById(this.sector_number + '.' + this.depth, function (err, old) {
            var sector;

            if (old) {
                sector = old;
            } else {
                sector = new GeoSphere.model.Sector();
                sector._id = self.sector_number + '.' + self.depth;
                sector.depth = self.depth;
                sector.sector_number = self.sector_number;
            }

            sector.real_orders = self.point_orders;
            sector.save(function (err, saved) {
                if (err) throw err;
                cb();
            });
        });
    },

    make_child_sector: function (cb) {
        var self = this;

        GeoSphere.model.Point.find({depth: this.depth + 1, real_order: {$in: this.point_orders}}, function (err, points_at_next_depth) {
            var neighbor_real_orders = _.flatten(points_at_next_depth.map(function (point) {
                return point.ordered_neighbors;
            }));

            var counts = _.groupBy(neighbor_real_orders, _.identity);

            var next_depth_real_orders = self.point_orders.slice();
            _.each(counts, function (pop, count) {
                if (pop.length > 1) {
                    next_depth_real_orders.push(pop[0]);
                }
            });

            next_depth_real_orders = _.sortBy(_.uniq(next_depth_real_orders), _.identity);
            self.child_sector = new Sector(self.sector_number, self.depth + 1, next_depth_real_orders);
            self.child_sector.save(function (err) {
                cb(err, self.child_sector);
            });
        });
    }

};

/** ********************
 * Purpose: To save sector membership,
 * NOTE: min_depth is ignored -- must generate in order
 */

function write_iso_data(cb, min_depth, max_depth) {
    if (!_.isFunction(cb)) throw new Error('first argument to write_iso_data must be function');

    var sectors = [];

    var scripts = [
        function (callback) {

            var gate = Gate.create();

            var iso = new THREE.IcosahedronGeometry(1, 0);
            iso.faces.forEach(function (face, i) {
                var sector = new Sector(i, 0, [face.a, face.b, face.c]);
                sectors.push(sector);
                sector.save(gate.latch());
            });

            gate.await(callback);
        }

    ];

    scripts = scripts.concat(_.range(1, max_depth).map(function (depth) {
        console.log('making function for depth %s', depth);
        return function (callback) {
            console.log('making children at depth %s', depth);
            var new_sectors = [];

            var gate = Gate.create();

            sectors.forEach(function (sector) {
                var l = gate.latch();
                sector.make_child_sector(function (err, child) {
                    new_sectors.push(child);
                    l();
                })

            })

            gate.await(function () {
                sectors = new_sectors;
                console.log('done at depth %s', depth);
                callback();
            });
        }
    }));

    async.series(scripts, cb);

}

/* -------------- EXPORT --------------- */

module.exports = write_iso_data;