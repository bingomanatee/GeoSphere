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
var test_root = path.resolve(__dirname, '../test_resources');
var csv = require('csv');
var Gate = require('gate');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;
var DEPTH = 4;

describe('GALAXY.Network', function () {

	describe('report', function () {

		var planet, network_0, network_1, network_2, network_3, network_4, network_5, network_6;

		var networks;
		var graph;

		before(function () {
			planet = new Planet();
			planet.init_iso(DEPTH);
			planet.init_networks();
		});

		function ad_near(node) {
			var near_dist = _.reduce(node.near_list, function (o, near) {
				return o + near.vertex.distanceTo(node.vertex);
			}, 0);
			return near_dist / node.near_list.length;
		}

		it('should be able to generate a CSV report', function (done) {

			var gate = Gate.create();
			planet.networks.forEach(function (network) {

				console.log('network %s', network);

				var data = ['index,detail,uvx, uvy,x, y,z,parents,children,near_distance'.split(',')];
				var child_data = [ 'index,detail,child,uvx, uvy,x, y,z,distance'.split(',')];
				var parent_data = [ 'index,detail,parent,uvx, uvy,x, y,z,distance'.split(',')];
				//	console.log('writing network %s', network);
				network.simplify(
					function (node, child) {
						child_data.push([
							child.index,
							child.detail,
							node.index,
							child.vertex.uv.x,
							child.vertex.uv.y,
							child.vertex.x,
							child.vertex.y,
							child.vertex.z,
							child.vertex.distanceTo(node.vertex)
						])
					},

					function __init(node) {
						console.log('node %s', node);
						data.push([
							node.index,
							node.detail,
							node.vertex.uv.x,
							node.vertex.uv.y,
							node.vertex.x,
							node.vertex.y,
							node.vertex.z,
							node.parents.length,
							node.children.length,
							ad_near(node)
						])
					}
				);
				network.inherit(
					function __iter_parent(node, parent) {
						console.log('sending parent %s', parent);
						parent_data.push([
							parent.index,
							parent.detail,
							node.index,
							parent.vertex.uv.x,
							parent.vertex.uv.y,
							parent.vertex.x,
							parent.vertex.y,
							parent.vertex.z,
							parent.vertex.distanceTo(node.vertex)
						])
					}

				)

				csv().from.array(data)
					.to(path.resolve(test_root, 'csv/network_' + network.detail + '.csv')
					)
					.on('end', gate.latch());

				csv().from.array(child_data)
					.to(path.resolve(test_root, 'csv/network_' + network.detail + '_children.csv')
					)
					.on('end', gate.latch());

				csv().from.array(parent_data)
					.to(path.resolve(test_root, 'csv/network_' + network.detail + '_parents.csv')
					)
					.on('end', gate.latch());

			})

			gate.await(function () {
				setTimeout(done, 500);
			})
		})
	})
})