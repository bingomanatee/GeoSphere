if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
	var THREE = require('three');
	var r = require('./VertCatRow');
	VertCatRow = r.VertCatRow;
}

var _DEBUGSUB = 0;
var _DEBUG = 0;

/**
 * Vertex is a collection of points optimized for search
 *
 * @param point
 * @param iso
 * @constructor
 */

window.Vertices = (function () {

	function _p(n) {
		return Math.floor(100 * n);
	}

	THREE.Vector2.prototype.toString = function () {
		return util.format('(%s, %s)',
			_p(this.x),
			_p(this.y)
		)
	};

	THREE.Vector2.prototype.closest = function (a, b) {
		var ad = a.distanceToSquared(this);
		if (!ad) return a;
		var bd = b.distanceToSquared(this);
		if (!bd) return b;
		return (ad < bd) ? a : b;
	};

	/**
	 * Vertexes are collections of points
	 * with solutions for mappign points to a 2D canvas.
	 *
	 * @param iso: Three.Isocahedron
	 *
	 * @constructor
	 */

	function Vertices(iso, inc) {
		if (_DEBUG > 1) console.log('new Vertices with iso %s,', util.inspect(iso));
		this.iso = iso;
		this.inc = inc || 0.1;

		this.min = new THREE.Vector2(0, 0);
		this.max = new THREE.Vector2(1, 1);

		this.vertices = iso.vertices.slice(0);
		this.rows = [];
		this.categorize(inc);
	}

	/**
	 *
	 * @type {{point_in_rect: Function, _init_point_in_face: Function, point_in_face: Function}}
	 */

	Vertices.prototype = {

		categorize: function (inc) {
			//@TODO: seed poles, edges
			if (!inc){ inc = this.inc;	}
			if (inc > 1) inc = 1 / inc;
			var index = 0;
			this.rows = _.map(_.range(-inc, 1 + inc, inc), function (x) {
				var vcr = new VertCatRow(x, inc, this);
				vcr.index = index;
				++index;
				return vcr;
			}, this)

			if (_DEBUG) console.log('categorizing inc %s; %s rows', inc, this.rows.length);
		},

		closest_row: function(point){

			var index = Math.floor(1 + point.y / this.inc); // add 1 because we have a "gutter row" outside the bounds
			index = Math.min(this.rows.length - 1, Math.max(0, index));
			var row;
			var i_match = false;

			do {

				row = this.rows[index];
				if (row.min_y > point.y) {
					if (_DEBUGSUB){
						console.log('index: %s, row.min_y (%s) > %s; decrementing', index, row.min_y, point);
					}
					--index;
				} else if (row.max_y < point.y){
					if (_DEBUGSUB){
						console.log('index: %s, row.max_y (%s) < %s; incrementing', index,  row.min_y, point);
					}
					++index;
				} else {
					i_match = true;
				}

			} while (!i_match);

			return row;

		},

		closest: function (point, brute_force) {
			//@TODO: sanitize poles, edges

			if (brute_force){
				return _.reduce(this.vertices, function(o, p){
					if (!o){
						return p;
					} else {
						return point.closest(o, p);
					}
				}, null);
			}

			var row = this.closest_row(point);

			if (_DEBUGSUB){
				console.log('looking for closest in row %s, %s', row.min_y, row.max_y);
			}

			return row.closest(point);
		}
	};

	return Vertices;
})();
