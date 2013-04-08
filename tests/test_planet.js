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
	var SCALE = 1.5;

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

	describe('non-recursing geometry (detail = 0)', function () {

		var planet;

		before(function () {
			planet = new Planet(100, 0, {});
		});

		describe('#constructor', function () {
			it('should be able to create a planet', function () {

				if (_DEBUG) {
					console.log('planet: %s, vertices: %s',
						util.inspect(planet, true, 0),
						planet.get_uvs().length);
				}

				planet.get_uvs().length.should.eql(12);
			});
		})

		describe('vertices_by_detail', function () {
			var vbd;

			before(function () {
				vbd = planet.vertices_by_detail();
			})
			it('should have a single entry', function () {

				if (_DEBUG) console.log('vbd: %s', util.inspect(vbd));

				vbd.length.should.eql(1);
			})
			it('should be well sorted by detail', function () {
				vbd[0].detail.should.eql(1);
				vbd[0].vertices.length.should.eql(12);
			})
		}),

			describe('#set_elevation', function () {
				before(function () {
					planet.set_elevation(ele, ele_interp, smooth);
				});

				it.skip('should be able to have elevations', function () {

					var elevation = _.pluck(planet.get_uvs(), 'elevation');
					elevation.should.eql(
						[
							-35,
							469,
							154,
							658,
							-189,
							-27,
							733,
							894,
							-200,
							-439,
							-361,
							-903
						]
					);

				})

			})
	});
	describe('7 levels of recursion geometry (detail = 7)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 7, {});
		});

		describe('#set_elevation', function () {
			before(function () {
				planet.set_elevation(ele, ele_interp, smooth);
			});

			it('should be able to render elevations', function (done) {

				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightR7.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};

				planet.normalize_elevations();
				planet.render_data(props, done);
			})

		})
	});
	describe('6 levels of recursion geometry (detail = 6)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 6, {});
		});

		describe('#set_elevation', function () {
			before(function () {
				planet.set_elevation(ele, ele_interp, smooth);
			});

			it('should be able to render elevations', function (done) {

				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightR6.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};

				planet.normalize_elevations();
				planet.render_data(props, done);
			})

		})
	});
	describe('5 levels of recursion geometry (detail = 5)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 5, {});
		});

		describe('#set_elevation', function () {
			before(function () {
				planet.set_elevation(ele, ele_interp, smooth);
			});

			it('should be able to render elevations', function (done) {

				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightR5.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};

				planet.normalize_elevations();
				planet.render_data(props, done);
			})

		})
	});
	describe('4 levels of recursion geometry (detail = 4)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 4, {});
		});

		describe('#set_elevation', function () {
			before(function () {
				planet.set_elevation(ele, ele_interp, smooth);
			});

			it('should be able to render elevations', function (done) {

				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightR4.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};

				planet.normalize_elevations();
				planet.render_data(props, done);
			})

		})
	});
	describe('3 levels of recursion geometry (detail = 3)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 3, {});
		});

		describe('#set_elevation', function () {
			before(function () {
				planet.set_elevation(ele, ele_interp, smooth);
			});

			it('should be able to render elevations', function (done) {

				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightR3.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};

				planet.normalize_elevations();
				planet.render_data(props, done);
			})

		})
	});
	describe('2 levels of recursion geometry (detail = 2)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 2, {});
		});

		describe('constructor', function () {
			it('should be able to create a planet', function () {

				if (_DEBUG) {
					console.log('planet: %s, vertices: %s',
						util.inspect(planet, true, 0),
						planet.get_uvs().length);
				}

				planet.get_uvs().length.should.eql(162);
			});
		})

		describe('vertices_by_detail', function () {
			var vbd;

			before(function () {
				vbd = planet.vertices_by_detail();
			})
			it('should have 3 entries', function () {

				if (_DEBUG) console.log('vbd: %s', util.inspect(vbd));

				vbd.length.should.eql(3);
			})
			it('should be well sorted by detail', function () {
				vbd[0].detail.should.eql(1);
				vbd[0].vertices.length.should.eql(12);
				vbd[1].detail.should.eql(2);
				vbd[1].vertices.length.should.eql(30);
				vbd[2].detail.should.eql(3);
				vbd[2].vertices.length.should.eql(120);
			})
		})

		describe('#set_elevation', function () {
			before(function () {
				planet.set_elevation(ele, ele_interp, smooth);
			});

			it('should be able to render elevations', function (done) {

				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightR2.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};

				planet.normalize_elevations();
				planet.render_data(props, done);
			})

		})
	});

	describe('one level of recursion geometry (detail = 1)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 1, {});
		});

		describe('constructor', function () {
			it('should be able to create a planet', function () {

				if (_DEBUG) {
					console.log('planet: %s, vertices: %s',
						util.inspect(planet, true, 0),
						planet.get_uvs().length);
				}

				planet.get_uvs().length.should.eql(42);
			});
		})

		describe('vertices_by_detail', function () {
			var vbd;

			before(function () {
				vbd = planet.vertices_by_detail();
			})
			it('should have two entries', function () {

				if (_DEBUG) console.log('vbd: %s', util.inspect(vbd));

				vbd.length.should.eql(2);
			})
			it('should be well sorted by detail', function () {
				vbd[0].detail.should.eql(1);
				vbd[0].vertices.length.should.eql(12);
				vbd[1].detail.should.eql(2);
				vbd[1].vertices.length.should.eql(30);
			})
		})

		describe('#set_elevation', function () {
			before(function () {
				planet.set_elevation(ele, ele_interp, smooth);
			});

			it.skip('should be able to have elevations', function (done) {

				var elevation = _.pluck(planet.get_uvs(), 'elevation');
				elevation.should.eql(
					[
						-35,
						469,
						154,
						658,
						-189,
						-27,
						733,
						894,
						-200,
						-439,
						-361,
						-903,
						-469,
						-31,
						-465,
						217,
						221,
						429,
						681,
						-198,
						266,
						-632,
						15,
						-233,
						-108,
						-546,
						-375,
						-104,
						186,
						813,
						347,
						134,
						109,
						234,
						-314,
						406,
						-18,
						695,
						443,
						229,
						266,
						-320
					]
				);

			});

			it('should beable to render elevations', function (done) {
				var props = {
					render_basis: 'node',
					width:        360 * SCALE,
					height:       180 * SCALE,
					file:         __dirname + '/render/heightR1.png',
					input:        'elevation_normalized',
					color_map:    function (uv) {
						var value = uv.elevation_normalized * 255;
						return [value, value, value];
					}
				};
				planet.normalize_elevations();
				planet.render_data(props, done);
			})

		})
	});

});