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


		this.rows = [];
		this.categorize(inc);
	}

	/**
	 *
	 * @type {{point_in_rect: Function, _init_point_in_face: Function, point_in_face: Function}}
	 */

	Vertices.prototype = {

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

		closest_vector: function(point){

			var cc = this.closest_column();

			return cc.closest_vector(point);

		},

		closest_row: function(point){

			var row = _.find(this.rows, function(row){
				return row.min_y <= point.y && row.max_y > point.y;
			})

			if (!row){
<<<<<<< HEAD
				console.log('cannot find row for ', point);
=======
				console.log('cannot find closest_row for ', point);
>>>>>>> work on grey scale /vertex map
			}
			return row;

		},

		closest_column: function(point){
			return _.reduce(this.rows, function(closest, row){

				var row_cc = row.closest_column(point);
				if (!closest) return row_cc;

				var rcc_center = row_cc.center();
				var closest_center = closest.center();

				if (rcc_center.distanceSq() < closest_center.distanceSq()){
					return row_cc;
				} else {
					return closest;
				}
			});
		},

		closest_x_y: function(x, y){
			return this.closest(new THREE.Vector2(x, y));
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

			if (_DEBUGSUB || 1){
				console.log('looking for closest in row %s, %s', row.min_y, row.max_y);
			}

			return row.closest(point);
		}
	};

	return Vertices;
})();
