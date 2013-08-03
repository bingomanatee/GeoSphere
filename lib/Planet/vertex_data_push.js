var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To push a series of data into a vertex's data
 */

function vertex_data_push(index, key, value) {
    var d = this.vertex_data(index, key);
    if (!_.isArray(d)){
        d = [value];
        this.vertex_data(index, key, d);
    } else {
        d.push(value);
    }
    return d;
}

/* -------------- EXPORT --------------- */

module.exports = vertex_data_push;