if (typeof module !== 'undefined') {
	var THREE = require('three');
	var humanize = require('humanize');
	var _ = require('underscore');
} else {
	var humanize = false;
}

function _ss(n, p) {
	if(_.isNumber(n)){
		n = humanize.numberFormat(n, 0);
	}
	while (n.length < p) {
		n = ' ' + n;
	}
	return n;
}
function _p(n) {
	var s = humanize.numberFormat(100 * n, 5);

	return _ss(s, 8);
}
function _p2(n) {
	var s = humanize.numberFormat(100 * n, 2);
	return _ss(s, 8);
}

function _n(n) {
	return humanize ? humanize.numberFormat(n, 2) : n;
}
if (!THREE.utils){
	THREE.utils = {};
}

THREE.utils.ss = _ss;
THREE.Vector3.prototype.toString = function (uv, spherical) {
	if (this.uv && uv) {
		return this.toString(false, spherical) + ':uv' + this.uv.toString();
	}

	if (spherical) {
		return '(' + [_p2(this.x), _p2(this.y), _p2(this.z)].join(',') + ')';
	}

	return '(' + [
		_n(this.x), _n(this.y), _n(this.z)
	].join(', ') + ')';

};
THREE.Vector2.prototype.toString = function () {
	return '(' + [
		_p2(this.x),
		_p2(this.y)
	].join(', ') + ')';
};

THREE.Vector2.prototype.closest = function (a, b) {
	var ad = a.distanceToSquared(this);
	if (!ad) return a;
	var bd = b.distanceToSquared(this);
	if (!bd) return b;
	return (ad < bd) ? a : b;
};

THREE.Vector2.prototype.toJSON = function () {
	return {
		x:      this.x,
		y:      this.y,
		id:     this.index,
		p:      this.parents,
		e:      this.elevation,
		n:      this.neighbors,
		en:     this.elevation_normalized,
		vertex: this.vertex.toJSON()
	};
};

THREE.Vector3.prototype.toJSON = function () {
	return {x: this.x, y: this.y, z: this.z}
};