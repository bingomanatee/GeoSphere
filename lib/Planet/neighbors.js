var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (index, asNumbers) {
	if(_.isObject(index)){
		index = index.index;
	}
	var nears = this.near[index];
	if (asNumbers) return nears;

	return _.map(nears, function(index){
		return this.iso.vertices[index];
	}, this)
} // end export function