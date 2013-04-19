/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = true;
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

GALAXY.util.closest_vertex = function (point, list) {
	var closest, distance, closest_distance;
	var val = list.length;
	for (var vi = 0; vi < val; ++vi) {
		var vertex = list[vi];
		if (!closest) {
			closest = vertex;
			closest_distance = closest.distanceToSquared(point);
		} else {
			distance = vertex.distanceToSquared(point);
			if (distance < closest_distance) {
				closest_distance = distance;
				closest = vertex;
			}
		}
	}

	return closest;
};

GALAXY._prototypes.Sector.closest_vertex = function (point, spread, min_depth) {
	if (!min_depth){
		min_depth = 0;
	}

	if (this.detail == min_depth) {
		return GALAXY.util.closest_vertex(point, this.vertices_at[min_depth])
	} else {
		var closest_sectors = GALAXY.util.near_sectors(this.children, point, spread, true);
		var vectors = _.map(closest_sectors, function(sector){
			return sector.closest_vertex(point, spread, min_depth);
		})

		return GALAXY.util.closest_vertex(point, vectors);
	}

};