/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var THREE = require('three');
require('./../libs/planet/PolyhedronGeometryMeta'); // alters THREE
var vertices = require('./../libs/planet/Vertices');
var Planet = require('./../libs/planet/Planet').Planet;
var Stat = require('./../libs/planet/Stat').Stat;
var chai = require('chai');
var humanize = require('humanize');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = 0;
var _DEBUG_ELE = false;

describe('Planet', function () {
	var SCALE = 2;

	var randoms = _.map((Math.PI + '' + Math.E).split(''), parseInt);
	randoms = _.reject(randoms, isNaN);
	console.log('randoms: %s', util.inspect(randoms));

	function ele_interp(uv, p, detail) {

		var e1 = p.get_elevation(uv.parents[0]);
		var e2 = p.get_elevation(uv.parents[1])
		return Stat.mean([e1, e2, e1, e2, ele(uv)]);
	}

	function ele(vertex, p) {
		return randoms[vertex.index % randoms.length];
	}

	/**
	 * A post elevation filter
	 */
	function smooth() {
		var planet = this;
		this.alter(function(uv){
			var neighbors = planet.get_neighbor_uvs(uv);
			//	console.log('neighbors: %s', util.inspect(neighbors));
			var nn = _.map(neighbors, function (n) {return planet.get_neighbor_uvs(n)}, planet);
			var pop = _.flatten(nn);
			//	console.log('population: %s', pop.length);
			var elevations = _.pluck(neighbors, 'elevation');
		//		console.log('elevations: %s', util.inspect(elevations));
			var q_ele = Stat.q(elevations);
		//		console.log('qe: %s', util.inspect(q_ele));
			uv.smooth_ele = Stat.mean([uv.elevation, Stat.mean(q_ele)]);
		});

		this.alter(function(uv){
			uv.elevation = uv.smooth_ele;
		})
	}

	describe('hydration (detail = 7)', function () {

		var planet;

		before(function () {
			var time = new Date().getTime();
			planet = new Planet(1, 7, {});
			console.log('planet created: %s seconds, %s points ', Math.floor( (new Date().getTime() - time)/1000), planet.get_uvs().length);

		});

		describe('#set_elevation', function () {
			before(function () {
				var time = new Date().getTime();
				planet.set_elevation(ele, ele_interp, smooth);
				console.log('elevation created: %s', Math.floor( (new Date().getTime() - time)/1000));
			});

			it('should be able to render elevations', function (done) {
				var time = new Date().getTime();
				planet.normalize_elevations();
				console.log('elevation normalized: %s', Math.floor( (new Date().getTime() - time)/1000));

				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightF7.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};

				planet.render_data(props, done);
			})

		})

		describe("#toJSON", function(){
			it('should be able to export itself as JSON', function(done){
				var time = new Date().getTime();
				var json = JSON.stringify(planet.toJSON());
				var fs = require('fs');
				fs.writeFile(__dirname + '/JSON/F7.json', json, 'utf8', function(){
					console.log('created, wrote JSON in %s ms', new Date().getTime() - time);
					done();
				})
			});

			it('should be able to export itself as JSON -- readable', function(done){
				var time = new Date().getTime();
				var json = JSON.stringify(planet.toJSON(), true, 1);
				var fs = require('fs');
				fs.writeFile(__dirname + '/JSON/F7.formatted.json', json, 'utf8', function(){
					console.log('created, wrote JSON in %s ms', new Date().getTime() - time);
					done();
				});
			});
		})
	});
});