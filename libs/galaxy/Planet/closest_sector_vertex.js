/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
	var _DEBUG = window._DEBUG || false;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * Finds the vector closest to a given vertex.
 * The vertex does not have to be on the planet, but cannot be (0,0,0);
 *
 * @param point
 */
GALAXY._prototypes.Planet.closest_vertex = function (point) {
	var sectors = this.closest_sectors(point, 0.15);
	if (!sectors.length) {
		throw new Error(util.format('cannot find closest sectors to point %s', point));
	}
/*
	var indexes = _.reduce(sectors, function (out, sector) {
		return out.concat(sector.vertex_indexes());
	}, []);

	if (_DEBUG)    console.log('indexes: %s', util.inspect(indexes));

	var closest_vertex = this.iso.vertices[indexes.pop()];
	var last_distance = closest_vertex.distanceToSquared(point); // what?

	for (var i = 0; i < indexes.length; ++i) {
		var vertex = this.iso.vertices[indexes[i]];
		var distance = vertex.distanceToSquared(point);
		if (distance < last_distance) {
			last_distance = distance;
			closest_vertex = vertex;
		}
	}
	 */

	var planet = this;

	var _DEBUG_CV = false;

	function closer_vertex(closest, vector_index){
		var vertex = planet.iso.vertices[vector_index];
		var distance = vertex.distanceToSquared(point);
		var out = closest;
		if ((!closest) || (closest[1] > distance)) {
			out = [vertex, distance];
		}

		if (_DEBUG_CV > 2) console.log('closer_vertex: returning %s', util.inspect(out));

		return out;
	}

	function closest_vertex_in_sector(closest, sector){
		var out = _.reduce(sector.vertex_indexes(), closer_vertex, closest);

		if (_DEBUG_CV > 1) console.log('closest_vertex_in_sector %s',util.inspect(out));

		if (!out) throw new Error(util.format('no closest vertex for sector %s', sector.name));
		return out;
	}

	var out = _.reduce(sectors, closest_vertex_in_sector, null);

	if (_DEBUG_CV) console.log('closest_vertex: %s', util.inspect(out));

	return out[0];
};

/**
 * returns the top level sector by comparing center.
 * NOTE: there may be cases where the closest top level sector does NOT have the closest vertices
 * @param point {Vector3}
 */
GALAXY._prototypes.Planet.closest_sector = function closest_sector(point) {
	if (point.x == 0 && point.y == 0 && point.z == 0) {
		throw new Error('point is origin - cannot find closest');
	}

	return _.reduce(this.sector_tree, function (last, sector) {
		if (!last) {
			return sector;
		} else if (last.center.distanceToSquared(point) < sector.center.distanceToSquared(point)) {
			return last;
		} else {
			return sector;
		}

	}, null);
}

/**
 * find the closest top level sectors within a given percent of closensess
 * @param point {THREE.Vector3}
 * @param spread {Number} 0..1 find sectors whose closeness is within (1  + spread) * closest sector's closeness
 * @returns {*}
 */
GALAXY._prototypes.Planet.closest_sectors = function (point, spread) {
	if (point.x == 0 && point.y == 0 && point.z == 0) {
		throw new Error('point is origin - cannot find closest');
	}
	if (spread <= 0){
		spread = 0.1;
	}

	point = point.normalize();

	if (!this.sector_tree){
		throw new Error('planet has no sectors');
	}
	var nears = _.map(this.sector_tree, function (sector) {
		return {
			sector:   sector,
			distance: sector.center.distanceToSquared(point)
		};
	});

	if (_DEBUG){
		console.log('nears: %s', nears.length);
	}

	var min_distance = _.min(_.pluck(nears, 'distance'), _.identity);

	var max_distance = min_distance * (1 + spread);
	if (_DEBUG){
		console.log('min_distance: %s, max distance: %s', min_distance, max_distance);
	}
	if (max_distance > min_distance){
		nears = _.filter(nears, function (near) {
			return  (near.distance < max_distance);
		});
	}

	if (_DEBUG){
		console.log('nears 2: %s', nears.length);
	}

	return _.pluck(nears, 'sector');
};