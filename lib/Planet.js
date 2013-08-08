var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');
var Canvas = require('canvas');
var Iso_Remap = require('./util/Iso_Remap.js');
var Sector = require('./Sector.js');

var _v2 = _.template('(<%= Math.round(x * 100) %>, <%= Math.round(y * 100) %>)');

THREE.Vector2.prototype.toString = function () {
    return _v2(this);
}

/* ************************************
 * represents a planet as modelled by a tessellated sphere.
 * ************************************ */

/* ******* CLOSURE ********* */

function _vertex_data(prop, value) {
    if (arguments.length < 2) {
        return this.planet.vertex_data(this.index, prop);
    } else {
        return this.planet.vertex_data(this.index, prop, value);
    }
}

function Planet(resolution, radius) {
    this.resolution = resolution || 0;
    this.depth = this.resolution;
    this.radius = radius || Planet.EARTH_RADIUS;
    /**
     * note - radius is used for various surface calculations.
     * At this point, the iso is rendered as a "Platonic" sphere with radius 1
     * for increased speed of normal calculus.
     *
     * @type {THREE.IcosahedronGeometry}
     */
    this.iso = new THREE.IcosahedronGeometry(1, this.resolution);
    /**
     * note - the de-dupliation method on polyhedra creates "Gaps" in the series.
     * Also, for convenience, each vertex is given a reference to the planet
     * and a sugar function for setting and getting its own data.
     */

    var ir = new Iso_Remap(this.depth);
    ir.reorder_iso(this.iso);

    this.extend_vertices();

    this.network();

}

Planet.prototype = {

    extend_vertices: function () {
        this.iso.vertices.forEach(function (v, i) {
            v.index = i;
            v.planet = this;
            v.data = _vertex_data;
        }, this);
    },

    /**
     * The area based on the radius of the planet.
     * note that the actual iso is NOT set to this radius - it has radius 1.
     * The unit of measurement is not stored in the planet record.
     *
     * Npte also it assumes perfectly spherical planets,
     * which are not true in reality -
     * centrifugal force squashes planets by a bit.
     *
     * @param per_point if true, returns the area for each vertex.
     * if not true, returns the rea of the entire planet.
     * @returns {number}
     */
    surface_area: function (per_point) {
        var sa = 4 * Math.PI * Math.pow(this.radius, 2);
        if (per_point) sa /= this.iso.vertices.length;
        return sa;
    },

    vertices: require('./Planet/vertices'),

    vertex: function (n) {
        return this.iso.vertices[n];
    },

    export_vertex_data: require('./Planet/export_vertex_data'),

    vertex_data: require('./Planet/vertex_data'),

    vertex_data_all: function (key, value) {
        this.vertices(function (vertex) {
            vertex.data(key, value);
        });
    },

    vertex_data_push: require('./Planet/vertex_data_push'),

    vertex_ll_data_push: require('./Planet/vertex_ll_data_push'),

    vertex_data_op: require('./Planet/vertex_data_op'),

    vertex_data_ops: function () {
        var args = _.toArray(arguments);

        this.vertices(true).map(function (index) {
            var v_args = [index].concat(args);
            this.vertex_data_op.apply(this, v_args);
        }, this);
    },

    network: require('./Planet/network'),

    neighbor_data: require('./Planet/neighbor_data'),

    neighbors: require('./Planet/neighbors'),

    closest_point: require('./Planet/closest_point'),

    draw_triangles: require('./Planet/draw_triangles'),

    draw_nearest: require('./Planet/draw_nearest.js'),
    draw_map: require('./Planet/draw_map'),

    draw: require('./Planet/draw'),

    graph: require('./Planet/graph')
};

Planet.EARTH_RADIUS = 6371000; // m;

/* ********* EXPORTS ******** */

module.exports = Planet;