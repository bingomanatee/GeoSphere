/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var Planet = require('./../libs/galaxy/Planet');
var Network = require('./../libs/galaxy/Network');
var chai = require('chai');
var humanize = require('humanize');
var fs = require('fs');
var path = require('path');
var GALAXY = require('./../libs/galaxy/GALAXY');
var Canvas = require('canvas');
var test_root = path.resolve(__dirname, '../test_resources/network');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = 2;

var SCALE = 5;
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

	describe('#graph', function (done) {

		var planet, network_0, network_1, network_2, network_3;
		/*, network_4, network_5, network_6 */

		var graph = new Canvas(WIDTH, HEIGHT);

		before(function () {
			planet = new Planet();
			planet.init_iso(4);
			network_0 = new Network(planet, 0);
			network_1 = new Network(planet, 1);
			network_2 = new Network(planet, 2);
			network_3 = new Network(planet, 3);
			/*
			 network_4 = new Network(planet, 4);
			 network_5 = new Network(planet, 5);
			 network_6 = new Network(planet, 6); */

			network_0.link(network_1);
			network_1.link(network_2);
			network_2.link(network_3);

			network_0.graph(WIDTH, HEIGHT, graph, colors);

		});

		GALAXY.util.canvas_to_png(graph, path.resolve(test_root, 'network_0_3_graph.png'), done);
	})

});