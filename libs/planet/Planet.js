if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
	var Vertices = require('./Vertices').Vertices;
	var Canvas = require('canvas');
	var document = false;
	var Stat = require('./Stat').Stat;
}

var _DEBUG = false;

window.Planet = (function () {

	/**
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
			recursions = 0;
		}

		this.data_canvas_pixels_per_degree = 4;

		_.extend(this, params);
		this.data_canvas_width = Math.floor(360 * this.data_canvas_pixels_per_degree);
		this.data_canvas_height = Math.floor(this.data_canvas_width / 2);

		this.radius = radius;
		this.recursions = recursions;

		this.iso = new THREE.IcosahedronGeometry(radius, recursions);
		this.index_points();

		this.alter(function (uv) {
			uv.detail = uv.vertex.detail = recursions - uv.vertex.detail + 1;
		});

		this.iso.dynamic = true;

		this.create_datamap();

		if (this.image) {
			this.load_texture(this.image);
		}

	}

	Planet.prototype = {
		index_points: function () {
			this.vertices = new Vertices(this.iso);
		},

		load_texture: function (texture) {
			var loader = new THREE.TextureLoader();
			loader.crossDomain = true;
			loader.addEventListener('load', _.bind(this.make_mesh, this));
			loader.load(texture);
		},

		create_datamap: function () {
			this.data_canvas = document ? document.createElement('canvas') : new Canvas(this.data_canvas_width, this.data_canvas_height)
			this.data_canvas.width = this.data_canvas_width;
			this.data_canvas.height = this.data_canvas_height;
			this.draw_data();
		},

		draw_data: function () {
			_.each(this.vertices.vertices, function (uv) {
				var c = new THREE.Color(uv.x, uv.y, 1);
				var h = c.getHex(c);

				var center = new THREE.Vector2(
					this.data_canvas_width * uv.x,
					this.data_canvas_height * uv.y
				);

			}, this);
		},

		make_mesh: function (data) {
			this.mesh = THREE.SceneUtils.createMultiMaterialObject(this.iso, this.make_materials(data));
			if (this.scene) {
				this.scene.add(this.mesh);
			}
		},

		make_materials: function (data) {
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

		get_uvs: function () {
			return this.vertices.vertices;
		},

		get_uv: function (index) {
			return this.vertices.vertices[index]
		},

		get_elevation: function (index) {
			return this.get_uv(index).elevation;
		},

		/**
		 * Note - elevation is ADDITIVE to the mean planetary radius;
		 *
		 * @param seed_function {function} executes over the 12 top level points
		 * @param tween_function {function} executes over each sucessie levels;
		 */
		set_elevation: function (seed_function, tween_function) {
			this.alter(function (vertex, planet, detail) {
				if (detail == 1) {
					vertex.elevation = seed_function(vertex, planet);
				} else {
					vertex.elevation = tween_function(vertex, planet, detail);
				}
			}, true);
		},

		vertices_by_detail: function () {
			var vertices = _.groupBy(this.get_uvs(), 'detail');

			var vertices_by_detail = _.map(vertices, function (verts, detail) {
				return {vertices: verts, detail: parseInt(detail)};
			});

			return _.sortBy(vertices_by_detail, 'detail');
		},

		alter: function (filter, in_depth_order) {
			if (in_depth_order) {

				var vertices_by_detail = this.vertices_by_detail();

				_.each(vertices_by_detail, function (vbd) {
					_.each(vbd.vertices, function (vertex) {
						filter(vertex, this, vbd.detail);
					}, this)
				}, this);
			} else {
				_.each(this.get_uvs(), filter, this);
			}
		},

		normalize_elevations: function(){
			var elevations = _.pluck(this.get_uvs(), 'elevation');

			var max = _.max(elevations, _.identity);
			var min = _.min(elevations, _.identity);
			var extent = 1.66;

			console.log('absolute max: %s, min: %s', max, min);
			var mean = Stat.mean(elevations);
			var stdev = Stat.stdev(elevations, mean);
			 min = Math.max(min, mean - (extent * stdev));
			max = Math.min(max, mean + (extent * stdev));

			console.log('max: %s, min: %s, samples: %s', max, min, elevations.length);

			console.log('min outliers: %s', _.filter(elevations, function(e){
				return e < min}).length);
			console.log('max outliers: %s', _.filter(elevations, function(e){
				return e > max}).length);

			var spread = max - min;
			
			_.each(this.get_uvs(), function(uv){
				uv.elevation_normalized = Math.max(0, math.min(1, ((uv.elevation - min)/spread)));
			})


		},

		height_map: function(){
			this.normalize_elevations();

			
		}

	};

	return Planet;
})
	();