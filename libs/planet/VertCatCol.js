if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
	var THREE = require('three');
}

THREE.Vector2.prototype.toString = function () {
	return util.format('(%s, %s)',
		_p(this.x),
		_p(this.y)
	)
};

THREE.Vector3.prototype.closest = THREE.Vector2.prototype.closest = function (a, b) {
	var ad = a.distanceToSquared(this);
	if (!ad) return a;
	var bd = b.distanceToSquared(this);
	if (!bd) return b;
	return (ad < bd) ? a : b;
};

window.VertCatCol = (function () {

	function VertCatCol(x, inc, row, root) {
		this.contents = [];
		this.contents_fudge = [];
		this.row = row;

		this.min_x = x;
		this.max_x = x + inc;

		this.min_x_fudge = this.min_x - inc;
		this.max_x_fudge = this.max_x + inc;

		this.inc = inc;
		this.root = root;

		this.populate();
	}

	VertCatCol.prototype = {

		toJSON: function () {
			function uvf(uv) {
				return uv.index;
			}

			return {
				min_x:          this.min_x,
				max_x:          this.max_x,
				contents_fudge: _.map(this.contents_fudge, uvf),
				contents:       _.map(this.contents, uvf)
			}
		},

		populate: function () {
			this.contents_fudge = _.filter(this.row.contents_fudge, this.contains_fudge, this);
			this.contents = _.filter(this.contents_fudge, this.contains, this);
		},

		/** ************** 2d calculation ******************* */

		/**
		 * Finds the mean 2D (uv) coordinate of the column.
		 * The assumption is made that all the points are relatively close --
		 * that is there is not a mix of points >0.9 x and <0.1 x
		 * @returns {THREE.Vector2}
		 */

		center_point: function(){
			if (!this._center_point){
				var center_vector = this.center_vector();

				var weighted_centers = _.map(this.contents, function(point){
					return [point.x, point.y, point.vector.distanceToSquared(center_vector)]
				})

				// because we will be dividing by the distance, we must test for an exact match.

				var exact_center = _.find(weighted_centers, function(w){
					return w[2] == 0;
				});
				if (exact_center){
					this._center_point = new THREE.Vector2(exact_center[0], exact_center[1]);
					return this._center_point;
				}


				weighted_centers = _.sortBy(weighted_centers, function(c){
					return c[2];
				});

				// only sample the closest half
				weighted_centers = weighted_centers.slice(0, Math.min(2,weighted_centers.length/2));

				// find the total weight of the measured points
				var weight = _.reduce(weighted_centers, function(out, weight){
					return out + 1/weight[2];
				} , 0);

				this._center_point = _.reduce(weighted_centers, function(out, point){
					out.x += weight * point[0]/point[2];
					out.y += weight * point[1]/point[2];
					return out;
				}, new THREE.Vector2(0,0));
			}

			return this._center_point;
		},

		/**
		 * returns the UV point that is closest to the passed in Vector2;
		 * @param point
		 * @returns {*}
		 */
		closest: function (point) {
			if (!point instanceof THREE.Vector2) {
				throw new Error('3D point passed in to closest; requires Vector2');
			}

			return _.reduce(this.contents_fudge, function (o, p) {
				if (!o) return p;

				return point.closest(o, p);
			}, null);
		},

		contains_fudge: function (point) {
			if (!point instanceof THREE.Vector2) {
				throw new Error('3D point passed in to contains_fudge; requires Vector2');
			}

			return(
				(point.x >= this.min_x_fudge) &&
					(point.x < this.max_x_fudge));
		},

		contains: function (point, fudge) {
			if (!point instanceof THREE.Vector2) {
				throw new Error('3D point passed in to contains; requires Vector2');
			}
			return(
				(point.x >= this.min_x) &&
					(point.x < this.max_x));
		},

		/** ***************** 3D calculation ******************** */

		closest_vector: function (vector) {
			if (!vector instanceof THREE.Vector3) {
				throw new Error('2D point passed in to closest_vector; requires Vector3');
			}
			return _.reduce(
				_.pluck(this.contents_fudge, 'vertex'),
				function (closest, pt) {
					if (!closest) { return pt; }
					return vector.closest(pt, closest);
				}, null);
		},

		/**
		 * Finds the 3D center of the column
		 * @returns {*}
		 */

		center_vector: function () {
			if (!this._center) {
				this._center = _.reduce(this.contents,
					function (center, pt) {
						center.add(pt.vertex);
						return center;
					}, new THREE.Vector3(0, 0, 0));

				this._center.divideScalar(this.contents.length);
				this._center.col = this;
			}
			return this._center;
		}
	};

	return VertCatCol;
})();
