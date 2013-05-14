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

var SCALE = 3;
var WIDTH = 360 * SCALE;
var HEIGHT = 180 * SCALE;
var DEPTH = 5;

var test_root = path.resolve(__dirname, '../../test_resources');

var colors = [
	new THREE.Color().setRGB(1, 0, 0),
	new THREE.Color().setRGB(0, 0.5, 0.5),
	new THREE.Color().setRGB(0, 1, 0),
	new THREE.Color().setRGB(0.5, 0, 0.5),
	new THREE.Color().setRGB(0, 0, 1),
	new THREE.Color().setRGB(0.5, 0.5, 0),
	new THREE.Color().setRGB(0, 0.5, 0),
	new THREE.Color().setRGB(1, 0, 1),
	new THREE.Color().setRGB(0.5, 0, 0),
	new THREE.Color().setRGB(0, 1, 1),
	new THREE.Color().setRGB(0, 0, 0.5),
	new THREE.Color().setRGB(1, 1, 0)
];

function draw_noise(network) {
	return GALAXY.util.draw(WIDTH, HEIGHT, function (x, y) {
		var xs = x / SCALE;
		var ys = y / SCALE;
		ys -= 90;
		var point3 = THREE.utils.latLonToVertex(ys, xs, true);
		var node = network.closest(point3);
		var g = GALAXY.util.channel(node.data.height);
		return g_color(g);
	});
}

var PCT_OCEAN = 0.6;
var sea_level = 255 * PCT_OCEAN;
var remainder = 255 - sea_level;

function g_color(g) {
	var g_range;
	if (g < sea_level) {
		g_range = g * 255 / sea_level;

		return [0, GALAXY.util.channel(g_range / 2), GALAXY.util.channel(g_range), 1]
	} else {
		g_range = g - sea_level;
		g_range *= 255 / remainder;
		return [ GALAXY.util.channel(g_range * 1.2), GALAXY.util.channel(g_range * 0.8), GALAXY.util.channel(g_range / 2), 1];
	}
}

function draw_terrain(network) {
	console.log('drawing terrain for network %s', network);
	return GALAXY.util.draw(WIDTH, HEIGHT, function (x, y) {
		var xs = x / SCALE;
		var ys = y / SCALE;
		ys -= 90;
		var point3 = THREE.utils.latLonToVertex(ys, xs, true);
		var node = network.closest(point3);
		var g = GALAXY.util.channel(node.data.height);
		if (0 == (x % 50) == (y % 50)) {
			if (_DEBUG) {
				console.log('x: %s, y: %s, xs: %s, ys: %s, point: %s, closest node %s, g: %s',
					x, y, xs, ys, point3, node, g);
			}
		}
		return g_color(g);
	});

}

function _sum(data) {
	return _.reduce(data, function (o, n) {
		return o + n;
	}, 0);
}
function next_res(network) {

	network.inherit(function __iter(node, parent) {
			node.data.heights.push(parent.data.height);
		},
		function __init(node) {
			node.data.heights = [];
		},
		function __fin(node) {
			node.data.height = _sum(node.data.heights) / node.data.heights.length;
			delete node.data.heights;
		});

	var heights = network.map(function (node) {
		return node.data.height;
	})
	var stdev = GALAXY.util.stat.standardDeviation(heights);
	var avg = GALAXY.util.stat.average(heights);
	var min = avg - (1.5 * stdev);
	var max = avg + (1.5 * stdev);
	var range = max - min;
	var scale = 255 / range;

	network.each(function (node) {
		node.data.height = (node.data.height - min) * scale;
	})

	network.each(function (node) {
		var range = _.map(node.nears, function (nn) {
			return nn.data.height;
		});

		var stdev = Math.max(GALAXY.util.stat.standardDeviation(range), 1);

		node.data.random_height = ((Math.random() - Math.random()) * (5 + stdev * 2));
		console.log('noise stdev: %s, rh: %s', humanize.numberFormat(stdev, 1), humanize.numberFormat(node.data.random_height, 1));
	});

	network.each(function (node) {
		node.data.height += node.data.random_height;
	})
}

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
		var simplexes;

		before(function () {
			planet = new Planet();
			planet.init_iso(DEPTH);
			planet.init_networks();
			simplexes = [
				{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           32,
					weight:          16
				},
			/*	{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           16,
					weight:          32
				}, */
				{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           8,
					weight:          32
				},
			/*	{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           4,
					weight:          64
				}, */
				{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           2,
					weight:          128
				},
			/*	{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           1,
					weight:          128
				}, */
				{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           0.5,
					weight:          128
				},
		/*		{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           0.25,
					weight:          128
				}, */
				{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           0.125,
					weight:          64
				},
				{
					simplex:         new Simplex(Math.random),
					simplex_opacity: new Simplex(Math.random),
					scale:           0.0625,
					weight:          32
				}
			];

			_.pluck(simplexes, 'simplex').forEach(function (sim) {
				sim.grad3 = new Float32Array(_.shuffle(sim.grad3))
			})
		}) // end before

		it('should be able to generate random terrain', function (done) {
			planet.networks[5].each(function (node) {
				node.data.height = 500 * Math.random() - 128;
			});

			var canvas = draw_terrain(planet.networks[5]);
			GALAXY.util.canvas_to_png(canvas, path.resolve(test_root, 'terrain/terrain_5.png'), function () {
				setTimeout(done, 2000);
			});
		})

		it('should be able to increase resolution', function (done) {

			var networks = planet.networks.slice();
			networks.pop();
			networks = networks.reverse();
			var gate = Gate.create();

			networks.forEach(function (network) {

				next_res(network);

				var canvas = draw_terrain(network);
				GALAXY.util.canvas_to_png(canvas, path.resolve(test_root, 'terrain/terrain_' + network.detail + '.png'), gate.latch());

			})

			gate.await(done);
		});

		it.only('should be able to generate simplex noise and simplify upwards', function (done) {

			var functions = _.map(planet.networks
				.slice(0).reverse(), function (network){
				return function(cb){
					function callback(){
						console.log('done mapping network %s', network);
						setTimeout(cb, 2000);
					}
					console.log('mapping network %s', network);
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