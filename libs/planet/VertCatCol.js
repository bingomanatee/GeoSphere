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

		center: function () {
			if (!this._center) {
				this._center = _.reduce(this.contents,
					function (center, pt) {
						center.add(pt);
						return center;
					}, new THREE.Vector3(0, 0, 0));
				this._center.divideScalar(this.content.length);
				this._center.col = this;
			}
			return this._center;
		},

		closest_vector: function (p) {
			return _.reduce(
				_.pluck(this.contents_fudge, 'vertex'),
				function (closest, pt) {
					if (!closest) { return pt; }
					return p.closest(pt, closest);
				}, null);
		},

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

		closest: function (point) {
			return _.reduce(this.contents_fudge, function (o, p) {
				if (!o) return p;

				return point.closest(o, p);
			}, null);
		},

		populate: function () {
			this.contents_fudge = _.filter(this.row.contents_fudge, this.contains_fudge, this);
			this.contents = _.filter(this.contents_fudge, this.contains, this);
		},

		contains_fudge: function (point) {
			return(
				(point.x >= this.min_x_fudge) &&
					(point.x < this.max_x_fudge));
		},

		contains: function (point, fudge) {

			return(
				(point.x >= this.min_x) &&
					(point.x < this.max_x));
		}
	};

	return VertCatCol;
})();
