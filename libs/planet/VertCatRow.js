if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
	var THREE = require('three');

	var vcc = require('./VertCatCol');
	VertCatCol = vcc.VertCatCol;
}



window.VertCatRow = (function () {
	var _DEBUG = false;
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
	 * A mid-level container of all points at a given latitude
	 * @param x: float -- the minimum x
	 * @param inc: float -- the distance between min_x and max_y
	 * @param root: Vertices -- the parent container
	 *
	 * There is a certain "fudge factor" at work here
	 * to include borderline hits, the contents_fudge contains points
	 * one increment away from the boundaries of the region
	 *
	 * @constructor
	 */

	function VertCatRow(y, inc, root) {
		this.cols = [];
		this.contents = [];
		this.contents_fudge = [];

		this.min_y = y;
		this.max_y = y + inc;

		this.min_y_fudge = this.min_y - inc;
		this.max_y_fudge = this.max_y + inc;

		this.inc = inc;
		this.root = root;

		this.get_points();

		this.make_cols();
	}

	VertCatRow.prototype = {
		toJSON: function(){
			return {
				min_y: this.min_y,
				max_y: this.max_y,
				cols: _.map(this.cols, function(c){ return c.toJSON(); })
			}
		},

		full_cols: function(){
			return _.filter(this.cols, function(col){
				return col.contents.length > 0;
			})
		},

		closest: function(point){
			if (_DEBUG) console.log('looking for column closest to ', point);
			var col = _.find(this.cols, function(col){
				return col.contains(point);
			});

			var out = col.closest(point);
			if (_DEBUG) console.log('found... ', out);
			return out;
		},

		closest_vector: function(point){
			return this._closest_cat_col(point).closest_vector(point);
		},

		_closest_cat_col: function(point){
			return _.reduce(this.cols, function(closest, col){
				if (!closest){
					return col.center();
				}

				return point.closest(col.center_point(), closest);

			}, null).col;
		},

		toString: function(){
			return util.format('<< VertCatRow %s (%s..%s) fudge(%s, %s) >>>',
			this.index, this.min_y, this.max_y, this.min_y_fudge, this.max_y_fudge
			)
		},

		get_points: function () {
			var vertices = this.root.vertices;

			this.contents_fudge = _.filter(vertices, this.contains_fudge, this);
		//	console.log('fudge: %s', this.contents_fudge);

			this.contents = _.filter(this.contents_fudge, this.contains, this);
			//console.log('contents: %s', this.contents);
		},

		make_cols: function () {
			var inc = this.inc;

			this.cols = _.map(
				_.range(-inc, 1 + inc, inc),
				function (y, j) {
					return new VertCatCol(y, inc, this, this.root);
				}, this);

		},

		contains_fudge: function (point) {
			return( (point.y >= this.min_y_fudge) &&
				(point.y < this.max_y_fudge) );
		},

		contains: function (point) {
			return( (point.y >= this.min_y) &&
				(point.y < this.max_y) );
		},

		/** ********************** Vector (3d) methods ********************* */

		/**
		 * returns the column whose CENTER is closest to the passed in vector
		 * @param point
		 * @returns {VertCatCol}
		 */
		closest_column_by_vector: function(vector){
			return _.reduce(this.full_cols(), function(closest, column){

				if (!closest){
					return column;
				}

				try {

					var co_center = column.center_vector();
					var cl_center = closest.center_vector();

					var co_dist = co_center.distanceToSquared(vector);
					var cl_dist = cl_center.distanceToSquared(vector);
				} catch(err) {
					console.log('closest_column_vector error: ', err);
					throw err;
				}

				if (co_dist > cl_dist){
					return closest;
				} else {
					return column;
				}

			}, null);
		}
	};
	return VertCatRow;
})();
