var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/**
 * a polymorphic function for dealing with vertex data.
 *
 * -- with no arguments returns a copy of the array of vertices.
 * -- with one argument, if true, returns the indexes of the vertices for iterative operations
 *                       if a function, maps the vertices through the function
 *                       if false, returns an array of vertices.
 * -- with two arguments if read_only ? returns the master array of vertices for faster operation.
 *
 * @param as_index {Boolean | Function}
 * @param read_only {Boolean} Optional; if true returns the primary array of vertices
 *      for faster/more memory conservative activity. Musn't call array altering methods on this!
 *
 * @returns {[Vector3|int]}
 */
function vertices(as_index, read_only) {
    if (as_index) {
        if (_.isFunction(as_index)) {
            return this.iso.vertices.map(as_index, this);
        } else {
            return  _.pluck(this.iso.vertices, 'index');
        }
    }
    else {
        return read_only ? this.iso.vertices : this.iso.vertices.slice();
    }
}

/* -------------- EXPORT --------------- */

module.exports = vertices;