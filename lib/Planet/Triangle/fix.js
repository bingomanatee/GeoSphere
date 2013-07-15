var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (t) {
	var ab = t.a.distanceToSquared(t.b);
	var bc = t.b.distanceToSquared(t.c);
	var ca = t.c.distanceToSquared(t.a);

	var distances = [
		{p: 'a', pt: t.a, others: [t.b, t.c], v: ab + ca},
		{p: 'b', pt: t.b, others: [t.a, t.c], v: ab + bc},
		{p: 'c', pt: t.c, others: [t.a, t.b], v: bc + ca}
	];

	var best_dist = _.sortBy(distances, 'v').pop();

	var mutants = [
		{x: 0, y: 0},
		{ x: 1, y: 0},
		{x: -1, y: 0},
		{x: 0, y: 1},
		{x: 0, y: -1}
	];

	var mutant_distances = _.map(mutants, function (m) {
		m.new_point = best_dist.pt.clone();
		m.new_point.add(m);
		m.v = _.reduce(best_dist.others, function (out, p) {
			return out + p.distanceToSquared(m.new_point);
		}, 0);

		return m;
	});

	var best_mutant = _.sortBy(mutant_distances, 'v').shift();
	t[best_dist.p] = best_mutant.new_point;

};