if (typeof module !== 'undefined') {
	var THREE = require('three');
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

THREE.Vector2.prototype.toJSON = function () {
	return {
		x:                    this.x,
		y:                    this.y,
		id:                this.index,
		p:              this.parents,
		e:            this.elevation,
		n:             this.neighbors,
		en: this.elevation_normalized,
		vertex:               this.vertex.toJSON()
	};
};

THREE.Vector3.prototype.toJSON = function () {
	return {x: this.x, y: this.y, z: this.z}
};