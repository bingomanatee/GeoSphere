var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = 24 * 3 * 12;

/* ************************************
 * 
 * ************************************ */

var DEFAULT_EARTH_ABSORPTION = 60 / 100;
var DEFAULT_TEMP_BLEED = 2 / 100;
var EARTH_RADIANCE = 30 / 100;
var TEMP_DIFFUSION = 5 / 100;

/* ******* CLOSURE ********* */

function _f(n, p) {
	if (!p) p = 8;
	var out = '' + Math.round(n * Math.pow(10, p - 2)) / Math.pow(10, p - 2);
	while (out.length < p) {
		out = ' ' + out;
	}
	return  out;
}

function _debug(index, also) {
	if (arguments.length < 2) also = true;
	return also && _DEBUG && index < 12;
}

function _diffuse_temp(planet) {
	planet.vertices(true).forEach(function (index) {

		var temp = planet.vertex_data(index, 'temp');
		var temp_diffusion = temp * TEMP_DIFFUSION;
		planet.vertex_data_op(index, 'temp', temp_diffusion, '-');

		var neighbors = planet.neighbors(index, true);

		temp_diffusion /= neighbors.length;

		neighbors.forEach(function (neighbor) {
			planet.vertex_data_op(neighbor, 'diffusion', temp_diffusion, '+');
		});
	});
}

function _set_sunlight(planet, v, sun_normal, planet_center, matrix) {
	var v_rel = v.clone().applyProjection(matrix);
	var v_sub = v_rel.clone().sub(planet_center);
	var v_normal = v_sub.normalize();

	var cos = v_normal.dot(sun_normal);
	var c = Math.max(0, cos);

	planet.vertex_data(v.index, 'sunlight', c);
	return c;
}

/* ********* EXPORTS ******** */
var k_d = false;
module.exports = function (planet, sun_normal, planet_center, matrix, d, h) {
	var earth_absorption = planet.hasOwnProperty('earth_absorption') ? planet.earth_absorption : DEFAULT_EARTH_ABSORPTION;
	var temp_bleed = planet.hasOwnProperty('temp_bleed') ? planet.temp_bleed : DEFAULT_TEMP_BLEED;
	var earth_radiance = planet.hasOwnProperty('earth_radiance') ? planet.earth_radiance : EARTH_RADIANCE;

	if (_debug(0, !k_d)) {
		k_d = true;
		console.log('earth absorption: %s, temp_bleed: %s, earth_radiance: %s', earth_absorption, temp_bleed, earth_radiance);
	}
	if (_debug(0)) {
		console.log(' ======= day %s, hour %s =========', d, h);
	}

	planet.vertices().forEach(function (v) {
		if (_debug(v.index)) console.log(' ======= index %s =======', v.index)
		var sunlight = _set_sunlight(planet, v, sun_normal, planet_center, matrix);
		var sunlight_history = planet.vertex_data(v.index, 'history') || [];
		sunlight_history.push(sunlight);

		var recent = sunlight_history.slice(-48);
	//	console.log('recent history: %s', _.map(recent, _f).join(' '));
		planet.vertex_data(v.index, 'history', recent);
		var average = planet.vertex_data(v.index, 'average', _.reduce(recent, function(out, value){
			return out + value;
		}, 0) / recent.length);

		if (_debug(v.index)) console.log('sunlight %s', _f(sunlight));

		// divide solar energy to the energy that gets to the earth and that absorbed by atmosphere
		var sunlight_to_earth = sunlight * earth_absorption;
		var sunlight_to_temp = sunlight - sunlight_to_earth;

		// transfer solar energy to earth
		var earth_temp = (planet.vertex_data(v.index, 'earth_temp') || 0) + sunlight_to_earth;
		var earth_to_temp = 0;
		// transfer solar energy to earth and bleed some energy back to space
		var temp = (planet.vertex_data(v.index, 'temp') || 0) * temp_bleed + sunlight_to_temp;

		// transfer some energy from earth to air if air cooler than earth
		if (temp < earth_temp) {
			earth_to_temp = (earth_temp - temp) * earth_radiance;
			temp += earth_to_temp;
			earth_temp -= earth_to_temp;
		}

		planet.vertex_data(v.index, 'earth_temp', earth_temp);
		planet.vertex_data(v.index, 'temp', temp);

		if (_debug(v.index)) {
			console.log('sun 2 earth: %s', _f(sunlight_to_earth));
			console.log('sun_to_temp: %s, ', _f(sunlight_to_temp));
			console.log('earth to temp: %s', _f(earth_to_temp));
			console.log('temp: %s', _f(temp));
			console.log('earth temp: %s', _f(earth_temp));
		}

		planet.vertex_data(v.index, 'temp average', temp / 4 + average);
	});

	var temps = _.map(_.range(0, 12), function (index) {
		return _f(planet.vertex_data(index, 'temp'));
	});

	if (_DEBUG) console.log('temps %s, ', temps.join(', '));

	//_diffuse_temp(planet);

	planet.vertices(true).forEach(function (index) {
		var temp = planet.vertex_data(index, 'temp') || 0;
		var max = planet.vertex_data(index, 'high');
		var min = planet.vertex_data(index, 'low');

		if (isNaN(max) || ( max < temp)) {
			planet.vertex_data(index, 'high', temp);
		}
		if (isNaN(min) || (min > temp)){
			planet.vertex_data(index, 'low', temp);
		}
	});

	if (_DEBUG > 0) --_DEBUG;
} // end export function