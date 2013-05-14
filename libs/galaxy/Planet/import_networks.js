/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Sector = require('./../Sector');
	var util = require('util');
	var Network = require('./../Network');
	var path = require('path');
	var async = require('async');
	var fs = require('fs');
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
 * creates the isosphere that is the basis of the planet
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.import_networks = function (root, detail, done) {
	console.log('importing networks to detail %s', detail);

	this.networks = [];

	_.range(0, detail).forEach(function (detail) {
		this.networks[detail] = new Network(this, detail, true);
	}, this);

	var functions = _.map(this.networks, function (network) {

		var file_path = path.resolve(root, 'network_' + network.detail + '.bin');

		return function (callback) {
			fs.exists(file_path, function (exists) {
				if (exists) {
					if (_DEBUG)console.log(' ===========  mapping network %s ==========', network.detail);

					network.import(file_path, function () {

						if (_DEBUG)console.log(' =========== done mapping network %s ==========', network.detail);
						callback();
					});
				} else {
					var sector_dir = path.resolve(root, 'sectors/network_' + network.detail);
					fs.exists(sector_dir, function (sd_exists) {

						var dir_functions = _.map(_.range(0, 20), function (sector) {
							return function (sector_cb) {
								if (_DEBUG)console.log(' =========== mapping sector %s ==========', sector);
								var sector_file = path.resolve(sector_dir, 'sector_' + sector + '.bin');
								if (_DEBUG)    console.log('importing sector file %s', sector_file);
								fs.exists(sector_file, function (exists) {
									if (!exists) {
										cb(new Error('cannot find sector file ' + sector_file));
									} else {
										network.import(sector_file, function (err) {
											if (err) {
												throw err;
											}

											if (_DEBUG)    console.log(' =========== done mapping sector %s ==========', sector);
											sector_cb()
										});
									}
								})
							}
						});

						if (sd_exists) {
							async.series(dir_functions, callback);
						} else {
							callback(new Error('cannot find sector dir ' + sector_dir));
						}
					})

				}
			})
		}

	})

	var self = this;

	if (!self._vertices) {
		self._vertices = [];
	}

	function _post_process_networks() {
		_.each(self.networks, function (network) {
			network.each(function (node) {
				_.each(node.near_list, function (near, i) {
					node.near_list[i] = self.get_node(near.index, network.detail);
				})

				/**
				 * reducing number of references by ensuring every vertex with the same index
				 * points to the same vertex.
				 */

				var old_vertex = self.get_vertex(node.index);
				if (old_vertex) {
					node.vertex = old_index;
				} else {
					self.set_vertex(node.vertex);
				}

				//@TODO: link child, parent, influncers
			})
		}, self);
		done();
	}

	async.series(functions, _post_process_networks);

};