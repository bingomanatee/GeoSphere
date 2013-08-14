var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Gate = require('gate');

var ITER_COUNT = 500;

function point(mongoose) {
    var schema = new mongoose.Schema(require('./Sector.json'));

    var Sector = mongoose.model('sector', schema);

    return Sector;
}

module.exports = point;