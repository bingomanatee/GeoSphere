var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var ll_to_vector3 = require('./../util/lat_lon_to_Vector3')

/* ************************************
 * This method pushes data into the nearest vertex to passed in
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (lat, lon, field, value, meta) {

    var point = ll_to_vector3(lat, lon);
  if (_DEBUG)  console.log('ll2v lat: %s, lon: %s, point %s, value %s',
        lat, lon, point.toString(), value);

    var nearest = this.closest_point(point);
    if (meta) {
        this.vertex_data_push(nearest.index, field, {lat: lat, lon: lon, x: point.x, y: point.y, z: point.z, value: value})
    } else {
        this.vertex_data_push(nearest.index, field, value);
    }
    return nearest;
}; // end export function