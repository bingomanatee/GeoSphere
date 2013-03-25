/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var THREE = require('three');
var region = require('./../libs/planet/Region.js');
var chai = require('chai');
if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;

describe('Region', function(){

	describe('simple region', function () {

		var iso;
		var face;
		var r;

		before(function () {
			iso = {
				vertices: [
					{x: 1, y: 1, z: 0},
					{x: 4, y: 4, z: 0},
					{x: 1, y: 4, z: 0}
				]
			};

			function _uv(vertex) {
				vertex.uv = new THREE.Vector2(vertex.x / 8, vertex.y / 8);
			}

			_uv(iso.vertices[0]);
			_uv(iso.vertices[1]);
			_uv(iso.vertices[2]);

			face = {
				a: 0,
				b: 1,
				c: 2
			};

			r = new region.Region(face, iso);
			if (_DEBUG) console.log('region: %s', util.inspect(r));
		});

		it('should know that -1, -1 is outside triangle ', function () {
			// test way outside
			r.point_in_face({x: -1, y: -1}).should.eql(false);

		});

		it('should know that the center is inside triangle', function () {

			var center = r.a.clone();
			center.add(r.b);
			center.add(r.c);
			center.divideScalar(3);
			// test ul corner
			r.point_in_face(
				center
			).should.eql(true);

		});

		it('should know that a point ul of a is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.a.clone().sub({x:  0.001, y: 0.001})
			).should.eql(false);

		});

		it('should know that point a is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.a
			).should.eql(true);

		});

		it('should know that a point just inside of b is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.b.clone().sub({x: 0.001, y: 0.0002})
			).should.eql(true);

		});

		it('should know that a point just outside of b is outside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.b.clone().sub({x: 0.001, y: 0.002})
			).should.eql(false);

		});

		it('should know that point b is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.b
			).should.eql(true);

		});

		it('should know that point c is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.c
			).should.eql(true);

		});

	});

	describe('random region', function () {

		var iso;
		var face;
		var r;

		before(function () {
			iso = {
				vertices: [
					new THREE.Vector2(Math.random(), Math.random()),
					new THREE.Vector2(Math.random(), Math.random()),
					new THREE.Vector2(Math.random(), Math.random())
				]
			};

			function _uv(vertex) {
				vertex.uv = new THREE.Vector2(vertex.x / 8, vertex.y / 8);
			}

			_uv(iso.vertices[0]);
			_uv(iso.vertices[1]);
			_uv(iso.vertices[2]);

			face = {
				a: 0,
				b: 1,
				c: 2
			};

			r = new region.Region(face, iso);
			if (_DEBUG) console.log('region: %s', util.inspect(r));
		});

		it('should know that -1, -1 is outside triangle ', function () {
			// test way outside
			r.point_in_face({x: -1, y: -1}).should.eql(false);

		});

		it('should know that the center is inside triangle', function () {

			var center = r.a.clone();
			center.add(r.b);
			center.add(r.c);
			center.divideScalar(3);
			// test ul corner
			r.point_in_face(
				center
			).should.eql(true);

		});

		it('should know that point a is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.a
			).should.eql(true);

		});

		it('should know that point b is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.b
			).should.eql(true);

		});

		it('should know that point c is inside triangle', function () {

			// test ul corner
			r.point_in_face(
				r.c
			).should.eql(true);

		});

	});
})

//console.log('points: %s', util.inspect(vs));