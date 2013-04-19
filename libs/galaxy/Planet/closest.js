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
 * Finds the vector closest to a given vertex.
 * The vertex does not have to be on the planet, but cannot be (0,0,0);
 *
 * @param point
 */
GALAXY._prototypes.Planet.closest_vertex = function (point, finest_detail, spread) {
	if (!finest_detail){
		finest_detail = 0;
	}
	if (!spread){
		spread = 0.05;
	}

	var closest_sectors = this.closest_top_sectors(point, spread);
	if (_DEBUG) console.log('closest top sector count: %s', closest_sectors.length);

	var closest_vertexes = _.map(closest_sectors, function(sector){
		return sector.closest_vertex(point, spread);
	})
/*
	for (var si = 0; si < closest_sectors.length; ++si) {
		sector = closest_sectors[si];
		var val = sector.vertices_at[finest_detail].length;

		for (var vi = 0; vi < val; ++vi) {
			var vertex = sector.vertices_at[finest_detail][vi];
			if (!closest) {
				closest = vertex;
				closest_distance = closest.distanceToSquared(point);
			} else {
				distance = vertex.distanceToSquared(point);
				if (distance < closest_distance) {
					closest_distance = distance;
					closest = vertex;
				}
				checks[vertex.index] = true;
			}
		}
	} */

	if (_DEBUG) console.log('vertices: %s of %s', vertices.length, this.iso.vertices.length);

	return GALAXY.util.closest_vertex(point, closest_vertexes);

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

	// find the acceptable threshhold for near sectors based on spread.
	// if the spread is too all-inclusive take (about) the closest half sectors.

	var spread_distance = Math.max(min_distance * (1 + spread),  min_distance + ((max_distance - min_distance) * spread));

	nears = _.filter(nears, function (near) {
		return  (near.distance <= spread_distance);
	});

	return _.pluck(nears, 'sector');
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

GALAXY._prototypes.Planet.top_sector = function () {
	return this.sectors_by_detail.length - 1;
};

GALAXY._prototypes.Planet.top_sectors = function () {
	return _.last(this.sectors_by_detail);
};

GALAXY._prototypes.Planet.closest_sectors_at_detail = function (point, finest_detail, spread) {
	var time = new Date().getTime();

	if (_DEBUG) {
		console.log('closest_sectors_at_detail : %s, detail: %s, spread: %s',
			point, finest_detail, spread
		);
	}
	point = point.normalize();
	var top_sector = this.top_sector();
	if (!finest_detail) finest_detail = 0;

	var closest_sectors = this.closest_top_sectors(point, spread);
	if (_DEBUG) console.log('getting closest  %s sectors\' children_at to detail %s', closest_sectors.length, finest_detail);
	var subsectors = [];
	closest_sectors.forEach(function (sector) {
		if (_DEBUG)    console.log('getting children_at to detail %s of sector %s detail %s', finest_detail, sector.id, sector.detail);
		var out = sector.children_at[finest_detail];
		if (_DEBUG)    console.log('........... %s found', out.length);
		subsectors.push.apply(subsectors, out);
	});

	if (_DEBUG) console.log('================ sectors at %s: %s', finest_detail, subsectors.length);
	return subsectors;
	/*
	 return _.reduce(_.range(top_sector, Math.min(top_sector - 2, finest_detail), -1, -1), function (parents, detail) {
	 if (_DEBUG) 	console.log('PARENTS: %s', parents ? parents.length : 0);
	 var close_sectors;
	 if (!parents) {
	 close_sectors = this.top_sectors();
	 } else {
	 close_sectors = _.map(parents, function (sector) {
	 var children = sector.children();
	 return children;
	 });
	 close_sectors = _.flatten(close_sectors);
	 }

	 if (_DEBUG) console.log('detail: %s, close_centers: %s', detail, close_sectors.length);
	 return GALAXY.util.near_sectors(close_sectors, point, spread);
	 if (_DEBUG)    console.log(' ... reduced to %s',  out.length);


	 }, false, this); */

};