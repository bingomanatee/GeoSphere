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

module.exports = function (vector) {
	return Math.atan2(-vector.y, Math.sqrt(( vector.x * vector.x ) + ( vector.z * vector.z )));
}