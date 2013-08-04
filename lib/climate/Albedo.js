var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Planet = require('./../Planet');
var assert = require('assert');
var humanize = require('humanize');
var Gate = require('gate');

var reader = require('./GLOBE_data_reader');
var ALBEDO_FILE = path.resolve(__dirname, './../../GLOBE_data/albedo_gridtable.tsv');
assert(fs.existsSync(ALBEDO_FILE), 'cannot find albedo file');
var readline = require('./../util/line_reader');
var lat_lon_to_vertex = require('./../util/lat_lon_to_Vector3');

var _DEBUG = false;

function Albedo(depth) {
    if (_.isObject(depth)){
        this.planet = depth;
    } else {
        this.planet = new Planet(depth);
    }
    this.lines = 0;
}

_.extend(Albedo.prototype, {

    load: function (callback) {
        var self = this;
        var handle = readline(ALBEDO_FILE);

        handle.on('line', _.bind(self.read_line, self));

        handle.on('end', function () {
            self.calculate_albedo();
            callback();
        });
    },

    calculate_albedo: function () {

        this.planet.vertices(function (vertex) {
            var albedos = vertex.data('albedo');

            if (albedos) {
                if (_.isArray(albedos)) {
                    var l = albedos.length;

                    albedos = albedos.reduce(function (o, v) {
                        return o + v
                    }, 0) / l;
                }

            } else {
              //  console.log('no albedos array for vertex %s', vertex.index);
                albedos = 0; //@TODO: more realistic default
            }
            //   console.log('vertex %s albedo: %s', vertex.index, (albedos));
            vertex.data('albedo', albedos)
        });

        var self = this;
        var has_zeros = false;
        var problem_verts = this.planet.vertices();
        do {
            has_zeros = false;
            problem_verts.forEach(function (vertex, i) {
                var albedo = vertex.data('albedo');
                if (!albedo) {
                    has_zeros = true;
                    var neighbors = self.planet.neighbors(vertex.index);
                    var albedos = _.compact(neighbors.map(function (n) {
                        return n.data('albedo');
                    }));


                    if (albedos.length) {
                        vertex.data('albedo_avg', albedos.reduce(function (o, a) {
                            return o + a
                        }, 0) / albedos.length);
                    }
                } else {
                    problem_verts[i] = false;
                }
            })

            problem_verts = _.compact(problem_verts);

            if (has_zeros) problem_verts.forEach(function (vertex, i) {
                if (!vertex.data('albedo')) {
                    var aa = vertex.data('albedo_avg');
                    if (aa) {
                        vertex.data('albedo', aa);
                        problem_verts[i] = false;
                    }
                }
            })
            problem_verts = _.compact(problem_verts);
        } while (has_zeros);
    },

    read_line: function (line) {
        ++this.lines;
        if (this.lines < 3) return;

        var data = line.split(/\t/);
        var lat = parseFloat(data[1]);
        var lon = parseFloat(data[0]);

        var months = Math.floor(parseFloat(data[2]));
        var albedo = parseFloat(data[3]);
        if (!(_.isNumber(months) && _.isNumber(albedo)) || albedo < 0) return;

        var point3 = lat_lon_to_vertex(lat, lon, true);

        var closest_vertex = this.planet.closest_point(point3);

        if (_DEBUG) console.log('pushing %s into %s', util.inspect(item), closest_vertex.index);

        this.planet.vertex_data_push(closest_vertex.index, 'albedo', albedo);

      if (_DEBUG)  if (!(this.lines % 1000)) {
            var closest_lon = 360 * (closest_vertex.uv.x - 0.5);
            var closest_lat = -180 * (closest_vertex.uv.y - 0.5);

            console.log('        lon: %s,          lat: %s, m: %s,  albedo: %s',
                Math.floor(lon), Math.floor(lat), Math.floor(months), humanize.numberFormat(albedo, 3));

            console.log('closest lon: %s, closest_lat: %s ',
                humanize.numberFormat(closest_lon, 3),
                humanize.numberFormat(closest_lat, 3)
            )
            console.log('     D lon: %s, D lat %s ',
                humanize.numberFormat(closest_lon - lon, 3),
                humanize.numberFormat(closest_lat - lat, 3)

            );
        }


    }

});

module.exports = Albedo;