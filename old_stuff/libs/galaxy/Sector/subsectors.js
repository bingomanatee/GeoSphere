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
 * returns an array of vertices from this sectors' list of vertex indexes.
 * and the vertices of all the subsectors
 * @returns {[THREE.Vector3]}
 */

GALAXY._prototypes.Sector.subsector_vertices = function () {
	if (!this._subsector_vertices){
		this._subsector_vertices = this.vertices.slice();
		_.each(this.subsectors(), function(sector){
			this._subsector_vertices.push.apply(this._subsector_vertices, sector.vertices);
		}, this);
	}

	return this._subsector_vertices;
};

GALAXY._prototypes.Sector.subsector_ids = function () {
	if (!this._subsector_ids) {
		if (this.detail == 0) {
			this._subsector_ids = [];
		} else {
			var next_level = this.planet.sectors_by_detail[this.detail - 1];
			this._subsector_ids = _.pluck(
				_.filter(
					next_level,
					function (sector) {
						return sector.parent == this.id;
					},
					this
				), 'id');
		}
	}
	return this._subsector_ids;
};

GALAXY._prototypes.Sector.subsectors = function () {
	if (!this._subsectors) {
		if (this.detail == 0) {
			this._subsectors = [];
		} else {
			this._subsectors = _.reduce(this.subsector_ids(),
				function (out, id) {
					var sector = this.sectors[id];
					out.push(sector);
					out.push.apply(out, sector.subsectors());
					return out;
				}, [], this);
		}
	}
	return this._subsectors;
};
