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

module.exports = function (c, file, cb) {
	var out = fs.createWriteStream(file), stream = c.pngStream();

	stream.on('data', _.bind(out.write, out));
	stream.on('end', function () {
		process.nextTick(cb);
	});
} // end export function