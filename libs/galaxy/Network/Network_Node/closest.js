/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Network_Node) {
	GALAXY._prototypes.Network_Node = {};
}

/**
 * links points into a network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network_Node.closest = function (point, startTime) {

	var iterate = false;
	var nearest = this;
	var tested_indexes = {};
	var tests = 0;
	this.network._cardinal_vertices.forEach(function (c) {
		tested_indexes[c.index] = true;
		++tests;
	});
	var loops = 0;

	if (_DEBUG) console.log('finding point closest to %s from node %s', point, this);
	do {

		var distance = nearest.vertex.distanceToSquared(point);

		var list = nearest.near_nodes;
		var ns = list.length;
		iterate = false;

		++loops;
		if (_DEBUG) {
			console.log("WHILE testing POINT %s loop %s  \n        against %s: \n        near %s \n distance %s \n     ----------- ",
				point
				, loops
				, this
				, list.join("\n")
				, distance
			);
		}

		for (var i = 0; (!iterate) && (i < ns); ++i) {
			//		console.log('cycle %s', i);

			var candidate = list[i];
			if (!tested_indexes[candidate.index]) {
				++tests;
				tested_indexes[candidate.index] = true;
				if(!candidate.vertex){
					throw new Error(util.format('cannot find vertex of %s', util.inspect(candidate)))
				}
				var near_distance = candidate.vertex.distanceToSquared(point);
				if (near_distance < distance) {
					if (_DEBUG)    console.log('test %s nearer candidate %s found ', tests, nearest);
					nearest = candidate;
					distance = near_distance;
					iterate = true;
				} else {
					if (_DEBUG)    console.log('candidate %s is too far', candidate);
				}
			} else {
				if (_DEBUG)    console.log('skipping candidate %s - already tested', candidate);
			}
		}

		if (_DEBUG) console.log('done iterating - iterate = %s, nearest = %s', iterate ? 'TRUE' : 'FALSE', nearest);
	} while ((iterate));

	// console.log(' -------------- nearest vector : %s; tests: %s of %s', nearest.uv, tests, this.network.node_list.length);
	if (startTime) {
		var time = new Date().getTime() - startTime;
		if (time) console.log('execution time: ', time);
	}
	return nearest;
};