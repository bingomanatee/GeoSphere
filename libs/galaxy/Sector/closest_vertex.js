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
 * return the sector whose center is closest to the passed-in point
 * @param point {Vector3}
 */
GALAXY._prototypes.Sector.closest_child_sector = function (point) {

	var last_square_distance;
	var closest;
	this.children.forEach(function(child){
		if (!closest){
			closest = child;
		} else {
			var distance = child.center.distanceToSquared(point);
			if (distance < last_square_distance){
				last_square_distance = distance;
				closest = child;
			}
		}
	});
	return closest;
};
/**
 * return the sector whose center is closest to the passed-in point
 * @param point {Vector3}
 */
GALAXY._prototypes.Sector.closest_sector_vertex = function (point) {

	return _.reduce(this.get_vertices(), function (last, vertex) {
		if (!last){
			return vertex;
		} else if (last.distanceToSquared(point) < vertex.distanceToSquared(point)){
			return last;
		} else {
			return vertex;
		}

	}, null, this);
};

/**
 * returns the closest vertex to the passed in point
 * @param point
 * @returns {Vector3}
 */

GALAXY._prototypes.Sector.closest_vertex = function (point) {
	if (this.children && this.children.length) {
		return this.closest_child_sector(point).closest_vertex(point);
	} else if (this.vertices && this.vertices.length) {
		return this.closest_sector_vertex(point);
	} else {
		throw new Error('WTF?');
	}
};