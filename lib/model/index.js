var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/geosphere2');

/* -------------- EXPORT --------------- */
var Point = require('./Point')(mongoose);
var Sector = require('./Sector')(mongoose);

module.exports = {
    Point: Point,
    Sector: Sector,
    close: function(cb){
        mongoose.connection.close(cb);
    }
};