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
var test_root = path.resolve(__dirname, '../../test_resources/network/exports');
var Gate = require('gate');
var mkdirp = require('mkdirp');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;

var SCALE = 25;
var WIDTH = 360 * SCALE;
var HEIGHT = 180 * SCALE;
var DEPTH = 8;

describe('GALAXY.Network', function () {

	describe('#export', function () {

		var planet;

		before(function () {
			planet = new Planet();
		});

		function compare_network(network) {
			var base_network = planet.networks[network.detail];
			if (base_network.node_list.length > 10000){
				return;
			}

			if (_DEBUG || 1)    console.log('comparing network %s to base %s', network, base_network);

			base_network.node_list.length.should.eql(network.node_list.length, 'length of node lists -- ', network.node_list.length);

			network.each(function (node) {
				var base_node = base_network.nodes[node.index];
				if (!base_node) {
					throw new Error('cannot find base node ' + node.index);
				}
				try {

					base_node.index.should.eql(node.index, 'comparing index');
					base_node.vertex.x.should.be.within(node.vertex.x - 0.000001, node.vertex.x + 0.000001, 'comparing x');
					base_node.vertex.y.should.be.within(node.vertex.y - 0.000001, node.vertex.y + 0.000001, 'comparing y');
					base_node.vertex.z.should.be.within(node.vertex.z - 0.000001, node.vertex.z + 0.000001, 'comparing z');

					var nears = _.sortBy(_.pluck(node.near_list, 'index'), _.identity);
					var base_nears = _.sortBy(_.pluck(base_node.near_list, 'index'), _.identity);
					nears.should.eql(base_nears, 'comparing nears');

					var children = _.sortBy(_.pluck(node.children, 'index'), _.identity);
					var base_children = _.sortBy(_.pluck(base_node.children, 'index'), _.identity);
					children.should.eql(base_children, 'comparing children');

					var parents = _.sortBy(_.pluck(node.parents, 'index'), _.identity);
					var base_parents = _.sortBy(_.pluck(base_node.parents, 'index'), _.identity);
					parents.should.eql(base_parents, 'comparing parents');

				} catch (err) {
					console.log(' !!!!!!!!!!!!!! compare error for %s against %s: %s', node, base_node, err);
					throw err;
				}
			})
		}

		it('should be able to export networks', function (done) {

			planet.init_iso(DEPTH);
			planet.init_networks();
			var root = path.resolve(test_root, 'detail_' + DEPTH);
			mkdirp(root);
			console.log('root: %s', root);

			var network_index = 0;

			function exp() {
				if (network_index >= planet.networks.length) {
					console.log('done exporting');
					return 	setTimeout(done, 500);
				}
				var network = planet.networks[network_index];
				console.log('writing network %s', network);
				++network_index;

				var file_path = path.resolve(root, 'network_' + network.detail + '.bin');

				network.export(file_path, function () {
					console.log('done writing %s', network);

					process.nextTick(exp);
				})
			}

			exp();

		});

		it('should be able to import networks', function (done) {

			var root = path.resolve(test_root, 'detail_' + DEPTH);
			var gate = Gate.create();

			fs.readdir(root, function (err, files) {

				files.forEach(function (file) {
					if (!/\.bin$/.test(file)) {
						return;
					}
					var network = new Network({}, 0, true);
					var l = gate.latch();

					network.import(path.resolve(root, file), function () {
						network.planet = planet;

						compare_network(network);
						l();
					})
				})

				gate.await(function () {
					if (_DEBUG)            console.log('done importing');
					setTimeout(done, 500);

				});
			})

		});

	})
})