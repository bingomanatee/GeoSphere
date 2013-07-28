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

module.exports = function (index, as_index, key) {
	if(_.isObject(index)){
		index = index.index;
	}
	var nears = this.near[index];
	if (as_index) return nears;

	return _.map(nears, function(index){
		var out = {
			index: index
		};

		out.value = this.vertex_data(index, key);
		out[key] = out.value;

		return out;
	}, this)
} // end export function