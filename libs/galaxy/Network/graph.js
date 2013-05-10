/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Network_Node = require('./Node');
	var util = require('util');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Network) {
	GALAXY._prototypes.Network = {};
}

/**
 * links points into a parent_network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.graph = (function () {

	var color_template = _.template('rgb(<%= r %>, <%= g %>, <%= b %>)');

	function arrow(ctx,p1,p2,size, color){
		ctx.save();
		if (color instanceof THREE.Color){
			color = color_template(color);
		}
		ctx.fillStyle = color;

		var points = edges(ctx,p1,p2);
		if (points.length < 2) return
		p1 = points[0], p2=points[points.length-1];

		// Rotate the context to point along the path
		var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
		ctx.translate(p2.x,p2.y);
		ctx.rotate(Math.atan2(dy,dx));

		// line
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(0,0);

		// this hack makes the line "squiggly" so you can see overlapping lines
		_.range(0, -len, Math.max(-2, -len/4)).forEach(function(l){
			ctx.lineTo(l,(3 * Math.random()) - 1.5);
		});
		// ending up at the ultimate destination for sure
		ctx.lineTo(-len, 0);

		ctx.closePath();
		ctx.stroke();

		// arrowhead
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(-size,-size);
		ctx.lineTo(-size, size);
		ctx.closePath();
		ctx.fill();

		ctx.restore();
	}

	function canvas_uv(node, width, height){
		var p1 = node.uv.clone();
		p1.x *= width;
		p1.y *= height;
		return p1;
	}

	function graph(width, height, canvas, colors) {
		var ctx = canvas.getContext('2d');
		this.each(function(node){
			var p1 = canvas_uv(node, width, height);
			node.children.forEach(function(child){
				var p2 = canvas_uv(child);
				arrow(ctx, p1, p2, 2, colors[node.index % colors.length]);
			})
		});
	}

	return graph;
})();