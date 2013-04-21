/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
	var humanize = require('humanize');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
	var _DEBUG = window._DEBUG || false;
}

if (!GALAXY.util) {
	GALAXY.util = {};
}
if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * Finds the vector whose UV is closest to the input uv point.
 * The vertex does not have to be on the planet, but cannot be (0,0,0);
 *
 * @param point
 */
GALAXY._prototypes.Planet.closest_uv = function (uv, finest_detail, spread) {
	if (!finest_detail){
		finest_detail = 0;
	}
	if (!spread){
		spread = 0.05;
	}

	var closest_top_sectors = this.closest_top_sectors_uv(uv, spread, finest_detail);
	//console.log('closest sectors: %s (%s items)', closest_top_sectors, closest_top_sectors.length);
	var closest_vertexes = _.map(closest_top_sectors, function(sector){
		return sector.closest_uv(uv, spread);
	});

	return GALAXY.util.closest_uv(uv, closest_vertexes);
};

GALAXY._prototypes.Planet.closest_vertex = function (point, finest_detail, spread) {
	if (!finest_detail){
		finest_detail = 0;
	}
	if (!spread){
		spread = 0.05;
	}

	var closest_top_sectors = this.closest_top_sectors(point, spread);
	var closest_vertexes = _.map(closest_top_sectors, function(sector){
		return sector.closest_vertex(point, spread, finest_detail);
	})

	return GALAXY.util.closest_vertex(point, closest_vertexes);
};

GALAXY._prototypes.Planet.closest_sector = function (point, finest_detail, spread) {
	if (!finest_detail){
		finest_detail = 0;
	}
	if (!spread){
		spread = 0.05;
	}

	var closest_top_sectors = this.closest_top_sectors(point, spread);
	var closest_sectors = _.map(closest_top_sectors, function(sector){
		return sector.closest_sector(point, spread, finest_detail);
	});

	return GALAXY.util.closest_sector(point, closest_sectors);
};

GALAXY.util.near_sectors = function (sectors, point, spread, skipRange) {

	if (spread <= 0) {
		spread = 0.1;
	}

	if (!skipRange) sectors = _.filter(sectors, function(sector){
		var center = sector.center;

		if(point.x > 0){
			if (center.x < -0.1) return false;
		} else {
			if (center.x > 0.1) return false;
		}
		if(point.y > 0){
			if (center.y < -0.1) return false;
		} else {
			if (center.y > 0.1) return false;
		}
		if(point.z > 0){
			if (center.z < -0.1) return false;
		} else {
			if (center.z > 0.1) return false;
		}
		return true;
	});

	var nears = _.map(sectors, function (sector) {
		return {
			sector:   sector,
			distance: sector.center.distanceToSquared(point)
		};
	});

	return GALAXY-util.near_to_sector(nears, spread);
};

GALAXY.util.near_to_sector = function(nears, spread){

	var max_distance, min_distance;

	nears.forEach(function (near, index) {
		if (index == 0) {
			max_distance = min_distance = near.distance;
		} else if (max_distance < near.distance) {
			max_distance = near.distance;
		} else if (min_distance > near.distance) {
			min_distance = near.distance;
		}
	});

	if (max_distance == min_distance) return nears;

	var spread_distance = Math.max(min_distance * (1 + spread),  min_distance + ((max_distance - min_distance) * spread));

	nears = _.filter(nears, function (near) {
		return  (near.distance <= spread_distance);
	});

	return _.pluck(nears, 'sector');
}

GALAXY.util.near_sectors_uv = function (sectors, point, spread) {

	if (spread <= 0) {
		spread = 0.1;
	}

	var nears = _.map(sectors, function (sector) {
		return {
			sector:   sector,
			distance: sector.center.uv.distanceToSquared(point)
		};
	});

	return GALAXY.util.near_to_sector(nears, spread);
};

/**
 * find the closest top level sectors within a given percent of distance
 * @param point {THREE.Vector3}
 * @param spread {Number} 0..1 find sectors whose closeness is within (1  + spread) * closest sector's closeness
 * @returns {*}
 */
GALAXY._prototypes.Planet.closest_top_sectors = function (point, spread) {
	if (point.x == 0 && point.y == 0 && point.z == 0) {
		throw new Error('point is origin - cannot find closest');
	}

	var tops = this.top_sectors();
	return GALAXY.util.near_sectors(tops, point, spread);
};

GALAXY._prototypes.Planet.closest_top_sectors_uv = function (point, spread) {
	var tops = this.top_sectors();
	return GALAXY.util.near_sectors_uv(tops, point, spread);
};

GALAXY._prototypes.Planet.top_sector = function () {
	return this.sectors_by_detail.length - 1;
};

GALAXY._prototypes.Planet.top_sectors = function () {
	return _.last(this.sectors_by_detail);
};
