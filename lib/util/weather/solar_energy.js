var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');


function solar_energy(planet, vertex, sun_normal, planet_center, matrix) {
    var v_rel = vertex.clone().applyProjection(matrix);
    var v_sub = v_rel.clone().sub(planet_center);
    var v_normal = v_sub.normalize();

    var cos = v_normal.dot(sun_normal);
    var c = Math.max(0, cos);

    planet.vertex_data(vertex.index, 'sunlight', c);
    return c;
}

module.exports = solar_energy;