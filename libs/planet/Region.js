if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
}
var _DEBUG = false;

window.Region = (function () {

	/**
	 * Regions are "uv" based;  that is, they
	 * calculate based on the lat/lon of a given face.
	 *
	 * @param face: THREE.Face3;
	 * @param iso: Three.Isocahedron
	 *
	 * @constructor
	 */

	function Region(face, iso) {
		this.face = face;
		this.a = iso.vertices[face.a].uv;
		this.b = iso.vertices[face.b].uv;
		this.c = iso.vertices[face.c].uv;

		this.vertices = [face.a, face.b, face.c];
		this.points = [this.a, this.b, this.c];

		this.rect = {
			top:    _.max(this.points,function (uv) { return uv.y; }).y,
			bottom: _.min(this.points,function (uv) { return uv.y; }).y,
			right:  _.max(this.points,function (uv) { return uv.x; }).x,
			left:   _.min(this.points,function (uv) { return uv.x; }).x
		}
	}

	function dot(v1, v2) {
		//return(vect1[0]*vect2[0] + vect1[1]*vect2[1]);
		return v1.x * v2.x + v1.y * v2.y;
	}

	/**
	 *
	 * @type {{point_in_rect: Function, _init_point_in_face: Function, point_in_face: Function}}
	 */

	Region.prototype = {

		point_in_rect: function (p) {
			var pir = true;
			if ((p.x < this.rect.left) || (p.x > this.rect.right) || (p.y < this.rect.bottom) || (p.y > this.rect.top)) {
				pir = false;
			}
			if (_DEBUG) {
				console.log('point_in_rect: %s, %s  in %s: %s', p.x, p.y, util.inspect(this.rect), pir ? 'YES' : 'NO');
			}
			return pir;
		},

		_init_point_in_face: function () {
			this.baf = true;
			this.ref = {};

			this.ref.bax = (this.b.x - this.a.x);
			this.ref.bay = (this.b.y - this.a.y);
			this.ref.cax = (this.c.x - this.a.x);
			this.ref.cay = (this.c.y - this.a.y);
			this.ref.cbx = (this.c.x - this.b.x);
			this.ref.cby = (this.c.y - this.b.y);

			this.ref.area = Math.abs(this.a.x * this.ref.bay + this.b.x * this.ref.cay + this.c.x * this.ref.bay) / 2;
			this.ref.v0 = this.c.clone().sub(this.a); 
			this.ref.v1 = this.b.clone().sub(this.a); 
		},

		point_in_face: function (point) {
			if (!this.point_in_rect(point)) return false;
			if (!this.baf) {
				this._init_point_in_face();
			}

			// Compute vectors
			/*
			 v0[0] = t3[0] - t1[0];
			 v0[1] = t3[1] - t1[1];

			 v1[0] = t2[0] - t1[0];
			 v1[1] = t2[1] - t1[1];

			 v2[0] = point[0] - t1[0];
			 v2[1] = point[1] - t1[1];
			 */

			var v2 = point.clone().sub(this.a);

			if (_DEBUG) {
				console.log('======= this.ref.v0: %s', util.inspect(this.ref.v0));
				console.log('======= this.ref.v1: %s', util.inspect(this.ref.v1));
				console.log('======= v2: %s', util.inspect(v2));
			}

			// Compute dot products
			var dot00 =this.ref.v0.dot(this.ref.v0); // dot(this.ref.v0, this.ref.v0);
			var dot01 =this.ref.v0.dot(this.ref.v1)// dot(this.ref.v0, this.ref.v1);
			var dot02 =this.ref.v0.dot(v2) //dot(this.ref.v0, v2);
			var dot11 =this.ref.v1.dot(this.ref.v1) //dot(this.ref.v1, this.ref.v1);
			var dot12 =this.ref.v1.dot(v2); // dot(this.ref.v1, v2);

			// Compute barycentric coordinates
			var invDenom =  (dot00 * dot11 - dot01 * dot01);
			var u = (dot11 * dot02 - dot01 * dot12) / invDenom;
			var v = (dot00 * dot12 - dot01 * dot02) / invDenom;
			if (_DEBUG )	console.log('point: (%s, %s), u: %s, v: %s', point.x, point.y, u, v);

			// Check if point is in triangle
			return (u >= 0) && (v >= 0) && (u + v <= 1);
		}
	};

	return Region;
}());
