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
var SCALE = 5;
var WIDTH = 360 * SCALE;
var HEIGHT = 180 * SCALE;

var test_root = path.resolve(__dirname, '../../test_resources');

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
	var canvas = network.draw_by_node(WIDTH, HEIGHT, function (node, canvas, ctx) {
		var g = GALAXY.util.channel(node.data.height);
		var color = g_color(g);
		ctx.fillStyle(color.getStyle());

		var uvs_scaled = _.map(this.node_to_triangles(), function (triangles) {
			return _.map(triangles, function (triangle) {
				if (!triangle._uvs_scaled) {
					triangle._uvs_scaled = _.map(triangle, function(vertex){
						if (!vertex._uv_scaled){
							vertex._uv_scaled = [vertex.uv.x * WIDTH, vertex.uv.y * HEIGHT];
						}
						return vertex._uv_scaled;
					});
				}
				return triangle._uvs_scaled;
			});
		})

		ctx.beginPath()
		uvs_scaled.forEach(function(uv, i){
			if (i){
				ctx.moveTo(uv.x, uv.y);
			} else {
				ctx.lineTo(uv.x, uv.y);
			}
		});
		ctx.closePath();
		ctx.fill();

	});

	return canvas;
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

		var planet, simplexes;

		before(function () {
			planet = new Planet({detail: DETAIL});
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

		}) // end before

		it('should be able to import networks', function (done) {
			var import_root = path.resolve(test_root, 'network/exports/detail_' + DETAIL);
			planet.import_networks(import_root, DETAIL, done);
		})

		it('should be able to generate simplex noise', function (done) {

			var functions = _.map(planet.networks
				.slice(0).reverse(), function (network) {
				return function (cb) {
					function callback() {
						console.log('done mapping network %s', network);
						setTimeout(cb, 2000);
					}

					console.log(' =========== mapping network %s ==========', network);
					simplex_noise(network, simplexes);
					var canvas = draw_terrain(network);
					GALAXY.util.canvas_to_png(canvas
						, path.resolve(test_root, 'terrain/simplex_' + network.detail + '.png')
						, callback);
				}
			});

			async.series(functions, done);
		});
	})
});