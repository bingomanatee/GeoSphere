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

	var samples = [];
	var data = [];
	var brute_force_results = [], indexed_results = [];
	var SAMPLE_LENGTH = 1000;

	before(function () {
		_.range(-1, 1.1, 0.05).forEach(function (x) {
			_.range(-1, 1.1, 0.05).forEach(function (y) {
				_.range(-1, 1.1, 0.05).forEach(function (z) {
					samples.push(THREE.spherical_vector(new THREE.Vector3(x, y, z)));
				})
			})
		})
	});

	function _annotate(rs, net) {
		return _.map(rs, function (index, si) {
			var target = samples[si];
			var nearest = net.nodes[index];
			var distance = target.distanceTo(nearest.vertex);
			return [index, distance];
		})
	}

	function _comp(index, net) {
		var index_results_set = indexed_results[index];
		var brute_force_result_set = brute_force_results[index];
		_.range(0, SAMPLE_LENGTH).forEach(function (i) {
			var bf_result = brute_force_result_set[i];
			var i_result = index_results_set[i];
			if (_DEBUG && (i < 10)) console.log('comparing %s and %s of set %s', util.inspect(bf_result), util.inspect(i_result), index);
			bf_result[1].should.eql(i_result[1], util.format('distance to point %s of network %s', i, net));
		});
	}

	describe('deep linking networks', function () {

		var planet, network_0, network_1, network_2, network_3, network_4, network_5, network_6;

		before(function () {
			planet = new Planet();
			planet.init_iso(6);
			network_0 = new Network(planet, 0);
			network_1 = new Network(planet, 1);
			network_2 = new Network(planet, 2);
			network_3 = new Network(planet, 3);
			network_4 = new Network(planet, 4);
			network_5 = new Network(planet, 5);
			network_6 = new Network(planet, 6);

			network_0.link(network_1);
			network_1.link(network_2);
			network_2.link(network_3);
			network_3.link(network_4);
			network_4.link(network_5);
			network_5.link(network_6);

			console.log('%s samples', samples.length);

			[network_0, network_1, network_2, network_3, network_4, network_5, network_6].forEach(function (net, i) {

				var start_time = new Date().getTime();
				var result_set = [];
				samples.forEach(function (s) {
					var t = net.closest(s, true);
					result_set.push(t.index);
					if (_DEBUG) console.log('closest to %s is %s - distance %s', s, t, s.distanceTo(t.vertex));
				})

				var end_time = new Date().getTime();
				console.log('brute force search %s: %s ms, %s samples'
					, net, end_time - start_time, samples.length);
				data.push([net.detail, 'brute force', end_time - start_time, net.node_list.length, samples.length]);
				brute_force_results.push(_annotate(result_set, net));

				start_time = new Date().getTime();
				result_set = [];
				samples.forEach(function (s) {
					var t = net.closest(s);
					result_set.push(t.index);
					if (_DEBUG) console.log('closest to %s is %s - distance %s', s, t, s.distanceTo(t.vertex));
				})

				end_time = new Date().getTime();
				console.log('indexed search %s: %s ms, %s samples'
					, net, end_time - start_time, samples.length);
				data.push([net.detail, 'indexed', end_time - start_time, net.node_list.length, samples.length]);
				indexed_results.push(_annotate(result_set, net));
			})

		}) // end before

		it('should be able to produce the same results in indexed search as in brute force search', function () {

			[network_0, network_1, network_2, network_3, network_4].forEach(function (net, i) {

				_comp(i, net);
			});

		})

		after(function () {
			data.forEach(function (l) {
				console.log(l.join(','));
			})
		})

	})

});