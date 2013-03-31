

window.PlanetFilter = (function(){

	var PlanetFilter = function(iso, width, height, color_scale){
		var t = new Date().getTime();
		this.iso = iso;
		this.color_scale = color_scale;

		this.vertices = new Vertices(iso, 0.02);
	//	console.log('vertices creation: ', Math.round((new Date().getTime() - t)/1000));
	//	console.log('vertices JSON: ', this.vertices.toJSON());

		this.prepare_vertex_colors();

		this.prepare_image_index(width, height);
	};

	var p = PlanetFilter.prototype = new createjs.Filter();

	p.color_point = function(point, r, g, b){
		function _01(v){
			if ((!v) || (!isNaN(v))) return 0;
			return Math.max(0, Math.min(1, v));
		}

		var vector = this.vertices.closest_vector(point);
		var index = vector.uv.index;

		this.colors[index].setRGB(_01(r), _01(g), _01(b));

		return [vector, this.colors[index]];
	};

	p.prepare_vertex_colors = function(){

		this.colors = [];
		_.each(this.iso.vertices, function(v, i){
			this.colors.push(new THREE.Color().setRGB(Math.random(), Math.random(), Math.random()))
		}, this);

	};

	p.prepare_image_index = function(width, height){

		var l = width * height;

		console.log('prepare_image_index: ', width, height, l);

		this.point_indexes = _.map(_.range(0, l), function(){ return -1 });

		for (var index=0; index<l; ++index) {
			var point_x = index % width;
			var point_y = Math.floor(index/width);
			var px = point_x/width;
			var py = 1 - (point_y/height);

			var cp = this.vertices.closest_x_y(px, py);
			if(cp){
				if(!cp.image_indexes){
					cp.image_indexes = [];
				}
				cp.image_indexes.push(index);
				this.point_indexes[index] = cp.index;
			} else {
			 //	console.log('cannot find closest_x_y', px, py);
			}
		}
	};

	var refilters = 0;

	function interp(ref1, ref2, grey, index){
		var v1 = ref1.color[index];
		var v2 = ref2.color[index];
		var v1_dist = 1/Math.abs(ref1.grey - grey);
		var v2_dist = 1/Math.abs(ref2.grey - grey);

		return ((v1 * v1_dist) + (v2 * v2_dist)) / (v1_dist + v2_dist);
	}

	p.grey_to_color = function(grey){

		if (grey <= 0){
			return this.color_scale[0].color;
		} else if (grey >= 1){
			return _.last(this.color_scale).color;
		}

		return _.reduce(this.color_scale,
			function(out, scale){
				if (!out){
					return scale;
				}

				if (scale.grey <= grey && scale.grey > out.grey){
					return scale;
				} else {
					return out;
				}
			}
			, null).color;
	};

	/**
	 * Applies the filter to the specified context.
	 * @method applyFilter
	 * @param {CanvasRenderingContext2D} ctx The 2D context to use as the source.
	 * @param {Number} x The x position to use for the source rect.
	 * @param {Number} y The y position to use for the source rect.
	 * @param {Number} width The width to use for the source rect.
	 * @param {Number} height The height to use for the source rect.
	 * @param {CanvasRenderingContext2D} targetCtx Optional. The 2D context to draw the result to. Defaults to the context passed to ctx.
	 * @param {Number} targetX Optional. The x position to draw the result to. Defaults to the value passed to x.
	 * @param {Number} targetY Optional. The y position to draw the result to. Defaults to the value passed to y.
	 * @return {Boolean}
	 **/

	p.applyFilter = function(ctx, x, y, width, height, targetCtx, targetX, targetY) {
		var grey;
		targetCtx = targetCtx || ctx;
		if (targetX == null) { targetX = x; }
		if (targetY == null) { targetY = y; }
		try {
			var imageData = ctx.getImageData(x, y, width, height);
		} catch(e) {
			//if (!this.suppressCrossDomainErrors) throw new Error("unable to access local image data: " + e);
			console.log('cannot get local image data');
			return false;
		}
		var data = imageData.data;
		var l = data.length / 4;

		for (var index=0; index<l; ++index) {
			var offset = index * 4;
			var vert_index = this.point_indexes[index];
			if (vert_index == -1){
				 grey = 0;
			} else {

				var vert = this.vertices.vertices[vert_index];
				if (!vert){
					// console.log('cannot find vertex ', vert_index);
					 grey = 0;
				} else {
					 grey = vert.ngrey;
				}
			}

			var color = _.map(this.grey_to_color(grey), Math.floor);

			data[offset] = color[0];
			data[offset +1] = color[1];
			data[offset+2] =  color[2]
			data[offset+3] = 255

		}
		imageData.data = data;
		targetCtx.putImageData(imageData, targetX, targetY);
		++ refilters;
		return true;
	}

	return PlanetFilter;


})();