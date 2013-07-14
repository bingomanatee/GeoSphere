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
	var write_cache = [];
	var writable = true;
	file = file.replace(/^.*\.out/, '');

	stream.on('data', function (data) {
		if (_DEBUG) console.log('recieved data for %s', file);
		if (writable) {
			write_cache.push(data);
			drain();
		} else {
			if (_DEBUG) console.log('buffering...');
			write_cache.push(data);
		}
	});

	function drain(force) {
		if (_DEBUG) console.log('draining %s', file);
		do {
			writable = out.write(write_cache.shift());
			if (_DEBUG) console.log('written data for %s', file);
		} while ((force || writable) && write_cache.length);
	}

	function empty() {
		if (write_cache.length) {
			out.write(write_cache.shift());
			process.nextTick(empty);
		} else {
			if (_DEBUG) console.log('end - no leftover data for %s', file);
			process.nextTick(cb);
		}
	}

	stream.on('drain', drain);

	stream.on('end', function () {
		process.nextTick(empty)
	});
} // end export function