var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var THREE = require('three');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var _v3 = _.template('V3(<%= Math.round(100 * x) %>, <%= Math.round(100 * y) %>, <%= Math.round(100 * z) %>)');

var _ordinals = [];
[-1, 0, 1].forEach(function (x) {
	[-1, 0, 1].forEach(function (y) {
		[-1, 0, 1].forEach(function (z) {
			if (x || y || z) {
				_ordinals.push(new THREE.Vector3(x, y, z));
			}
		})
	})
});

function make_ordinals(sphere) {
	sphere._ordinals = _.reduce(sphere.vertices(), function (out, v) {
		if (!out.length) {
			return [v, v, v, v, v, v, v, v];
		} else {
			_.each(out, function (old, i) {
				if (v.distanceToSquared(_ordinals[i]) < out[i].distanceToSquared(_ordinals[i])) {
					out[i] = v;
				}
			});
		}
		return out;
	}, [])
}

/* ********* EXPORTS ******** */

module.exports = function (pt, y, z) {
	if (_.isNumber(pt)){
		pt = new THREE.Vector3(pt, y, z);
	}

	if (!this._ordinals) {
		make_ordinals(this);
	}

	if (_DEBUG) console.log('closest_point trying to find point closest to %s', _v3(pt));

	var closest = _.reduce(this._ordinals, function (closest, ordinal) {
		if (!closest) {
			return ordinal;
		} else if (pt.distanceToSquared(ordinal) < pt.distanceToSquared(closest)) {
			return ordinal;
		} else {
			return closest;
		}
	}, null);

	if (_DEBUG) console.log( ' ... ordinal is %s', _v3(closest));

	var checked = {}; // a record of checked indices to reduce redundant checks;

	var checks = 0;

	do {

		if (_DEBUG) console.log( '........... CHECK %s', ++checks);
		var i = closest.index;
		var closest_distance = closest.distanceToSquared(pt);

		var neighbors = this.neighbors(i);

		var closer = _.find(neighbors, function (n) {
			if (checked[n.index]) {
				return false;
			}
			checked[n.index] = true;
			var c_distance = n.distanceToSquared(pt);

			if (_DEBUG) console.log('examining neighbor %s, distance %s against base %s distance %s', _v3(n), c_distance, _v3(closest), closest_distance);
			return c_distance < closest_distance;
		});

		if (closer) {
			if (_DEBUG) console.log(' ... new closer found -- %s; still looping', _v3(closer));
			closest = closer;
		} else {
			if (_DEBUG) console.log( '.... NO closer point found')
		}

	} while (closer);
	return closest;

}; // end export function