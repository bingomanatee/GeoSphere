/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var THREE = require('three');
var c = require('./../../libs/planet/VertCatCol.js');
var chai = require('chai');
if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = 0;

describe('VertCatCol', function () {

	var vcc;
	var y = 0.2;
	var inc = 0.1;

	var row = {
		contents_fudge: _.map(_.range(0, 20, 1),
			function (p) {
				return new THREE.Vector2(p / 40, p / 40);
			})
	};

//	console.log('rows: %s', util.inspect(row));

	before(function () {
		vcc = new c.VertCatCol(y, inc, row, {});
	//	console.log('vcc: %s', util.inspect(vcc));
	});

	it('should have min_y', function(){
		vcc.min_y.should.eql(y);
	});

	it('should have max_y', function(){
		vcc.max_y.should.eql(y + inc )
	});

	it('should have min_y', function(){
		vcc.min_y_fudge.should.eql(y - inc);
	});

	it('should have max_y', function(){
		vcc.max_y_fudge.should.eql(y + 2 *inc )
	});

	it('#contains', function () {
		vcc.contents.should.eql(
			[
				{ x: 0.2, y: 0.2 },
				{ x: 0.225, y: 0.225 },
				{ x: 0.25, y: 0.25 },
				{ x: 0.275, y: 0.275 },
				{ x: 0.3, y: 0.3 }
			]

		);
		vcc.contents_fudge.should.eql(
			[
				{ x: 0.1, y: 0.1 },
				{ x: 0.125, y: 0.125 },
				{ x: 0.15, y: 0.15 },
				{ x: 0.175, y: 0.175 },
				{ x: 0.2, y: 0.2 },
				{ x: 0.225, y: 0.225 },
				{ x: 0.25, y: 0.25 },
				{ x: 0.275, y: 0.275 },
				{ x: 0.3, y: 0.3 },
				{ x: 0.325, y: 0.325 },
				{ x: 0.35, y: 0.35 },
				{ x: 0.375, y: 0.375 }
			]

		);
	});

	it('#closest', function(){
		var  test_point = new THREE.Vector2(0.225, 0.225);

		var closest = vcc.closest(test_point);

		closest.should.eql(test_point);

		var  test_point2 = new THREE.Vector2(0.2255, 0.225);

		var closest2 = vcc.closest(test_point2);
		closest2.should.eql(closest);
	});
});