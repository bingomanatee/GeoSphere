var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');
var Canvas = require('canvas');

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
    this.radius = radius || 1;
    this.iso = new THREE.IcosahedronGeometry(this.radius, this.resolution);
    /**
     * note - the de-dupliation method on polyhedra creates "Gaps" in the series.
     * Also, for convenience, each vertex is given a reference to the planet
     * and a sugar function for setting and getting its own data.
     */
    this.iso.vertices.forEach(function (v, i) {
        v.index = i;
        v.planet = this;
        v.data = _vertex_data;
    }, this);

    this.network();

}

Planet.prototype = {

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

    vertex_data_op: require('./Planet/vertex_data_op'),

    vertex_data_ops: function(){
        var args = _.toArray(arguments);

        this.vertices(true).map(function(index){
            var v_args = [index].concat(args);
            this.vertex_data_op.apply(this, v_args);
        }, this);
    },

    network: require('./Planet/network'),

    neighbor_data: require('./Planet/neighbor_data'),

    neighbors: require('./Planet/neighbors'),

    closest_point: require('./Planet/closest_point'),

    draw_triangles: require('./Planet/draw_triangles'),

    draw_map: require('./Planet/draw_map'),

    draw: require('./Planet/draw')
};

/* ********* EXPORTS ******** */

module.exports = Planet;