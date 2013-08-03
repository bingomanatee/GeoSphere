var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = 24 * 3 * 12;

var Solar_Heat = require('./Flux_Model');
var solar_energy = require('./solar_energy');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */


/* ********* EXPORTS ******** */
/**
 *
 * @param planet {Planet}
 * @param sun_normal {THREE.Vector3}
 * @param planet_center {Three.Vector3}
 * @param matrix {Three.Matrix4}
 * @param day {int} 0..n days  since start of simulation
 * @param hour {number} 0..24 (can be float} hour of day
 */
module.exports = function (planet, sun_normal, planet_center, matrix, day, hour) {
    var heats = [];
    planet.vertices().forEach(function(vertex, i){
        var heat = planet.vertex_data(vertex.index, 'heat_model');
        if(!heat){
            heat = new Solar_Heat({terrain: 'grassland', vertex: vertex});
            planet.vertex_data(vertex.index, 'heat_model', heat);
        }
        heats[vertex.index] = heat;
    });

	planet.vertices().forEach(function (vertex) {
		if (_debug(vertex.index)) console.log(' ======= index %s =======', vertex.index)
		var solar_energy = solar_energy(planet, vertex, sun_normal, planet_center, matrix);
        var heat = heats[vertex.index];
        var flux = heat.flux(solar_energy, hour, day);
        vertex.data('solar_input', flux.total_flux());
	});

} // end export function