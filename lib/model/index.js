var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/geosphere');

/* -------------- EXPORT --------------- */
var Point = require('./Point')(mongoose);

module.exports = {
    Point: Point,
    close: function(cb){
        mongoose.connection.close(cb);
    }
};