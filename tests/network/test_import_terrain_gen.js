/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var Planet = require('./../../libs/galaxy/Planet');
var Network = require('./../../libs/galaxy/Network');
var chai = require('chai');
var humanize = require('humanize');
var fs = require('fs');
var path = require('path');
var GALAXY = require('./../../libs/galaxy/GALAXY');
var Gate = require('gate');
var Simplex = require('simplex-noise');
var async = require("async");

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;

var DETAIL = 7;

var test_root = path.resolve(__dirname, '../../test_resources');

var i = 0;

function simplex_noise(terrain, simplexes) {
	terrain.each(function (node) {
		var x = node.vertex.x;
		var y = node.vertex.y;
		var z = node.vertex.z;

		node.data.height = _.reduce(simplexes, function (out, sim) {
			var sn = sim.simplex.noise3D(x * sim.scale, y * sim.scale, z * sim.scale);
			var op = (1 + sim.simplex_opacity.noise3D(x * sim.scale, y * sim.scale, z * sim.scale)) / 2;

			return out + sn * sim.weight * op;
		}, 128);
	})
}

describe('GALAXY.Network', function () {

	describe('terrain generation', function () {

		var planet;

		before(function () {
			planet = new Planet({detail: DETAIL});
		}) // end before

		it.only('should be able to import networks', function(done){
			var import_root = path.resolve(test_root, 'network/exports/detail_' + DETAIL);
			planet.import_networks(import_root, DETAIL, done);
		})

		it.skip('should be able to generate simplex noise', function (done) {

			var functions = _.map(planet.networks
				.slice(0).reverse(), function (network){
				return function(cb){fv
					function callback(){
						console.log('done mapping network %s', network);
						setTimeout(cb, 2000);
					}
					console.log(' =========== mapping network %s ==========', network);
					simplex_noise(network, simplexes);
					var canvas = draw_noise(network);
					GALAXY.util.canvas_to_png(canvas
						, path.resolve(test_root, 'terrain/terrain_noise_' + network.detail + '.png')
						, callback);
				}
			});

			async.series(functions, done);
		});
	})
});