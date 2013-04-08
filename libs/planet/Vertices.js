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

		this.load_vertices();
		this.load_neighbors();
		this.set_value();
		this.set_power();


		this.rows = [];
		this.categorize(inc);
	}

	/**
	 *
	 * @type {{point_in_rect: Function, _init_point_in_face: Function, point_in_face: Function}}
	 */

	Vertices.prototype = {

		set_power: function(level){
			if (!level){
				level = 1;
				for (var i = 0; i < 12; ++i){
					this.vertices[i].power = level;
				}
			}

			var points_at_level = _.filter(this.vertices, function(){

			})
		},

		set_value: function(){
			_.each(this.vertices, function(v){
				v.grey = Math.random();
			})

			_.each(this.vertices, function(v){
				var n_greys = [];
				_.each(v.neighbors, function(n){
					var vn = this.vertices[n];
					n_greys.push(vn.grey);
				}, this);
				v.ngrey = _.reduce(n_greys, function(o, grey){
					return o + grey;
				}, 0)
				v.ngrey /= n_greys.length;

			}, this);
		},

		load_neighbors: function(){
			_.each(this.iso.faces, function(face){
				var indexes = [face.a, face.b, face.c];

				_.each(indexes, function(i){
					_.each(indexes, function(n){
						if (i != n){
							var v = this.vertices[i];
							if (!v.neighbors){
								v.neighbors = [n];
							} else {
								v.neighbors.push(n);
							}
						}
					}, this);
				}, this);
			}, this)

			_.each(this.vertices, function(v){
				v.neighbors = _.uniq(v.neighbors);
			})
		},

		toJSON: function(){
			return {
				inc: this.inc,
				iso_vertices: this.vertices.length,
				rows: _.map(this.rows, function(r){
					return r.toJSON();
				})
			}
		},

		load_vertices: function(){
			this.vertices = _.map(this.iso.vertices, function(v, i){
				v.uv.index = i;
				v.uv.vertex = v;
				return v.uv;
			})
		},

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

		/** ******************** CLOSEST VECTOR (3d) ********************** */

		/**
		 * returns the closest 3D vector to the input point
		 * @param vector {Vector3} a 3D point in space. Does not have to be on the planet...
		 * @returns {*}
		 */
		closest_vector: function(vector){
			var cc = this.closest_column_vector(vector);
			return cc.closest_vector(vector);
		},

		/**
		 * goes through each row and finds the closest column to the passed in vector.
		 * Then reduces each rows' closest column to find the column closest to that vector
		 * @param vector {Vector3} a 3D point in space. Does not have to be on the planet...
		 * @returns {*}
		 */
		closest_column_vector: function(vector){
			return _.reduce(this.rows, function(closest, row){

				var row_cc = row.closest_column_by_vector(vector);
				if (!closest) return row_cc;

				var rcc_center = row_cc.center_vector();
				var closest_center = closest.center_vector();

				if (rcc_center.distanceToSquared(vector) < closest_center.distanceToSquared(vector)){
					return row_cc;
				} else {
					return closest;
				}
			}, null );
		},

		/** ********************** CLOSEST UV ********************** */

		closest_row: function(point){

			var row = _.find(this.rows, function(row){
				return row.min_y <= point.y && row.max_y > point.y;
			})

			if (!row){
				console.log('cannot find closest_row for ', point);
			}
			return row;

		},

		/**
		 * a two-argument interface to closest.
		 *
		 * @param x: float(0..1)
		 * @param y: float(0..1)
		 *
		 * @returns {Vector2}
		 */
		closest_x_y: function(x, y){
			return this.closest(new THREE.Vector2(x, y));
		},

		/**
		 * this gives you the point closest to a Vector2 (UV 0..1, 0..1) coordinate
		 *
		 * @param point: Vector2 (UV 0..1, 0..1) a UV coordinate
		 * @param brute_force: boolean whether to use the bins to find the point fast or
		 *                     just test EVERY point. Brute force is slightly (< 0.1%) more accurate
		 *                     but is twice as slow.
		 * @returns Vector2 - a UV point, with metadata.
		 */
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
			if (!row) {
				return this.closest(point, true);
			}

			if (_DEBUGSUB){
				console.log('looking for closest in row %s, %s', row.min_y, row.max_y);
			}

			var closest = row.closest(point);
			if (!closest){
				return this.closest(point,true);
			} else {
				return closest;
			}
		}
	};

	return Vertices;
})();
