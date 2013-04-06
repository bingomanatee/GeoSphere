/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var THREE = require('three');
require('./../libs/planet/PolyhedronGeometryMeta'); // alters THREE
var vertices = require('./../libs/planet/Vertices');
var Planet = require('./../libs/planet/Planet').Planet;
var chai = require('chai');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = 0;

describe('Planet', function () {
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
						planet.get_vertices().length);
				}

				planet.get_vertices().length.should.eql(12);
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
					planet.set_elevation(function (vertex, p) {
						var u = vertex.x * 7;
						var v = vertex.y * 13;
						return Math.floor(500 * (Math.sin(u) - Math.cos(v)));
					}, function () {
						return 0;
					});
				});

				it('should be able to have elevations', function () {

					var elevation = _.pluck(planet.get_vertices(), 'elevation');
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

	describe.only('one level of recursion geometry (detail = 1)', function () {

		var planet;

		before(function () {

			planet = new Planet(1, 1, {});
		});

		describe('constructor', function () {
			it('should be able to create a planet', function () {

				if (_DEBUG) {
					console.log('planet: %s, vertices: %s',
						util.inspect(planet, true, 0),
						planet.get_vertices().length);
				}

				planet.get_vertices().length.should.eql(42);
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
				planet.set_elevation(function (vertex, p) {
					var u = vertex.x * 7;
					var v = vertex.y * 13;
					return Math.floor(500 * (Math.sin(u) - Math.cos(v)));
				}, function (uv, p, detail) {
				if (_DEBUG)	console.log('vertex: %s, parents: %s', uv.index, util.inspect(uv.parents));
					var e1 = p.get_elevation(uv.parents[0]);
					var e2 = p.get_elevation(uv.parents[1])
					if (_DEBUG)		console.log('parent %s elevation %s; parent %s elevation %s', uv.parents[0], e1, uv.parents[1], e2);

					return Math.floor((e1 + e2) / 2);
				});
			});

			it('should be able to have elevations', function () {

				var elevation = _.pluck(planet.get_vertices(), 'elevation');
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

				planet.height_map();
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
						planet.get_vertices().length);
				}

				planet.get_vertices().length.should.eql(162);
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
	});
});