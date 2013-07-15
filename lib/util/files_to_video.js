var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var video = require('video');

/* ************************************
 *  Video not working nicely - probably just going to use FCP
 * ************************************ */

/* ******* CLOSURE ********* */
var file_re = /.*([\d]+)\.([\d]+).bin/;

/* ********* EXPORTS ******** */

module.exports = function (dirname, cb) {
	fs.readdir(dirname, function (err, files) {

		var data = _.reduce(files, function (out, file) {
			if (file_re.test(file)) {
				var match = file_re.exec(file);

				var file_data = {
					file: path.resolve(dirname, file),
					day:  match[1],
					hour: match[2],
					index: parseInt(match[1]) + (parseInt(match[2])/24)
				};
				out.push(file_data);
			} else {
				return out;
			}

		}, []);

		data = _.sortBy(data, 'index');

	})
} // end export function