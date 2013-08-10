var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

function point(mongoose) {
    var schema = new mongoose.Schema( require('./Point.json'));
    schema.index({'coords.x': 1, 'coords.y': 1, 'coords.z': 1});
    schema.index({'detail': 1, 'order': 1});
    schema.index('detail');
    schema.index('neighbors');
    schema.index('section');
    var Point = mongoose.model('point', schema);
    return Point;
}

module.exports = point;