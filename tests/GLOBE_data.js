var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var reader = require('./../lib/util/GLOBE_data_reader.js');
var _DEBUG = false;
var Gate = require('gate');
/* *********************** TEST SCAFFOLDING ********************* */

/* ************************* TESTS ****************************** */

tap.test('reading index', {timeout: 200 * 1000}, function (t) {
	var index = new reader.Index(path.resolve(__dirname, './../GLOBE_data'));

	var gate = Gate.create();
	index.tiles.forEach(function (tile) {
		tile.draw({
				inc:  50,
				file: path.resolve(__dirname, './../GLOBE_data', tile.tile.toLowerCase() + '.png')
			}
			, gate.latch())
	})

	gate.await(function () {
		t.end();
	})
}); // end tap.test 1

tap.test('range of data', {timeout: 200 * 1000},  function (t) {
	var gate = Gate.create();

	var index = new reader.Index(path.resolve(__dirname, './../GLOBE_data'));
	index.tiles.forEach(function (tile) {
		var l = gate.latch();
		tile.range(function(err, min, max){
			t.equal(min, tile.e_min, ' of tile ' + tile.tile + ' min should be ' + tile.e_min);
			t.equal(max, tile.e_max, ' of tile ' + tile.tile + ' max should be ' + tile.e_max);
			l();
		})
	})

	gate.await(function(){
		t.end();
	})
}) // end tap.test 2

	 