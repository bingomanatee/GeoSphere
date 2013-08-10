var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Gate = require('gate');
var THREE = require('three');

var async = require('async');
var couchbase = require('couchbase');

var DOC_CHUNKS = 50;

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
                        var iso = new THREE.IcosahedronGeometry(1, detail);

                        out = [];
                        iso.vertices.forEach(function (vertex, order) {
                            var key = 'p' + vertex.index + 'd' + detail;

                            var vertex_data = {
                                type: 'point',
                                detail: detail,
                                index: vertex.index,
                                order: order,
                                coords: _.pick(vertex, 'x', 'y', 'z'),
                                uv: _.pick(vertex.uv, 'x', 'y'),
                                neighbors: []
                            };

                            iso.faces.filter(function (face) {
                                return ( face.a == order) || (face.b == order) || (face.c == order);
                            }).map(function (face) {
                                    vertex_data.neighbors.push(face.a, face.b, face.c);
                                });

                            vertex_data.neighbors = _.sortBy(_.reject(_.uniq(vertex_data.neighbors), function (n) {
                                return n == order;
                            }), _.identity);

                            out.push({
                                key: key,
                                document: vertex_data
                            });

                            /*
                             process.nextTick(function () {
                             collection.get(key, function (err, doc) {
                             var exists = !!doc;
                             if (!doc) doc = {};
                             _.extend(doc, {
                             type: 'point',
                             detail: detail,
                             order: vertex.index,
                             coords: _.pick(vertex, 'x', 'y', 'z'),
                             uv: _.pick(vertex.uv, 'x', 'y')
                             });

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
                             })*/
                        });

                        while (out.length) {
                            (function () {
                                var tick_latch = gate.latch();
                                var all_vertices_sent = gate.latch();
                                var slice = out.splice(0, DOC_CHUNKS);
                                var indexed = slice.reduce(function (out, doc) {
                                    out[doc.key] = doc;
                                    return out;
                                }, {});

                                var updates = 0;
                                var length = slice.length;
                                var last = !out.length;

                                process.nextTick(function () {
                                    collection.get(_.pluck(slice, 'key'), function (err, docs, meta) {
                                        ++updates;

                                        var new_data = indexed[meta.id];
                                        if (docs) {
                                            _.defaults(new_data, docs);
                                            collection.replace(meta.id, new_data, gate.latch());
                                        } else {
                                            collection.add(meta.id, new_data, gate.latch());
                                        }

                                        if (updates >= length) {
                                            if (last) console.log('all updates for detail %s done', detail);
                                            all_vertices_sent();
                                        }
                                    });
                                    tick_latch();
                                })
                            })();
                        }
                    }
                )
                ;

                gate.await(callback);
            }
            ,
            function (callback) {
                collection.view('points', 'points', {group: true}, function (err, doc) {

                    console.log('counts: %s', JSON.stringify(doc, true, 4));
                    callback();
                });
            }
            ,

            function (callback) {
                collection.shutdown();
                callback();
            }
        ]
        ;

    async.series(scripts, cb);

}

/* -------------- EXPORT --------------- */

module.exports = write_iso_data;