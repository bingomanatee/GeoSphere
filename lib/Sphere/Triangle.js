var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/** ************************************
 * A triangle represents a facet of the sphere,
 * defined by UV coordinates.
 * ************************************ */

/* ******* CLOSURE ********* */

/**
 *
 *  note = because the UV space "wraps" like an asteroid screen,
 *  each point exists at x +/- N , y += M, where N and M are arbitrary integers.
 *  So the Fix moves the farthest point to the nearest "alias" (+/-1 or 0)
 *  that put it closest to its partners.
 * @param t {Triangle}
 * @private
 */

function _fix(t) {
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
		m.v = _.reduce(best_dist.others, function(out, p){
			return out + p.distanceToSquared(m.new_point);
		}, 0);

		return m;
	});

	var best_mutant = _.sortBy(mutant_distances, 'v').shift();
	t[best_dist.p] = best_mutant.new_point;

}

/**
 *
 * @param a {Vector2}
 * @param b {Vector2}
 * @param c {Vector2}
 * @constructor
 */

function Triangle(a, b, c) {
	this.a = a.clone();
	this.b = b.clone();
	this.c = c.clone();

	_fix(this);
}

var _t = _.template('Triangle (<%= a %>, <%= b %>, <%= c %>)');

Triangle.prototype = {

	max_x: function(){
		return Math.max(this.a.x, this.b.x, this.c.x);
	},

	perimiterSquared: function () {
		return this.a.distanceToSquared(this.b) + this.b.distanceToSquared(this.c) + this.c.distanceToSquared(this.a);
	},

	toString: function () {
		return _t(this);
	},

	clone: function () {
		return new Triangle(this.a, this.b, this.c);
	},

	offset: function (x, y) {
		this.a.x += x;
		this.a.y += y;
		this.b.x += x;
		this.b.y += y;
		this.c.x += x;
		this.c.y += y;
		return this;
	}

};

/* ********* EXPORTS ******** */

module.exports = Triangle;