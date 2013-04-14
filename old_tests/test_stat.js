/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('underscore');
var Stat = require('./../../libs/planet/Stat').Stat;
var chai = require('chai');

if (_.isFunction(chai.should)) {
	chai.should();
}
var _DEBUG = 0;

describe('Stat', function () {

	it('should know the average of a sequence', function(){
		Stat.mean([1,2,3,4,5]).should.eql(3);
	})

	it('should know a standard deviation', function(){
		var std1 = 1.4142135623730951;
		Stat.stdev([1,2,3,4,5]).should.eql(std1);
	});

	it('should be able to kick outliers', function(){
		var pop = [1,2,3, 7, 10, 11, 12];

		var qpop = Stat.q(pop);

		qpop.should.eql([1,2,3,10,11,12]);

		var pop2 = [140.68, 233.76, 731.09, 233.76];
		var qpop2 = Stat.q(pop2);

		qpop2.should.eql([140.68,233.76,233.76]);

	})


});