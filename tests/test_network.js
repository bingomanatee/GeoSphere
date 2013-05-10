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

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;
var _DEBUG_C = false;
var test_root = path.resolve(__dirname, '../test_resources/network');

var W = 360, H = 180;

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

function closest_point_color(x, y, network) {
	if (!(x % 10 + y % 10)) {
		console.log('cpn for x %s y %s network %s', x, y, network.detail);
	}
	var lat = x/W * Math.PI * 2;
	var lon = (y/H - 0.5) * Math.PI;
	var point = THREE.utils.latLonToVertex(lon, lat);
	var closest = network.closest(point);
	//console.log('closest: %s', util.inspect(uv));
	var color = network.node_list[closest.index].data.color;
	return [GALAXY.util.channel(color.r * 255), GALAXY.util.channel(color.g * 255), GALAXY.util.channel(color.b * 255)];
}

describe('GALAXY.Network', function () {

	describe('level zero network', function () {

		var planet, network;

		before(function () {
			planet = new Planet();
			planet.init_iso(0);
			network = new Network(planet, 0);
		});

		it('should have twelve nodes in the network', function () {

			network.node_list.length.should.eql(12, 'twelve nodes in the network');
		})

		it('should have three neighbors in each node', function () {
			_.each(network.nodes, function (node) {
				node.near_list.length.should.eql(5, 'each node for a zero level tesselation should have 5 neighbors');
			});
		})
	})

	describe('level one network', function () {

		var planet, network;

		before(function () {
			planet = new Planet();
			planet.init_iso(1);
			network = new Network(planet, 0);
		});

		it('should have twelve nodes in the network', function () {

			network.node_list.length.should.eql(42, '42 nodes in the network');
		})

		it('should have three neighbors in each node', function () {
			var threes = 0;
			var fives = 0;

			var node_groups = _.groupBy(network.node_list, function (node) {
				return node.near_list.length;
			})
			//console.log('node_groups: %s', util.inspect(node_groups));

			node_groups[5].length.should.eql(12);
			node_groups[6].length.should.eql(42 - 12);
		})
	});

	describe('linking networks', function () {

		var planet, network_0, network_1;

		var link_expectations = [
			[0],
			[1],
			[2],
			[3],
			[4],
			[5],
			[6],
			[7],
			[8],
			[9],
			[10],
			[11],
			[ 0, 11 ],
			[ 0, 5 ],
			[ 11, 5 ],
			[ 0, 1 ],
			[ 5, 1 ],
			[ 0, 7 ],
			[ 1, 7 ],
			[ 0, 10 ],
			[ 7, 10 ],
			[ 10, 11 ],
			[ 1, 9 ],
			[ 5, 9 ],
			[ 5, 4 ],
			[ 11, 4 ],
			[ 11, 2 ],
			[ 10, 2 ],
			[ 10, 6 ],
			[ 7, 6 ],
			[ 7, 8 ],
			[ 1, 8 ],
			[ 3, 9 ],
			[ 3, 4 ],
			[ 9, 4 ],
			[ 3, 2 ],
			[ 4, 2 ],
			[ 3, 6 ],
			[ 2, 6 ],
			[ 3, 8 ],
			[ 6, 8 ],
			[ 8, 9 ]
		];

		before(function () {
			planet = new Planet();
			planet.init_iso(1);
			network_0 = new Network(planet, 0);
			network_1 = new Network(planet, 1);

			network_0.link(network_1);

			network_1.each(function (node) {
				var color = colors[node.index % colors.length];
				if (_DEBUG_C) console.log('assigning color %s to node %s', color.getStyle(), node);
				node.data.color = color;
			});

			network_0.inherit(
				function __iterate(node, parent) {
					if (!parent.data.colors) parent.data.colors = [];
					node.data.colors.push(parent.data.color);
				}, function __init(node) {
					node.data.colors = [];
				}, function __fin(node) {
					node.data.color = _.reduce(node.data.colors, function (out, c) {
						out.add(c);
						return out;
					}, new THREE.Color().setRGB(0, 0, 0));

					var s = 1 / node.data.colors.length;
					node.data.color.multiplyScalar(s);
				}
			);
		});

		it('should have twelve nodes in the network 0', function () {
			network_0.node_list.length.should.eql(42, '42 nodes in the network 0');
		})

		it('should have twelve nodes in the network 1', function () {

			network_1.node_list.length.should.eql(12, '12 nodes in network 1');
		})

		it('should be able to find the right parents links', function () {
			_.each(link_expectations, function (pair, index) {
				var node = network_0.node_list[index];
				var parent_indexes = _.pluck(node.parents, 'index');
				if (_DEBUG) {
					console.log('%s: comparing node %s parents %s to %s',
						index, node, util.inspect(parent_indexes), util.inspect(pair));
				}

				parent_indexes.should.eql(pair);
			})
		})

		it('should be able to mix colors', function (done) {

			network_1.each(function (node) {
				if (_DEBUG_C) console.log('node %s color: %s', node, node.data.color.getStyle());
			})

			network_0.each(function (node) {
				if (_DEBUG_C) console.log('node %s color: %s', node, node.data.color.getStyle());
			})

			_.each(_.range(0, 12), function (index) {
				network_1.node_list[index].data.color.getStyle().should.eql(network_0.node_list[index].data.color.getStyle());
			});


			var canvas = GALAXY.util.draw(W, H, function (x, y) {
				return closest_point_color(x, y, network_1);
			});

			var out = fs.createWriteStream(path.resolve(test_root, 'network_1_colors.png'));
			var stream = canvas.pngStream();

			stream.on('data', function (c) {
				out.write(c);
			});

			stream.on('end', function () {
			//	return                setTimeout(done, 500);

				var canvas = GALAXY.util.draw(W, H, function (x, y) {
					return closest_point_color(x, y, network_0);
				});

				var out = fs.createWriteStream(path.resolve(test_root, 'network_0_colors.png'));
				var stream = canvas.pngStream();

				stream.on('data', function (c) {
					out.write(c);
				});

				stream.on('end', function () {
					setTimeout(done, 500);
				});
			})

		})

	})

	describe('deep linking networks', function () {

		var planet, network_0, network_1, network_2;

		before(function () {
			planet = new Planet();
			planet.init_iso(2);
			network_0 = new Network(planet, 0);
			network_1 = new Network(planet, 1);
			network_2 = new Network(planet, 2);

			network_0.link(network_1);

			network_1.link(network_2);

			network_2.each(function (node) {
				var color = colors[node.index % colors.length];
				if (_DEBUG_C) console.log('assigning color %s to node %s', color.getStyle(), node);
				node.data.color = color;
			});

			function __iterate(node, parent) {
				if (!parent.data.colors) parent.data.colors = [];
				node.data.colors.push(parent.data.color);
			}

			function __init(node) {
				node.data.colors = [];
			}

			function __fin(node) {
				node.data.color = _.reduce(node.data.colors, function (out, c) {
					out.add(c);
					return out;
				}, new THREE.Color().setRGB(0, 0, 0));

				var s = 1 / node.data.colors.length;
				node.data.color.multiplyScalar(s);
			}

			network_1.inherit(__iterate, __init, __fin);
			network_0.inherit(__iterate, __init, __fin);
		});

		it('should be able to mix colors', function (done) {

			var W = 360, H = 180;

			var canvas = GALAXY.util.draw(W, H, function (x, y) {
				return closest_point_color(x, y, network_0);
			});

			var out = fs.createWriteStream(path.resolve(test_root, 'network_0_2_colors.png'));
			var stream = canvas.pngStream();

			stream.on('data', function (c) {
				out.write(c);
			});

			stream.on('end', function () {

				setTimeout(done, 500);
			})

		})

	})

});