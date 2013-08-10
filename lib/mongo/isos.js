var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Gate = require('gate');
var THREE = require('three');

var async = require('async');
var GeoSphere = require('./../../index.js');

var Point = GeoSphere.model.Point();

var DOC_CHUNKS = 50;

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To save point data as a binary data for faster loading
 */

function write_iso_data(cb, min_depth, max_depth) {
    if (!_.isFunction(cb)) throw new Error('first argument to write_iso_data must be function');

    var scripts = [
        function (callback) {

            var gate = Gate.create();
            _.range(min_depth, max_depth)
                .forEach(function (detail) {
                    var iso = new THREE.IcosahedronGeometry(1, detail);

                    out = [];
                    iso.vertices.forEach(function (vertex, order) {

                        var vertex_data = {
                            _id: 'p' + vertex.index + 'd' + detail,
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

                        out.push(vertex_data);
                    });

                    while (out.length) {
                        var slice = out.splice(0, DOC_CHUNKS);

                        latchOnce = (function () {
                            var latch = gate.latch();

                            var latched = false;
                            return  function () {
                                if (latched) return;
                                latched = true;
                                console.log("latched");
                                latch();
                            }
                        })();
                        try {
                            GeoSphere.model.Point.create(slice, latchOnce);
                        } catch (err) {
                            console.log('upserting individual records after %s', err);
                            slice.forEach(function (data) {
                                var id = data._id;
                                delete data._id;
                                GeoSphere.model.Point.update({_id: id}.data, {upsert: true}, gate.latch());
                            })
                            latchOnce();
                        }
                    }
                }
            );

            gate.await(callback);
        },

        function (callback) {
            GeoSphere.model.Point.count(function (err, n) {

                console.log('---------- linking %s to parents -------------', util.inspect(n));
                if (n > 0) {
                    var CHUNKS = 100;
                    var gate = Gate.create();
                    _.range(0, n, CHUNKS).forEach(function (start) {
                        var find_bulk = gate.latch();
                        GeoSphere.model.Point.find().select('coords detail').sort('_id').limit(CHUNKS).skip(start).exec(function (err, results) {
                            results.forEach(function (item) {
                                var find_match = gate.latch();
                                var crit = {'coords.x': item.coords.x, 'coords.y': item.coords.y, 'coords.z': item.coords.z, detail: item.detail + 1};
                                //  console.log('crit: %s', util.inspect(crit));
                                GeoSphere.model.Point.findOne(crit, function (err, match) {
                                    if (match) {

                                        if (!((match.parent == item._id) && (item.child == match._id))) {
                                            console.log('need parenting');
                                        }
                                        console.log('search: %s, new match: %s', util.inspect(item), util.inspect(match));
                                        var p_latch = gate.latch();
                                        GeoSphere.model.Point.findByIdAndUpdate(match._id, {parent: item._id}, function(err, result){

                                            console.log('________ UPDATED %s _______', result);
                                            p_latch();
                                        });
                                        GeoSphere.model.Point.findByIdAndUpdate(item._id, {child: match._id}, gate.latch());
                                    } else {
                                        find_match();
                                    }
                                });
                                find_bulk();
                            })
                        });
                    });
                    gate.await(callback);
                } else {
                    console.log('no points');
                    callback();
                }
            });
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