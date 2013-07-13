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

module.exports = function(index){
	var point = this.sphere.vertex(index);
	var neighbors = this.sphere.neighbors(index);
	var uvs, dimension = 'y';
	var dim_value = point.uv[dimension];

	if (dim_value < 0.1){
		uvs = _.pluck(neighbors, 'uv');
		var min = _.min(_.pluck(uvs, dimension));
		return min > dim_value;
	} else if (dim_value > 0.9){

		uvs = _.pluck(neighbors, 'uv');
		var max = _.max(_.pluck(uvs, dimension));
		return max < dim_value;
	} else {
		return false;
	}
};