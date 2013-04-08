if (typeof module !== 'undefined') {
	var window = module.exports = {};
	var _ = require('underscore');
	var util = require('util');
	var Vertices = require('./Vertices').Vertices;
	var Canvas = require('canvas');
	var document = false;
	var Stat = require('./Stat').Stat;
	var humanize = require('humanize');
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
			var increment = 0.1 / this.recursions;
			increment = Math.max(0.025, increment);

			this.vertices = new Vertices(this.iso, increment);
		},

		load_texture: function (texture) {
			var loader = new THREE.TextureLoader();
			loader.crossDomain = true;x
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

		toJSON: function(){
			var out = {
				index: this.vertices.toJSON()
			};
			return out;
		},

		get_uvs: function () {
			return this.vertices.vertices;
		},

		get_neighbor_uvs: function(uv){
			return _.map(uv.neighbors, function(n_index){
				return this.get_uv(n_index);
			}, this)
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
		set_elevation: function (seed_function, tween_function, post_each_function) {
			this.alter(function (vertex, planet, detail) {
				if (detail == 1) {
					vertex.elevation = seed_function(vertex, planet);
				} else {
					vertex.elevation = tween_function(vertex, planet, detail);
				}
			}, true, post_each_function);
		},

		vertices_by_detail: function () {
			var vertices = _.groupBy(this.get_uvs(), 'detail');

			var vertices_by_detail = _.map(vertices, function (verts, detail) {
				return {vertices: verts, detail: parseInt(detail)};
			});

			return _.sortBy(vertices_by_detail, 'detail');
		},

		alter: function (filter, in_depth_order, post) {
			var planet = this;
		//	console.log('alerting %s', util.inspect(planet, false, 0));
			if (in_depth_order) {

				var vertices_by_detail = this.vertices_by_detail();

				_.each(vertices_by_detail, function (vbd) {
					_.each(vbd.vertices, function (vertex) {
						filter(vertex, this, vbd.detail);
					}, this);
				}, this);

				if (post){
					post.call(planet);
				}
			} else {
				_.each(this.get_uvs(), filter, this);
			}
		},

		normalize_elevations: function () {
			var elevations = _.pluck(this.get_uvs(), 'elevation');

			var max = _.max(elevations, _.identity);
			var min = _.min(elevations, _.identity);
			var extent = 1.66;

			console.log('absolute max: %s, min: %s', max, min);
			var mean = Stat.mean(elevations);
			var stdev = Stat.stdev(elevations, mean);
			min = Math.max(min, mean - (extent * stdev));
			max = Math.min(max, mean + (extent * stdev));

			//	console.log('max: %s, min: %s, samples: %s', max, min, elevations.length);

			//	console.log('min outliers: %s', _.filter(elevations, function(e){
			//		return e < min}).length);
			//	console.log('max outliers: %s', _.filter(elevations, function(e){
			//		return e > max}).length);

			var spread = max - min;

			_.each(this.get_uvs(), function (uv) {
				uv.elevation_normalized = Math.max(0, Math.min(1, ((uv.elevation - min) / spread)));
			})

		},

		render_data: function (params, cb) {
			var delay = Math.max(1200, this.resolution * 250 + 500);
			if (params.render_basis == 'node') {
				var canvas = this.render_node_canvas_data(params);
				if (params.file) {
					var fs = require('fs');
					var canvasBuffer = canvas.toBuffer();
					fs.writeFileSync(params.file, canvasBuffer);
					if (cb) cb();
				}
			} else {
				return this.render_dom_canvas_data(params);
			}
		},

		uv_to_xy: function (uv, w, h) {
			return new THREE.Vector2(uv.x * w, uv.y * h);
		},

		uv_distance: function (uv1, uv2, w, h) {
			var p1 = this.uv_to_xy(uv1, w, h);
			var p2 = this.uv_to_xy(uv2, w, h);
			var distance = p1.distanceTo(p2);
			if (_DEBUG) {
				console.log('basis: %s, %s,  distance between %s and %s: (%s,%s and %s,%s): %s', w, h, uv1, uv2,
					Math.round(p1.x), Math.round(p1.y),
					Math.round(p2.x), Math.round(p2.y),
					humanize.numberFormat(distance, 2)
				);
			}

			return distance;
		},

		render_node_canvas_data: function (params) {
			_.each(this.get_uvs(), function (uv) {
				uv.draw_center = this.uv_to_xy(uv, w, h);
				uv.draw_color = params.color_map(uv);
			}, this);

			var h = params.height;
			var w = params.width;
			var canvas = new Canvas(w, h);
			var ctx = canvas.getContext('2d');

			/*
			console.log('rendering a canvas as %s, %s', params.width, params.height);
			var planet = this;
			var base =  0.5 + Math.sqrt(this.recursions);

			function average_distance(uv) {
				var distances = _.map(uv.neighbors, function (neighbor) {
					var n_uv = this.get_uv(neighbor);
					var distance = this.uv_distance(uv, n_uv, w, h);
					if (_DEBUG) console.log('distance from %s to %s/ %s: ..... %s', uv, neighbor, n_uv, humanize.numberFormat(distance, 2));
					return distance;
				}, planet);
				if (_DEBUG) console.log('raw distances: ', _.map(distances,function (d) { return humanize.numberFormat(d, 2) }).join(', '));
				distances = Stat.qa(distances);
				if (_DEBUG) console.log('q distances: ', _.map(distances,function (d) { return humanize.numberFormat(d, 2)}).join(', '));
				return Stat.mean(distances);
			}

			ctx.fillStyle = 'red';
			ctx.beginPath();

			var centerX = canvas.width / 2;
			var centerY = canvas.height / 2;
			var radius = 70;

			ctx.fillStyle = 'rgb(128,128,128)';
			ctx.beginPath()
			ctx.rect(-1, -1, canvas.width + 2, canvas.height + 2);
			ctx.closePath();
			ctx.fill();

			function _arcs(x, y, distance) {

				_.each([x, x - canvas.width, x + canvas.width], function (cx) {
					_.each([y, y - canvas.height, y + canvas.height ], function (cy) {
						ctx.beginPath();
						ctx.arc(cx, cy, distance, 0, Math.PI * 2);
						ctx.closePath();
						ctx.fill();
					})
				});
			}

			_.each(this.get_uvs(), function (uv) {
				uv.draw_center = this.uv_to_xy(uv, w, h);
				uv.draw_distance =  average_distance(uv, w, h);
				uv.draw_color = params.color_map(uv);
			}, this);

			var draw_distances = _.pluck(this.get_uvs(), 'draw_distance');
			var qadd = Stat.qa(draw_distances);
			var max_distance = Stat.mean(qadd) + Stat.stdev(qadd);

			_.each(this.get_uvs(), function(uv){
				uv.draw_distance = Math.min(max_distance, uv.draw_distance);
			});

			/**
			 * draw midpoints
			 *

			_.each(this.get_uvs(), function (uv) {
				var center = uv.draw_center;
				var distance = uv.draw_distance / base;
				var color = uv.draw_color;

				_.each(this.get_neighbor_uvs(uv), function(n_uv){
					var center = uv.clone().add(n_uv).divideScalar(2);
					var midpoint = this.uv_to_xy(center, w, h);
				//	console.log('n_uv: %s', util.inspect(n_uv));

					midpoint.elevation_normalized = (
						uv.elevation_normalized + n_uv.elevation_normalized )/2;
					var color = params.color_map(midpoint);
					if (false) console.log('drawing midpoint %s, %s, color: %s', midpoint.x, midpoint.y, util.inspect(color));
					ctx.fillStyle  = util.format('rgba(%s, %s, %s,, 1)',
						Math.floor(color[0]), Math.floor(color[1]), Math.floor(color[2]));
					_arcs(midpoint.x, midpoint.y, distance);
				}, this);
			}, this);


			if (false) _.each(this.get_uvs(), function (uv) {
				var center = uv.draw_center;
				var distance = uv.draw_distance;
				var color = uv.draw_color;

				ctx.fillStyle  = util.format('rgba(%s, %s, %s, 0.5)',
					Math.floor(color[0]), Math.floor(color[1]), Math.floor(color[2]));

				_arcs(center.x, center.y, distance / Math.sqrt(Math.sqrt(base)));
			}, this);

			if (false) _.each(this.get_uvs(), function (uv) {
				var center = uv.draw_center;
				var distance = uv.draw_distance;
				var color = uv.draw_color;
				ctx.fillStyle  = util.format('rgba(%s,%s,%s,0.6)', Math.floor(color[0]), Math.floor(color[1]), Math.floor(color[2]));
				_arcs(center.x, center.y, distance / Math.sqrt(base));
			}, this);

			/**
			 * darkest, center discs
			 *
			_.each(this.get_uvs(), function (uv) {
				var center = uv.draw_center;
				var distance = uv.draw_distance;
				var color = uv.draw_color;
				ctx.fillStyle  = util.format('rgba(%s,%s,%s,1)', Math.floor(color[0]), Math.floor(color[1]), Math.floor(color[2]));
				_arcs(center.x, center.y, distance / base);
			}, this);

			// clean up draw data
			_.each(this.get_uvs(), function(uv){
				delete uv.draw_center;
				delete uv.draw_distance;
				delete uv.draw_color;
			}); */

			_.each(_.range(0, w), function(x){
				_.each(_.range(0, h), function(y){
					var uv = new THREE.Vector2(x / w, y/h);
					var close_uv = this.vertices.closest(uv);
					var color = close_uv.draw_color;

					ctx.fillStyle  = util.format('rgba(%s, %s, %s,, 1)',
						Math.floor(color[0]), Math.floor(color[1]), Math.floor(color[2]));

					ctx.beginPath();
					ctx.rect(x, y, 1, 1);
					ctx.closePath();
					ctx.fill();
				}, this);
			}, this);

			return canvas;
		}
	};

	return Planet;
})
	();