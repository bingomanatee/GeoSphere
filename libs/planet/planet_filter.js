

window.PlanetFilter = (function(){

	var PlanetFilter = function(iso, width, height){
		var t = new Date().getTime();
		this.iso = iso;

		this.vertices = new Vertices(iso, 0.02);
		console.log('vertices creation: ', Math.round((new Date().getTime() - t)/1000));
		console.log('vertices JSON: ', this.vertices.toJSON());

		this.prepare_vertex_colors();

		this.prepare_image_index(width, height);
	};

	var p = PlanetFilter.prototype = new createjs.Filter();

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
				console.log('cannot find closest_x_y', px, py);
			}
		}
	}

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
			var vert = this.vertices.vertices[vert_index];
			if (!vert){
				console.log('cannot find vertex ', vert_index);
				var grey = 0;
			} else {
				var grey = vert.ngrey;
			}
		//	console.log('point ', point_x, ',', point_y, '; ', px, ',', py, 'closest', cp);
			data[offset] =  data[offset +1] = data[offset+2] =  Math.floor(grey * 255);
			data[offset+3] = 255

		}
		imageData.data = data;
		targetCtx.putImageData(imageData, targetX, targetY);
		return true;
	}

	return PlanetFilter;


})();