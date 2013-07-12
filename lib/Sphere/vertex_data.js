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

module.exports = function (index, field, value) {
	if (!this._vertex_data) {
		this._vertex_data = [];
	}
	if (!this._vertex_data[index]) {
		this._vertex_data[index] = {};
	}

	if (arguments.length > 2) {
		this._vertex_data[index][field] = value;
	}

	return this._vertex_data[index][field];
}; // end export function