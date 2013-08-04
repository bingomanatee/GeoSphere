var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var lis = require('line-input-stream');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: wrapper for line-input-stream
 */

function line_reader(file) {
    var stream = lis(fs.createReadStream(file, {encoding: 'utf8'}));
    stream.setEncoding("utf8");
    return stream;
}

/* -------------- EXPORT --------------- */

module.exports = line_reader;