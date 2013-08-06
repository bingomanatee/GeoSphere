var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Planet = require('./../Planet');
var assert = require('assert');
var humanize = require('humanize');
var Gate = require('gate');


var reader = require('./Elevation');
var readline = require('./../util/line_reader');
var lat_lon_to_vertex = require('./../util/lat_lon_to_Vector3');

var _DEBUG = false;

var Base = require('./../util/_Base.js');

function Albedo(depth) {

    Base.call(this, depth);

    this.title_rows = 2;
    this.delimiter = /\t/g;
}

util.inherits(Albedo, Base);

_.extend(Albedo.prototype, {

    load_table: function (callback) {
        this.planet.vertex_data_all('albedo', -1);
        var GeoSphere = require('./../../index');
        var albedo_file = path.resolve(GeoSphere.CLIMATE_ROOT, 'albedo_gridtable.tsv');
        var self = this;

        this.load_table_data(function () {
            console.log('reducing table data...');
            self.reduce_albedo_data();
            callback();
        }, albedo_file);
    },

    reduce_albedo_data: require('./Albedo/reduce_albedo_data'),

    line: function (data) {
        var lon = parseFloat(data.degree_east);
        //   if (lon > 180) lon -= 360;

        var lat = parseFloat(data.degree_north);
        var albedo = parseFloat(data.percent);
        if (_DEBUG)  console.log('lat: %s, lon: %s, albedo: %s', lat, lon, albedo);
        if (_.isNumber(albedo) && ( albedo >= 0)) {
            this.planet.vertex_ll_data_push(lat, lon, 'albedo', albedo, true);
        }

    },

    vertex_to_buffer: function (vertex) {
        var buffer = new Buffer(4);
        var albedo = vertex.data('albedo');
        buffer.writeFloatBE(albedo, 0);
        return buffer;
    },

    draw: function (width, height, file, callback) {
        this.planet.vertex_data_ops('color', '^albedo', '=', 100, '/');

         this.planet.detail > 5 ? this.planet.draw_nearest(width, height, file, callback) :
            this.planet.draw(width, height, file, callback);
    },

    buffer_size: function () {
        return 4;
    },

    buffer_to_vertex: function (vertex, buffer) {
        vertex.data('albedo', buffer.readFloatBE(0));
    }

});

module.exports = Albedo;