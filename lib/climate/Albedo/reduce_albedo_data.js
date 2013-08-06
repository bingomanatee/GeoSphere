var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

function _fix_missing_data(problem_verts) {
    var self = this;

    console.log('START fixing %s problem verts:', problem_verts.length);

    problem_verts.forEach(function (vertex, i) {
        var albedo = vertex.data('albedo');
        if (albedo == -1) {
            var neighbors = vertex.planet.neighbors(vertex.index);
            var albedos = _.reject(neighbors.map(function (n) {
                return n.data('albedo')
            }), function(a) {return a == -1});

            if (albedos.length) {
                vertex.data('albedo_avg', albedos.reduce(function (o, a) {
                    return o + a
                }, 0) / albedos.length);
            }
        } else {
            problem_verts[i] = false;
        }
    });

    problem_verts = _.compact(problem_verts);

    console.log('fixing %s problem verts:', problem_verts.length);

    problem_verts.forEach(function (vertex, i) {
        if (vertex.data('albedo') == -1) {
            var aa = vertex.data('albedo_avg');
            if (aa) {
                vertex.data('albedo', aa);
                problem_verts[i] = false;
            }
        }
    });

    return _.compact(problem_verts);
}

/** ********************
 * Purpose: load table data into albedo
 */

function reduce_albedo_data() {

    this.planet.vertices(function (vertex) {
        var albedos = vertex.data('albedo');

        if (albedos && albedos.length) {
            if (_.isArray(albedos)) {
                var l = albedos.length;
                albedos = albedos.reduce(function (o, v) { return o + v }, 0) / l;
            }

            vertex.data('albedo', albedos)
        }

    });

    this.fix_missing_data(_fix_missing_data);
};

/* -------------- EXPORT --------------- */

module.exports = reduce_albedo_data;