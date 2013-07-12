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
var Canvas = require('canvas');
var test_root = path.resolve(__dirname, '../../test_resources/network');
var Gate = require('gate');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;

var SCALE = 25;
var WIDTH = 360 * SCALE;
var HEIGHT = 180 * SCALE;

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

describe('GALAXY.Network', function () {

	describe('#graph', function () {

		var planet, network_0, network_1, network_2, network_3, network_4, network_5, network_6;

		var networks;
		var graph;

		before(function () {
			planet = new Planet();
			planet.init_iso(6);
			network_0 = new Network(planet, 0);
			network_1 = new Network(planet, 1);
			network_2 = new Network(planet, 2);
			network_3 = new Network(planet, 3);

			network_4 = new Network(planet, 4);
			network_5 = new Network(planet, 5);
			//	 network_6 = new Network(planet, 6); 

			network_0.link(network_1);
			network_1.link(network_2);
			network_2.link(network_3);
			network_3.link(network_4);
			network_4.link(network_5);

		});

		describe('graphs', function () {

			beforeEach(function () {
				networks = [network_0, network_1, network_2, network_3, network_4, network_5];
			})

			it('should be able to draw a canvas - parents', function (done) {
				var gate = Gate.create();
				networks.forEach(function (network) {
					var graph = new Canvas(WIDTH, HEIGHT);
					var detail = network.detail;
					network.graph(WIDTH, HEIGHT, graph, colors, true);
					GALAXY.util.canvas_to_png(graph,
						path.resolve(test_root, 'planet6/parents/parent_' + detail + '.png'), gate.latch());
				})
				gate.await(done);
			})

			it.skip('should be able to graph a canvas - children - <= 6s', function (done) {
				var gate = Gate.create();
				networks.forEach(function (network) {
					var graph = new Canvas(WIDTH, HEIGHT);
					var detail = network.detail;
					network.graph(WIDTH, HEIGHT, graph, colors, false, function (node) {
						return node.children.length <= 16;
					});
					GALAXY.util.canvas_to_png(graph,
						path.resolve(test_root, 'planet6/children/child' + detail + '-0-lte6.png'), gate.latch());
				});
				gate.await(done);

			});
			it.skip('should be able to graph a canvas - children - 12s', function (done) {
				var gate = Gate.create();

				networks.forEach(function (network) {
					var graph = new Canvas(WIDTH, HEIGHT);
					var detail = network.detail;
					network.graph(WIDTH, HEIGHT, graph, colors, false, function (node) {
						return( node.children.length > 6) && (node.children.length <= 12)
					});
					GALAXY.util.canvas_to_png(graph,
						path.resolve(test_root, 'planet6/children/child' + detail + '-1-7-12.png'), gate.latch());
				});
				gate.await(done);
			});

			it.skip('should be able to graph a canvas - children - 12 .. 17', function (done) {
				var gate = Gate.create();

				networks.forEach(function (network) {
					var graph = new Canvas(WIDTH, HEIGHT);
					var detail = network.detail;
					network.graph(WIDTH, HEIGHT, graph, colors, false, function (node) {
						return (node.children.length >= 12) && (node.children.length < 18 );
					});
					GALAXY.util.canvas_to_png(graph,
						path.resolve(test_root, 'planet6/children/child' + detail + '-2-12-17.png'), gate.latch());
				});
				gate.await(done);
			});

			it.skip('should be able to graph a canvas - children - >= 18s', function (done) {
				var gate = Gate.create();

				networks.forEach(function (network) {
					var graph = new Canvas(WIDTH, HEIGHT);
					var detail = network.detail;
					network.graph(WIDTH, HEIGHT, graph, colors, false, function (node) {
						return (node.children.length >= 18);
					});
					GALAXY.util.canvas_to_png(graph,
						path.resolve(test_root, 'planet6/children/child' + detail + '-2-gte18.png'), gate.latch());
				});
				gate.await(done);
			});

			it('should be able to graph a canvas - children (all)', function (done) {
				var gate = Gate.create();
				networks.forEach(function (network) {
					var graph = new Canvas(WIDTH, HEIGHT);
					var detail = network.detail;
					network.graph(WIDTH, HEIGHT, graph, colors, false, true);
					GALAXY.util.canvas_to_png(graph,
						path.resolve(test_root, 'planet6/children/child' + detail + '.png'), gate.latch());
				})
				gate.await(done);
			});
			it.skip('should survey child density', function () {
				networks.forEach(function (network) {
					var nbc = _.groupBy(network.node_list, function(node){
						return node.children.length;
					})
					_.each(nbc, function(nodes, count){
						console.log("network %s count %s nodes: %s", network.detail, count, nodes.length);
					})
				})
			});
		});
	})
})