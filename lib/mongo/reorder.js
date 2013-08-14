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

var Point = GeoSphere.model.Point;

/* ------------ CLOSURE --------------- */

function find_real_neighbors(point, cb) {
    Point.find({detail: point.detail, order: {$in: point.neighbors}}, 'real_order', function (err, neighbors) {
        point.ordered_neighbors = neighbors.map(function (n) {
            return n.real_order;
        });

        point._markModified('ordered_neighbors');
        point.save(cb);
    });
}

/** ********************
 * Purpose: To save point data as a binary data for faster loading
 */

function write_iso_data(cb, min_depth, max_depth) {
    if (!_.isFunction(cb)) throw new Error('first argument to write_iso_data must be function');

    var scripts = [

        /**
         * Assign parent and child relationships based on coordinates
         * @param callback
         */
            function (callback) {
            var point_stream = Point.find().stream();
            var gate = Gate.create();
            point_stream.on('data', function (point) {
                var latch = gate.latch();
                point.find_parent(function (err, parent) {
                    if (parent) {
                        console.log('parent of %s is %s', point._id, parent._id);
                        point.parent = parent._id;
                        point.save(function () {
                            parent.child = point._id;
                            parent.save(latch);
                        });
                    } else {
                        latch();
                    }
                })

            });

            point_stream.on('close', function () {
                gate.await(callback);
            })
        },

        /**
         * Report the "before" condition of selected records
         *
         * @param callback
         */
            function (callback) {
            var gate = Gate.create();

            _.range(min_depth, max_depth).forEach(function (depth) {
                var t_latch = gate.latch();
                Point.report(depth, function (err, table) {
                    console.log("\n ---------- pre-reorder depth %s --------- \n\n%s", depth, table);
                    t_latch();
                }, 50, 10);
            });

            gate.await(callback);

        },

        /**
         * Setting real order of each record
         * @param callback
         */
            function (callback) {
            var gate = Gate.create();
            _.range(min_depth, max_depth).forEach(function (depth) {
                var count_latch = gate.latch();

                Point.find({detail: depth})
                    .count(function (err, n) {
                        if (n > 0) {
                            var stream = Point.find().stream();

                            stream.on('data', function (item, cb) {
                                item.get_real_order(function (err, ro) {
                                    item.real_order = ro;
                                    item.save(gate.latch());
                                });
                            });

                            stream.on('close', gate.latch());
                        }
                        count_latch();
                    });
            });

            gate.await(callback);
        },

        /**
         * getting the real order of neighbors
         *
         * @param callback
         */
        function (callback) {
            // > db.points.find({detail: 1}, {order: 1, parent: 1}).sort({parent: 1, order: 1})

            var gate = Gate.create();
            _.range(min_depth, max_depth).forEach(function (depth) {
                var count_latch = gate.latch();

                Point.find({detail: depth})
                    .count(function (err, n) {

                        if (n > 0) {
                            var stream = Point.find().stream();

                            stream.on('data', function (err, record) {
                                if (err) throw err;

                                find_real_neighbors(record, gate.latch());
                            });

                            stream.on('close', gate.latch());

                        }

                        count_latch();
                    }
                )

            });

            gate.await(callback);
        },

        function (callback) {
            var gate = Gate.create();

            _.range(min_depth, max_depth).forEach(function (depth) {
                var t_latch = gate.latch();
                Point.report(depth, function (err, table) {
                    console.log("\n ---------- depth %s --------- \n\n%s", depth, table);
                    t_latch();
                }, 50, 10);
            });

            gate.await(callback);

        },

        function (callback) {
            GeoSphere.model.close();
            callback();
        }
    ];

    async.series(scripts, cb);

}

/* -------------- EXPORT --------------- */

module.exports = write_iso_data;