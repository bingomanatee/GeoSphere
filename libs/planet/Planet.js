if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
}
var _DEBUG = false;

window.Planet = (function () {

	/**
	 * Note - to create the geometry for a planet,
	 * call load_texture with a terrain texture, OR
	 * set the color cells and call [[ function not written yet ]]
	 *
	 * @param radius
	 * @param recursions
	 * @constructor
	 */

	function Planet(radius, recursions, params) {

		this.pixels_per_degree = 4;

		if (!radius) {
			radius = 1;
		}
		if (!recursions) {
			recursions = 2;
		}

		_.extend(this, params);

		this.radius = radius;
		this.recursions = recursions;

		this.geometry = new THREE.IcosahedronGeometry(radius, recursions);
		geometry.dynamic = true;

		this.index_points();

	}

	Planet.prototype = {

		index_points: function () {

			var plato = new THREE.IcosahedronGeometry();

			this.regions = _.map(plato.faces, function (face) {
				return new Region(face, plato);
			})

		},

		load_texture: function (texture) {
			var loader = new THREE.TextureLoader();
			loader.crossDomain = true;
			loader.addEventListener('load', _.bind(this.make_mesh, this));
			loader.load(texture);
		},

		make_mesh: function (data) {
			this.mesh = THREE.SceneUtils.createMultiMaterialObject(this.geometry, this.make_materials(data));
		},

		make_materials: function () {
			return [
				new THREE.MeshLambertMaterial({
					map: data.content
				}),
				new THREE.MeshBasicMaterial({
					color:       0x000000,
					shading:     THREE.FlatShading,
					wireframe:   true,
					transparent: true })

			];
		},

		make_vertex_material: function () {
			return new THREE.MeshLambertMaterial({ color: 0xffffff / 2,
				shading:                                  THREE.FlatShading,
				vertexColors:                             THREE.VertexColors });
		}

	};

	return Planet;
})
	();