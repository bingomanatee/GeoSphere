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

	return GALAXY.util.near_to_sector(nears, spread);
};

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

GALAXY.util.closest_uv = function (point, list) {
	var closest, distance, closest_distance;
	var val = list.length;
	for (var vi = 0; vi < val; ++vi) {
		var vertex = list[vi];
		if (!closest) {
			closest = vertex;
			closest_distance = closest.uv.distanceToSquared(point);
		} else {
			distance = vertex.uv.distanceToSquared(point);
			if (distance < closest_distance) {
				closest_distance = distance;
				closest = vertex;
			}
		}
	}

	return closest;
};

GALAXY.util.closest_sector = function(point, list){

	var closest, distance, closest_distance;
	var val = list.length;
	for (var vi = 0; vi < val; ++vi) {
		var sector = list[vi];
		if (!closest) {
			closest = sector;
			closest_distance = closest.center.distanceToSquared(point);
		} else {
			distance = sector.center.distanceToSquared(point);
			if (distance < closest_distance) {
				closest_distance = distance;
				closest = sector;
			}
		}
	}

	return closest;
}