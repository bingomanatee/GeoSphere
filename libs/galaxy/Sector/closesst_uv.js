/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Sector) {
	GALAXY._prototypes.Sector = {};
}

/**
 *
 * return the sector whose center is closest to the passed-in point
 * @param uv {THREE.Vector2}
 * @returns {GALAXY.Sector}
 */
GALAXY._prototypes.Sector.closest_child_sector_uv = function (uv) {

	var last_distance_squared;
	return _.reduce(this.children, function (last, sector) {
		var sector_distance_squared = sector.center.uv.distanceToSquared(uv);
		if (!last) {
			last_distance_squared = sector_distance_squared;
			return sector;
		} else if (last_distance_squared <= 0) {
			return last;
		} else if (sector_distance_squared < last_distance_squared) {
			last_distance_squared = sector_distance_squared;
			return sector;
		} else {
			return last;
		}

	}, null);
};

/**
 * return the vertex whose uv is closest to the passed-in uv uv
 * @param uv {THREE.Vector2}
 * @returns {THREE.Vector3}
 */
GALAXY._prototypes.Sector.closest_sector_vertex_uv = function (uv) {
	var last_distance_squared;
	return _.reduce(this.get_vertices(), function (last, vertex) {
		var sector_distance_squared = vertex.uv.distanceToSquared(uv);
		if (!last) {
			last_distance_squared = sector_distance_squared;
			return vertex;
		} else if (last_distance_squared <= 0) {
			return last;
		} else if (sector_distance_squared < last_distance_squared) {
			last_distance_squared = sector_distance_squared;
			return vertex
		} else {
			return last;
		}
	}, null, this);
};

/**
 * returns the closest vertex to the passed in UV coordinate.
 * A point of subtlety. Every Vertex has a UV subobject.
 * The passed in Vector2/UV point is compared to each vertex's UV coordiante in 2d space
 * and the 3D Vector CONTAINING the closest UV point is returned.
 *
 * @param uv {Vector2}
 * @returns {Vector3}
 */

GALAXY._prototypes.Sector.closest_uv = function (uv) {
	if (this.children && this.children.length) {
		return this.closest_child_sector_uv(uv).closest_uv(uv);
	} else if (this.vertices && this.vertices.length) {
		return this.closest_sector_vertex_uv(uv);
	} else {
		throw new Error('WTF?');
	}
};