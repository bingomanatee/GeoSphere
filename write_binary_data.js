var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var Gate = require('gate');

var MIN_DEPTH = 0;
var MAX_DEPTH = 4;
var WIDTH = 720;
var HEIGHT = 360;

var mode = 'clouds';

if (process.argv.length > 2) {
    mode = process.argv[2];
    if (process.argv.length > 3) {

        MIN_DEPTH = parseInt(process.argv[3]);
        MAX_DEPTH = parseInt(process.argv[4]);

        if (process.argv.length > 5) {
            WIDTH = parseInt(process.argv[5]);
            HEIGHT = parseInt(process.argv[6]);
        }
    }
}

console.log('WRITING BINARY DATA for %s: depths %s ... %s, %s px X %s px images',  mode, MIN_DEPTH, MAX_DEPTH, WIDTH, HEIGHT)

require('./lib/binary/' + mode)(MIN_DEPTH, MAX_DEPTH, WIDTH, HEIGHT);
