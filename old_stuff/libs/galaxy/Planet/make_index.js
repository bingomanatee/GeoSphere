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
 * sets the children of sectors
 *
 * @param point
 */
GALAXY._prototypes.Planet.index_sectors = function () {
	this.sectors.forEach(function (s) {
		s.get_center();
		s.children = [];
		s.children_at = [];
		s.vertices_at = [];
		s.vertices_at[s.detail] = s.vertices.slice();
		for (var i = 0; i < s.detail; ++i) {
			s.vertices_at[i] = [];
			s.children_at[i] = [];
		}
	});

	var planet = this;
	this.sectors.forEach(function (s) {
		if (s.parent > -1) {
			var parent = planet.sectors[s.parent];
			parent.children.push(s);

			while (parent) {
				var vat = parent.vertices_at[s.detail];
				vat.push.apply(vat, s.vertices);

				parent.children_at[s.detail].push(s);
				if (parent.parent == -1) {
					parent = false;
				} else {
					parent = planet.sectors[parent.parent];
				}
			}
		}

	}, this);

	this.sectors.forEach(function (s) {
		s.vertices_at = _.map(s.vertices_at, function (verts) {
			return _.map(_.uniq(verts), function(index){
				return planet.vertices[index];
			})
		})
	})

	this.sectors_by_detail = _.sortBy(
		_.values(_.groupBy(this.sectors, 'detail')),
		function (vs) {
			return vs[0].detail;
		});
};