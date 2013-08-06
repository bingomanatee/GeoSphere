var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Gate = require('gate');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (c, file, cb) {
	var out = fs.createWriteStream(file), stream = c.pngStream();
	var write_cache = [];
	var writable = true;

    out.on('finish', cb);
   stream.pipe(out)



	/*
	file = file.replace(/^.*\.out/, '');

	stream.on('data', function (data) {
		if (_DEBUG) console.log('received data for %s', file);
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
        var gate = Gate.create();
		while (write_cache.length) {
			out.write(write_cache.shift(), gate.latch());
		}

        gate.await(function(){
            stream.end();
        })
	}

    stream.on('finish', cb);
	stream.on('drain', drain);

	stream.on('end', empty);*/
} // end export function