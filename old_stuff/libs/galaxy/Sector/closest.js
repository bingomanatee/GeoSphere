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
GALAXY._prototypes.Sector.closest_sector = function (point, spread, min_depth) {
	if (!min_depth){
		min_depth = 0;
	}

	if (this.detail == min_depth) {
		return this;
	} else {
		var closest_sectors = GALAXY.util.near_sectors(this.children, point, spread);
		closest_sectors = _.map(closest_sectors, function(sector){
			return sector.closest_sector(point, spread, min_depth);
		})

		return GALAXY.util.closest_sector(point, closest_sectors);
	}

};

GALAXY._prototypes.Sector.closest_uv = function(uv, spread, min_depth){
	if (!min_depth){
		min_depth = 0;
	}

	if (this.depth == 0){

	} else if (this.detail == min_depth) {
		return GALAXY.util.closest_uv(uv, this.vertices_at[this.detail]);
	} else {
		var closest_sectors = GALAXY.util.near_sectors_uv(this.children, uv, spread, true);
		//console.log('closest uv sectors: %s (%s items)', closest_sectors, closest_sectors.length);
		var vertices = _.map(closest_sectors, function(sector){
			var out = sector.closest_uv(uv, spread, min_depth);
		//	console.log('sector %s, closest_uv: %s', sector.id, out);
			return out;
		})

		return GALAXY.util.closest_uv(uv, vertices);
	}



}