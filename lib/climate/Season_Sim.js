var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var THREE = require('three');
var Planet = require('./../Planet');

// These are "null objects" that we use to stock the meshes we use to offset various things from each other.
// we never directly render these objects, so we don't need to care about their appearance.
var MATERIAL = new THREE.MeshBasicMaterial({ color: 0xffffff });
var CUBE = new THREE.CubeGeometry();

var EARTH_TILT = 23;
var DEG_TO_RAD = Math.PI / 180;
var EARTH_ORBIT_RADIUS = 150000000; // ~ 149,598,000 km major axis of earth orbit around center of ellipse
var Surface_Radiation_Budget = require('./Surface_Radiation_Budget');

/**
 * This simulation spins the earth around the sun;
 * it has a fixed orbital radius.
 * @param depth {int} the resolution of the planet.
 *
 * @constructor
 */


function Season_Sim(depth) {

    this.planet = new Planet(depth);
    this.planet_sphere = new THREE.Mesh(this.planet.iso, MATERIAL);

    // displaces the earth relative to the sun
    this.planet_anchor = new THREE.Mesh(CUBE, MATERIAL);
    this.planet_anchor.position.x = EARTH_ORBIT_RADIUS; // an arbitrary distance between sun and earth.

    // tilts the earth relative to the anchor
    var planet_tilt = new THREE.Mesh(CUBE, MATERIAL);
    planet_tilt.rotation.z = EARTH_TILT * DEG_TO_RAD;
    this.planet_anchor.add(planet_tilt);

    planet_tilt.add(this.planet_sphere);

    // the anchor point of the planet anchor, in the sun. -- might be redundant.
    this.sun_center = new THREE.Mesh(CUBE, MATERIAL);
    this.sun_center.add(this.planet_anchor);

    // representing the sun
    this.sun = new THREE.Mesh(CUBE, MATERIAL);
    this.sun.add(this.sun_center);

    // a reference point to determine the
    this.sunlight_vector = new THREE.Mesh(CUBE, MATERIAL); // the origin of the system
}

_.extend(Season_Sim.prototype, {

    init: function(callback){
      this.seb().init(callback);
    },

    rotate_planet: function (hours) {
        var solar_orbit_angle = hours * Math.PI * 2 / ( 365 * 24);
        this.planet_sphere.rotation.y = (hours % 24) * Math.PI / 12;
        this.sun_center.rotation.y = solar_orbit_angle;
        this.planet_anchor.rotation.y = -solar_orbit_angle;
    },

    /**
     * move the stellar objects based of the time of year
     * @param day {number} a number of days since start of simulation; can be a float.
     * @param hour {number} the time of day(0..24); can be float.
     */
    set_time: function (day, hour) {
        if (!hour) hour = 0;
        var hours = hour + (day * 24);
        this.hours = hours;

        this.rotate_planet(hours);
        this.sun.updateMatrixWorld();
        this.matrix = this.planet_sphere.matrixWorld;
        this.planet_center = new THREE.Vector3().applyProjection(this.planet_sphere.matrixWorld);
        var self = this;
        this.planet.vertices(function(vertex){
            self.solar_energy(vertex);
            self.seb().solar_radiation(day);
        })
    },

    seb: function(){
        if (!this._seb){
            this._seb = new Surface_Radiation_Budget(this.planet);
        }
        return this._seb;
    },

    /**
     * solar energy is added to each vertex.
     * @param vertex
     * @returns {number}
     */
    solar_energy: function (vertex) {
        var v_rel = vertex.clone().applyProjection(this.matrix);
        var sun_normal = this.sunlight_vector.position.clone().sub(this.planet_center).normalize();
        var v_sub = v_rel.clone().sub(this.planet_center);
        var v_normal = v_sub.normalize();

        var cos = v_normal.dot(sun_normal);
        var c = Math.max(0, cos);


    //    console.log('setting sunlight of vertex %s to %s', vertex.index, c);
        vertex.data('sunlight', c);
        return c;
    }

});

module.exports = Season_Sim;