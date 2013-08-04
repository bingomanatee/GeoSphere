var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

var line_reader = require('./../util/line_reader');
var assert = require('assert');
var Planet = require('./../Planet');

var _DEBUG = false;

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: A base class for climate modelling
 */

function Base(depth) {
    if (_.isObject(depth)) {
        this.planet = depth;
    } else {
        this.planet = new Planet(depth);
    }
}

Base.prototype = {

    median_planet_data: function(){
        var self = this;
        this.planet.vertices(function(vertex){
             var items = vertex.data(self.data_key) || [];

            var groups = _.groupBy(items, _.identity);
            var value = _.reduce(groups, function(out, items, key){
                if (!out || out.count < items.length){
                    return {
                        key: parseInt(key),
                        count: items.length
                    }
                } else {
                    return out;
                }
            }, {count: 0, key: null}).key;
         if (_DEBUG)   console.log('vertex %s %s: items %s, value: %s' ,
                vertex.index, self.data_key, util.inspect(items.slice(0, 4)), value);

            vertex.data(self.data_key, value);
        });
    },

    load_table_data: function (callback, file) {
        if (!this.title_rows) this.title_rows = 1;
        if (!this.delimiter) this.delimter = ',';

        if (!file) file = this.data_file;
        assert(fs.existsSync(file), 'data file exists: ' + file);

        var stream = line_reader(file);
        var self = this;
        var line = 0;
        var titles;

        stream.on('line', function (data) {
            if (self.title_rows && line < self.title_rows) {
                if (line == self.title_rows - 1) {
                    titles = data.split(self.delimter);
                }
            } else {
                // @TODO: mismatch testing
                self.line(_.object(titles, data.split(self.delimter)));
            }
            ++line;
        });

        stream.on('end', callback);
    }
};

/* -------------- EXPORT --------------- */

module.exports = Base;