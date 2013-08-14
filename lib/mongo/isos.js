var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var Gate = require('gate');
var THREE = require('three');

var GeoSphere = require('./../../index.js');

var Point = GeoSphere.model.Point;
var _DEBUG = false;

var DOC_CHUNKS = 5000;

/* ------------ CLOSURE --------------- */

function save_points(slice, cb) {

    var gate = Gate.create();

    function _save_individual_points() {
        slice.forEach(function (data) {
            var id = data._id;
            delete data._id;
            GeoSphere.model.Point.update({_id: id}, data, {upsert: true}, gate.latch());
        })
    }

    var latch = gate.latch();

    latchOnce = (function () {

        var latched = false;
        return  function (err, result) {
            if (latched) return;
            if (_DEBUG)    console.log('result of insert: %s, %s', err, util.inspect(result));
            if (err) {
                _save_individual_points();
            }
            ;
            latched = true;
            latch();
        }
    })();

    try {
        GeoSphere.model.Point.create(slice, latchOnce());
    } catch (err) {
        _save_individual_points();
    }
    gate.await(cb);
}

function get_neighbors(iso, order) {
    var neighbors = [];

    iso.faces.filter(function (face) {
        return ( face.a == order) || (face.b == order) || (face.c == order);
    }).forEach(function (face) {
            neighbors.push(face.a, face.b, face.c);
        });

    return _.sortBy(_.reject(_.uniq(neighbors), function (n) {
        return n == order;
    }), _.identity);
}

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
                    console.log('created iso with %s points', iso.vertices.length);

                    var completed = 0;
                    var percent = 0;

                    var worker = async.cargo(function (chunk, callback) {
                        console.log('received an array of %s points: ', chunk.length);

                        save_points(chunk, function () {
                            completed += chunk.length;
                            var current_percent = Math.floor(completed * 100 / iso.vertices.length);
                            if (current_percent > percent) {
                                percent = current_percent;
                                console.log('%s % points saved', percent);
                            }

                            callback();
                        });
                    }, DOC_CHUNKS);

                    var stack = [];
                    iso.vertices.forEach(function (vertex, order) {
                        vertex.order = order;
                        var vertex_data = {
                            _id: 'p' + vertex.index + 'd' + detail,
                            type: 'point',
                            detail: detail,
                            index: vertex.index,
                            order: vertex.order,
                            coords: _.pick(vertex, 'x', 'y', 'z'),
                            uv: _.pick(vertex.uv, 'x', 'y'),
                            neighbors: get_neighbors(iso, vertex.order)
                        };
                        stack.push(vertex_data);

                        if (stack.length > DOC_CHUNKS) {
                            worker.push(stack.slice());
                            stack = [];
                        }
                    });

                    if (stack.length){
                        worker.push(stack);
                    }

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