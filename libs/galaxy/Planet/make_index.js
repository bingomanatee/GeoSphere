/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var Sector = require('./../Sector');
	var mongoose = require('mongoose');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * The load function
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.make_index =	function () {
		var time = new Date().getTime();
		var self = this;
		self._index = {};

		function sector_vertices(index){
			return _.pluck(_.filter(self.iso.vertices, function(v){
				return _.contains(v.sectors, index);
			}), 'index')
		}

		function sector_children(index){
			var child_sectors =  _.filter(self.iso.sectors, function(s){
				return index == s[2];
			});

			if (child_sectors && child_sectors.length){
				_.each(child_sectors, function(sector){
					sector[3] = sector_children(sector[1]);
				});
			} else {
				self.iso.sectors[index][4] = sector_vertices(index);
			}

			return child_sectors;
		}

		var top_sectors = _.filter(self.iso.sectors, function(s){
			return _.isNull(s[2]);
		});

		_.each(top_sectors, function(sector){
			sector[3] = sector_children(sector[1]);
		}, self);

		var self = this;
		function a_to_o(sector){

			// self, id, name, depth
			var out = new GALAXY.Sector(self, sector[1], sector[0], parseInt(sector[0].split(':')[1]));
			out.is_top_sector = true;

			if (sector[3] && sector[3].length){
				out.add_children( _.map(sector[3], a_to_o), self);
			}

			if (sector[4]){
				out.vertices = sector[4]
			}

			out.get_vertices();
			out.each(function(sector){
				sector.center = sector.get_center();
				sector.planet = self;
			});

			return out;
		}

		delete self.iso.sectors;
		this.sector_tree = _.map(top_sectors, a_to_o);
		if (_DEBUG) this.get_sectors().forEach(function(s){
			console.log('sector: %s', util.inspect(s.report()));
		});


		if (_DEBUG ) console.log('index made: %s ms', new Date().getTime() - time);

	}
