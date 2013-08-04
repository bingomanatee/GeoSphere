var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var THREE = require('three');

/* ------------ CLOSURE --------------- */

var DEG_TO_RAD = Math.PI / 180;

/** ********************
 * Purpose: To convert a lat/lon measure to a 3D point
 */

/**
 *
 * @param longit {number}
 * @param latit {number}
 * @param degrees {Boolean}
 * @param rad {number}
 * @returns {THREE.Vector3}
 */

function lat_lon_to_Vector3(lat, lon, degrees, rad) {
    var phi = degrees ? (lat) * Math.PI / 180 : lat;
    var theta = degrees ? (lon) * Math.PI / 180: lon;

    if (!rad) rad = 1;

    var x = -(rad) * Math.cos(phi) * Math.cos(theta);
    var y = -(rad) * Math.sin(phi);
    var z = (rad) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

/* -------------- EXPORT --------------- */

module.exports = lat_lon_to_Vector3;