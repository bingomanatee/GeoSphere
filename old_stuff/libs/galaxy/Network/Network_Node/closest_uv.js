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

GALAXY._prototypes.Network_Node.closest_uv = function (uv) {

if (_DEBUG)	console.log('****************** finding near uv: %s', uv);

	var iterate = false;
	var nearest = this;
	var tested_indexes = {};
	var tests = 0;
	this.network._cardinal_uvs.forEach(function(c){
		tested_indexes[c.index] = true;
		++tests;
	});
	var loops = 0;
	do {
		var distance = nearest.uv.distanceToSquared(uv);

		var list = nearest.near_nodes;
		var ns = list.length;
		iterate = false;

		++loops;
		if (_DEBUG) console.log("WHILE testing UV %s loop %s  \n        against %s: \n        near %s \n      ----------- ",
			uv, loops,
			this, list.join("\n"));

		for (var i = 0; (!iterate) && (i < ns); ++i) {
	//		console.log('cycle %s', i);

			var candidate = list[i];
			if(!tested_indexes[candidate.index]){
				++tests;
				tested_indexes[candidate.index] = true;
				var near_distance = candidate.uv.distanceToSquared(uv);
				if (near_distance < distance) {
				//	console.log('test %s nearer candidate %s found ', tests, nearest);
					nearest = candidate;
					distance = near_distance;
					iterate = true;
				} else {
				//	console.log('candidate %s is too far',candidate);
				}
			} else {
			//	console.log('skipping candidate %s - already tested', candidate);
			}
		}

	//	console.log('done iterating - iterate = %s, nearest = %s', iterate ? 'TRUE' : 'FALSE', nearest);
	}  while( (iterate));

//	console.log(' -------------- nearest: %s; tests: %s of %s', nearest.uv, tests, this.network.node_list.length);
	return nearest;
};