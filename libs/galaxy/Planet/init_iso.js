/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes){
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * creates the isosphere that is the basis of the planet
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.init_iso = function (depth) {
	if (!depth){
		depth = this.options.depth || 0;
	}

	this.iso = new THREE.IcosahedronGeometry(1, depth);
	this.options.depth = depth;

	this.iso.uv_heritage = function(uv, by_depth){
		if (_.isNumber(uv)){
			uv = this.vertices[uv].uv;
		}

		var self = this;
		var parents = uv.parents ? uv.parents.slice(0): [];
		var subparents = [];
		_.each(parents, function(index){
			subparents = subparents.concat(this.uv_heritage(index));
		}, this);
		parents = parents.concat(subparents);
		parents = _.sortBy(parents, _.identity);
		parents = _.uniq(parents, true);
		if (by_depth){
			parents = _.reduce(parents, function(out, index){
				var duv = this.vertices[index].uv;
				var depth = duv.detail  || 0;

				if(!out[depth]){
					out[depth] = [];
				}

				out[depth].push(index);
				return out;
			}, [], this);
		}

		return parents;
	}

};