if (typeof module !== 'undefined') {
	var THREE = require('three');
	var humanize = require('humanize');
} else {
	var humanize = false;
}

function _p(n) {
	return humanize.numberFormat(100 * n, 5);
}

function _n(n){
	return humanize ? humanize.numberFormat(n, 4) : n;
}

THREE.Vector3.prototype.toString = function (uv) {
	if (this.uv && uv){
		return this.toString() + ':uv' + this.uv.toString();
	}

	return '(' + [
		_n(this.x),
		_n(this.y),
		_n(this.z)
	].join(', ') + ')';

};
THREE.Vector2.prototype.toString = function () {
	return '(' + [
		_p(this.x),
		_p(this.y)
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