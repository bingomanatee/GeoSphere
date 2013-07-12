/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var Planet = require('./../libs/galaxy/Planet');
var chai = require('chai');
var humanize = require('humanize');
var fs = require('fs');
var path = require('path');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;
var _DATA = true;
var JSON_ROOT = path.resolve(__dirname, './../../test_resources/planetJSON');

describe('GALAXY.Planet', function () {
	describe('JSON', function () {

		_.range(0, 4).forEach(function (depth) {

			describe("#save_JSON", function () {

				var planet;

				before(function () {
					planet = new Planet();
					planet.init_iso(depth);
					//planet.make_index();
				});

				it('should be able to save a planet', function (done) {
					var file_path = path.resolve(JSON_ROOT, util.format('planet_depth_%s_save.min.json', depth));
					console.log(file_path);
					planet.save_JSON(file_path, done);
				})

				it('should be able to save a planet - pretty', function (done) {
					var file_path = path.resolve(JSON_ROOT, util.format('planet_depth_%s_save.json', depth));
					console.log(file_path);
					planet.save_JSON(file_path, done, 3);
				})

			});

		})

	})

	_.range(0, 8).forEach(function (depth) {

		describe('binary ' + depth, function () {
			var planet;

			before(function () {
				planet = new Planet();
				planet.init_iso(depth);
				//planet.make_index();
			});

			describe('#save_binary', function () {

				it('should be able to save coordinates of planet as binary data', function (done) {
					var file_path = path.resolve(JSON_ROOT, util.format('planet_depth_%s_iso.bin', depth));
					planet.save_binary(file_path, done);
				})

				it('should be able to save sectors of planet as binary data', function (done) {
					var file_path = path.resolve(JSON_ROOT, util.format('planet_depth_%s_sectors.bin', depth));

					planet.save_sector_binary(file_path, done);
				})

			});

		})

	})

	describe('#load_sector_binary', function () {

		var planet;
		var sector_path;
		var vector_path;

		_.range(0, 8).forEach(function (depth) {

			describe('load ' + depth, function () {
				before(function () {

					planet = new Planet();
					planet.init_iso(depth);

					sector_path = path.resolve(JSON_ROOT, util.format('planet_depth_%s_sectors.bin', depth));
					vector_path = path.resolve(JSON_ROOT, util.format('planet_depth_%s_iso.bin', depth));

				})

				it('should be able to load sectors', function (done) {
					planet.load_sectors_binary(sector_path, function () {
						planet.sectors.length.should.eql(planet.iso.sectors.length);
						planet.sectors.forEach(function (sector, i) {
							var ps = planet.iso.sectors[i];
							delete ps.planet;
							delete sector.planet;
							try {

								sector.id.should.eql(ps.id);
								sector.parent.should.eql(ps.parent);
								sector.detail.should.eql(ps.detail);
								sector.vertices.should.eql(ps.vertices);
							} catch (err) {
								console.log('sector mismatch: %s', util.inspect(sector), util.inspect(ps));
								console.log(err);
							}
							;
						});

						planet.sectors_by_detail.forEach(function (sectors, detail) {
							console.log('detail: %s, sectors: %s', detail, sectors.length);
						});
						done();
					})
				})

				it('should be able to load vertices', function (done) {
					planet.load_vertices_binary(vector_path, function () {
						//	console.log('sectors: %s', util.format(planet.sectors));

						planet.vertices.length.should.eql(planet.iso.vertices.length);
						planet.vertices.forEach(function (vertex, i) {
							var iv = planet.iso.vertices[i];
							//console.log('vertex: %s, iso_vertex %s', vertex, iv);
							var distance = iv.distanceTo(vertex);
							//	console.log('distance: %s', humanize.numberFormat(distance, 10));
							distance.should.be.below(0.00001);

						});
						done();
					})
				})
			})
		})

	})

})