var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: to export a set of vertex data fields.
 * note - this isnt a file i/o method, but a data aggregation method.
 */

function export_vertex_data() {
    var fields = _.toArray(arguments);

    var data = [];

    this.vertices(function (v) {
        var out = {};
        fields.forEach(function (field) {
            out[field] = v.data(field);
        })
        data[v.index] = out;
    })
    return data;
}

/* -------------- EXPORT --------------- */

module.exports = export_vertex_data;