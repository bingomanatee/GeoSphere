var _ = require('underscore');
var path = require('path');
var fs = require('fs');

var min_depth = 0;
var max_depth = 4;
var width = 720;
var height = 360;

mode = process.argv[2];

if (!mode) throw new Error('must pass mode.');

if (process.argv.length > 4) {

    min_depth = parseInt(process.argv[3]);
    max_depth = parseInt(process.argv[4]);

    if (process.argv.length > 5) {
        width = parseInt(process.argv[5]);
        height = parseInt(process.argv[6]);
    }
}

console.log('writing couch data for %s: depths %s ... %s, %s px x %s px images', mode, min_depth, max_depth, width, height)

require('./lib/couchbase/' + mode)(function () {
    console.log('done with couch data for %s', mode);
}, min_depth, max_depth, width, height);
