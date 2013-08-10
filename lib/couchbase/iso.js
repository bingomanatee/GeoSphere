var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Gate = require('gate');
var THREE = require('three');

var async = require('async');
var couchbase = require('couchbase');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To save point data as a binary data for faster loading
 */

function write_iso_data(cb, min_depth, max_depth) {
    if (!_.isFunction(cb)) throw new Error('first argument to write_iso_data must be function');

    var collection;

    var scripts = [
        function (callback) {
            couchbase.connect({
                hosts: ['localhost:8091'],
                bucket: 'geosphere'
            }, function (err, cb) {

                collection = cb;

                callback(err);
            })
        },
        function (callback) {

            var gate = Gate.create();
            _.range(min_depth, max_depth)
                .forEach(function (detail) {
                    var gate2 = Gate.create();
                    var iso = new THREE.IcosahedronGeometry(1, detail);
                    iso.vertices.forEach(function (vertex, i) {
                        var link = gate2.latch();
                        var key = 'p' + vertex.index + 'd' + detail;
                        process.nextTick(function () {
                            collection.get(key, function (err, doc) {
                                var exists = !!doc;
                                if (!doc) doc = {};
                                _.extend(doc, {
                                    type: 'point',
                                    detail: detail,
                                    order: vertex.index
                                });

                                doc.coords = _.pick(vertex, 'x', 'y', 'z');
                                doc.uv = _.pick(vertex.uv, 'x', 'y');

                                //        console.log('emitting %s', util.inspect(doc));

                                if (exists) {
                                    collection.replace(key, doc, function (err, doc) {
                                        //     console.log('replacing %s', util.inspect(doc));
                                        if (err) console.log('err: %s', err);
                                        link(err)
                                    })
                                } else {
                                    collection.add(key, doc, function (err, doc) {
                                        //     console.log('adding %s', util.inspect(doc));
                                        if (err) console.log('err: %s', err);
                                        link(err)
                                    });
                                }
                            });
                        })
                    });
                    var l = gate.latch();
                    gate2.await(function () {
                        console.log('done writing iso at detail %s', detail);
                        l();
                    })
                }
            );

            gate.await(callback);
        },
        function (callback) {
            collection.view('points', 'points', {group: true}, function (err, doc) {

                console.log('counts: %s', JSON.stringify(doc, true, 4));
                callback();
            });
        },

        function (callback) {
            collection.shutdown();
            callback();
        }
    ];

    async.series(scripts, cb);

}

/* -------------- EXPORT --------------- */

module.exports = write_iso_data;