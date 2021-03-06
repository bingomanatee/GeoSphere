var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Planet = require('./../Planet');
var Gate = require('gate');
var Albedo = require('./Albedo');
var Cloud_Cover = require('./Cloud_Cover');

function Budget(depth) {
    if (_.isObject(depth)) {
        this.planet = depth;
    } else {
        this.planet = new Planet(depth);
    }
}

var SOLAR_IRRADIANCE = 1368;

_.extend(Budget.prototype, {

    init: function (callback) {
        var gate = Gate.create();
        this.load_albedo(gate.latch());
        this.load_cloud_cover(gate.latch());
        this.petawatt_scale = this.planet.surface_area()/(Math.pow(10, 15));
        gate.await(callback);
    },

    load_albedo: function (callback) {
        if (this._albedo_loaded) {
            callback();
        } else {
            var self = this;
            var albedo = new Albedo(this.planet);
            albedo.load(function () {
                self._albedo_loaded = true;
                callback();
            });
        }
    },

    load_cloud_cover: function (callback) {
        var cover = new Cloud_Cover(this.planet);
        cover.init(callback);
    },

    /**
     * the energy(in petawatts)
     * @param day
     */
    solar_radiation: function (day) {

        this.planet.vertices(function (vertex) {
            var radiation, sunlight = vertex.data('sunlight');
            if (sunlight) {
                var solar_energy = this.petawatt_scale * (1 - vertex.data('cloud_reflection'));
                var albedo = vertex.data('albedo');
                radiation = -(1 - albedo/100) * SOLAR_IRRADIANCE * solar_energy;
            } else {
                radiation = 0;
            }

            var month = Math.round(day * 12/365);

            var cloud_reflectivity = vertex.data('cloud_reflectivity')[month];
            radiation *= [1 - cloud_reflectivity];

            var cloud_cover = vertex.data('cloud_cover')[month] * 0.8 + 0.1;

            var earth_radiation = 98.5 * (1 - cloud_cover);

            vertex.data('radiation', radiation + earth_radiation);
        })
    }

});

module.exports = Budget;