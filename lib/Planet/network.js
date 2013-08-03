var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: Initializes the neighbors of each vertex
 */

function network() {
    this.near = [];
    this.iso.faces.forEach(function (face) {
        var points = [face.a, face.b, face.c];
        points.forEach(function (point) {
            if (!this.near[point]) {
                this.near[point] = [];
            }
            this.near[point].push(face.a, face.b, face.c);
        }, this);
    }, this);

    this.near = _.map(this.near, function (points, i) {
        return _.difference(_.uniq(points), [i]);
    })
}

/* -------------- EXPORT --------------- */

module.exports = network