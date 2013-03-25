if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
	var THREE = require('three');
}

var _DEBUGSUB = false;
var _DEBUG = 0;

function Vertex(point, iso) {
	this.point = point;
	this.iso = iso;
	this.value = 0;
	this.color = new THREE.Color().setRGB(0, 0, 0);
}

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

	THREE.Vector2.prototype.closest = function(a, b){
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

	function Vertices(iso) {
		if (_DEBUG > 1) console.log('new Vertices with iso %s,', util.inspect(iso));
		this.iso = iso;
		this.vertices = [];
		this.min = new THREE.Vector2(0, 0);
		this.max = new THREE.Vector2(1, 1);

		this.vertices = iso.vertices.slice(0)
	}

	/**
	 *
	 * @type {{point_in_rect: Function, _init_point_in_face: Function, point_in_face: Function}}
	 */

	Vertices.prototype = {

		points_near: function (point) {
			if (!this.categories) return this.vertices.slice(0);
			var ptCluster = this.categories.points_near(point);
			if (_DEBUG) console.log('points near %s: %s', util.inspect(point), util.inspect(ptCluster));
			if (ptCluster) {
				return ptCluster;
			}
			return [];
		},

		categorize: function (maxVertices) {
			this.categories = new VertexClusters(this, this.min, this.max);
			this.categories.subdivide(maxVertices);
		},

		point_near: function (point, brute_force) {
			var pts;
			if (brute_force){
			//	console.log('bf - slicing')
				 pts = this.vertices.slice(0);
			} else {
				 pts = this.points_near(point);
			//	console.log('qf: comparing %s points', pts.length);
			}

			return _.reduce(pts, function(o, p){
				if (!o) return p;
				return point.closest(o, p);
			}, null)

		}
	};

	/**
	 * VertexClusters is a fractal container of vertexes that hold vertexes and clusters them
	 * in quadrants based on location.
	 *
	 * The clusters subidivide as fine as necessary to produce quadrants that contian no more than "n"
	 * elements to produce quadrants that are easily comparable.
	 *
	 * @param root
	 * @param min
	 * @param max
	 * @constructor
	 */
	function VertexClusters(root, min, max) {
		if (_DEBUG > 1) {
			console.log('<<< new VertexClusters with min %s, max %s',
				util.inspect(min),
				util.inspect(max)
			);
		}

		this.id = ++vci;

		this.min = min ? min : root.min.clone();
		this.max = max ? max : root.max.clone();
		this.center = this.max.clone().add(this.min).divideScalar(2);
		this.root = root;

		this.vertices = root.vertices.slice(0);
		if (_DEBUG > 1) console.log(' ... with %s vertices >>>', this.vertices.length);
		this.filter();
	}

	var vci = 0;

	VertexClusters.prototype = {

		filter: function () {
			this.vertices = _.filter(this.vertices, function (v) {
				if (v.x < this.min.x) return false;
				if (v.y < this.min.y) return false;
				if (v.x > this.max.x) return false;
				if (v.y > this.max.y) return false;
				return true;
			}, this);
		},

		nonempty: function () {
			if (this.vertices.length) {
				return this;
			}
			return this.root.nonempty();
		},

		/**
		 * returns the most granular subquadrant that contains a given point.
		 * @param point
		 * @returns {*}
		 */
		quadrants_with_point: function (point) {
			var pts = point.toString();
			if (!(point instanceof THREE.Vector2)) {
				throw new Error('bad point passed to qwp: ' + pts);
			}

			if (pts.length > 12) throw new Error('bad point ' + pts);

			if (_DEBUG) console.log('finding points near %s,%s', point.x, point.y);
			if (_DEBUG) console.log('    in %s', util.inspect(this));

			if (!this.contains(point)) {
				return [];
			}

			if (this.quadrants) {
				var subquadrants = _.filter(this.quadrants, function (quadrant) {
					return quadrant.contains(point);
				})

				return _.map(subquadrants, function (quad) {
					if (quad.quadrants) {
						return quad.quadrants_with_point(point);
					}
					return quad.nonempty();
				})

			} else {
				return [this];
			}
		},

		idString: function () {
			if (this.root.idString) {
				return this.root.idString() + ',' + this.id;
			} else {
				return this.id;
			}
		},

		toString: function () {
			return util.format('[%s ... %s]: id %s, (%s verts, %s subquads) w %s, h %s %s',
				this.min.toString(),
				this.max.toString(),
				this.idString(),
				this.vertices.length,
				this.quadrants ? this.quadrants.length : 0,
				_p(this.max.x - this.min.x),
				_p(this.max.y - this.min.y),
				"\n" + this.vString()
			);
		},

		vString: function () {
			return util.format('[%s]', _.map(this.vertices,function (v) {
				return v.toString()
			}).join(', '));
		},

		points_near: function (point) {
			var quads = this.quadrants_with_point(point);

			function _q(list) {
				if (_.isArray(list)) {
					return util.format("<< quads [[ %s ]] >>\n",
						_.map(list, _q).join(",\n")
					);
				} else {
					return list.toString();
				}
			}

			if (_DEBUG > 2) {
				console.log("______ quadrants with point: ____________ \n\n %s \n\n ___________",
					_q(quads));
			}

			var pts = _.flatten(_.pluck(_.flatten(quads), 'vertices'));
			return _.uniq(pts);
		},

		contains: function (point) {
			if (!point instanceof THREE.Vector2) throw new Error('bad point passed to qwp: %s', util.inspect(point));

			var out = true;
			if ((point.x < this.min.x)
				|| (point.y < this.min.y)
				|| (point.x > this.max.x)
				|| (point.y > this.max.y)) {
				out = false;
			}

			var pts = point.toString();
			if (pts.length > 12) throw new Error('bad point %s', pts);
			if (_DEBUG > 2)    console.log('point %s contained by %s : %s', pts, this.toString(), out ? 'YES' : 'no')

			return out;
		},

		subdivide: function (maxVertices) {
			if (this.vertices.length <= maxVertices) return;
			if (_DEBUGSUB) {
				console.log("subdividing \n========== \n %s \n =============== \n because it has more than  %s vertices",
					this.toString(), maxVertices);
			}

			var q1 = new VertexClusters(this, this.min, this.center);
			q1.subdivide(maxVertices);

			var q2 = new VertexClusters(this, this.center, this.max);
			q2.subdivide(maxVertices);

			var m1 = new THREE.Vector2(this.center.x, this.min.y);
			var m2 = new THREE.Vector2(this.max.x, this.center.y);
			var q3 = new VertexClusters(this, m1, m2);
			q3.subdivide(maxVertices);

			m1 = new THREE.Vector2(this.min.x, this.center.y);
			m2 = new THREE.Vector2(this.center.x, this.max.y);
			var q4 = new VertexClusters(this, m1, m2);
			q4.subdivide(maxVertices);

			this.quadrants = [q1, q2, q3, q4];

			if (_DEBUGSUB) {
				console.log(' >>>>>> subdivided %s into %s', this.toString(),
					_.map(this.quadrants,function (q) {
						return q.toString()
					}).join("\n -------- \n")

				)
			}
		}
	};

	return Vertices;
})();
