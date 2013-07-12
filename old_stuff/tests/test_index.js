/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var Planet = require('./../libs/galaxy/Planet');
var chai = require('chai');
var humanize = require('humanize');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = false;
var _DATA = true;
var QUICK_DEPTH = 1;
var COMP_DEPTH = 4;
var STRESS_DEPTH = 4;
var RANGE_INCREMENT_SHORT = 2, RANGE_SHORT_MIN = -5, RANGE_SHORT_MAX = 5;
var RANGE_MIN = -2, RANGE_MAX = 2, RANGE_INCREMENT = 0.5;
var RANGE2_MIN = -2, RANGE2_MAX = 2, RANGE2_INCREMENT = .5;

describe('GALAXY.Planet', function () {
	describe('inspecting planet depth 1', function () {

		var planet;

		before(function () {
			planet = new Planet();
			planet.init_iso(1);
		});

		it ('should have vertex indexes', function(){
			console.log("\n");
			planet.sectors.forEach(function(sector){
				console.log('sector: %s, detail %s _________', sector.id, sector.detail);
				console.log('  vertices: %s', util.inspect(sector.vertices));
				console.log('  vertices_at: ' );
				sector.vertices_at.forEach(function(vert_group, i){
					console.log('   detail: %s, vertices: %s', i, vert_group);
				});
				console.log('  children_at:');
				sector.children_at.forEach(function(children, i){
					console.log('    detail: %s, childern: %s', i, _.pluck(children, 'id'))
				})

			})

		})

	})
	describe.only('inspecting planet depth 2', function () {

		var planet;

		before(function () {
			planet = new Planet();
			planet.init_iso(2);
		});

		it ('should have vertex indexes', function(){
			console.log("\n");
			planet.sectors.forEach(function(sector){
				console.log('sector: %s, detail %s _________', sector.id, sector.detail);
				console.log('  vertices: %s', util.inspect(sector.vertices));
				console.log('  vertices_at: ' );
				sector.vertices_at.forEach(function(vert_group, i){
					console.log('   detail: %s, vertices: %s', i, vert_group);
				});
				console.log('  children_at:');
				sector.children_at.forEach(function(children, i){
					console.log('    detail: %s, childern: %s', i, _.pluck(children, 'id'))
				})

			})

		})

	})
})