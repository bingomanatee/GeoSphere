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

	var WHITE = new THREE.Color().setRGB(255, 255, 255);
	var BLACK = new THREE.Color().setRGB(0, 0, 0);

	function sqiggle_line(context, fx, fy, tx, ty) {
		var x = fx - tx;
		var y = fy - ty;
		var d = Math.sqrt((x * x) + (y * y));
		if (d > 20) {
			var mx = (fx + tx) / 2 + ((Math.random() * d/2) - d/4);
			var my = (fy + ty) / 2 + ((Math.random() * d/2) - d/4);
			sqiggle_line(context, fx, fy, mx, my);
			sqiggle_line(context, mx, my, tx, ty);
		} else {
			context.moveTo(fx, fy);
			context.lineTo(tx, ty);
		}
	}

	function canvas_arrow(context, fromx, fromy, tox, toy, close) {
		var headlen = 10;   // length of head in pixels
		var angle = Math.atan2(toy - fromy, tox - fromx);
		context.lineCap = 'round';

		sqiggle_line(context, fromx, fromy, tox, toy);
	/*	context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
		context.moveTo(tox, toy);
		context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
		if (close) {
			context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
		} */
	}

	function canvas_arrow_head(context, fromx, fromy, tox, toy, close) {
		var headlen = 10;   // length of head in pixels
		var angle = Math.atan2(toy - fromy, tox - fromx);
		context.lineCap = 'round';

		//sqiggle_line(context, fromx, fromy, tox, toy);
		context.moveTo(tox, toy);
		context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
		context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
		context.lineTo(tox, toy);
	}

	function canvas_uv(node, width, height) {
		var p1 = node.vertex.uv.clone();
		p1.x *= width;
		p1.y *= height;
		return p1;
	}

	var color_template = _.template('rgb(<%= r %>,<%= g %>, <%= b %>)');

	var text_template_children = _.template("<%= index %> c <%= children.length %>");
	var text_template_parents = _.template("<%= index %> p <%= parents.length %>");

	function arrow(ctx, p1, p2, width, color, close) {

		if (p1.distanceTo(p2) > 4000) {
			return;
		}
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = color.getStyle();
		ctx.lineWidth = width;
		canvas_arrow(ctx, p1.x, p1.y, p2.x, p2.y, close);
		ctx.stroke();
		ctx.restore();
		ctx.save();
		ctx.globalAlpha = 0.8;
		canvas_arrow_head(ctx, p1.x, p1.y, p2.x, p2.y, close);
		ctx.strokeStyle = 'none';
		ctx.fillStyle = color.getStyle();
		ctx.fill();
		ctx.restore();
	}

	function graph(width, height, canvas, colors, draw_parents, draw_children) {
		var ctx = canvas.getContext('2d');
		ctx.font = '14px Arial';
		ctx.fillStyle = 'rgb(0,0,0)';
		GALAXY.util.bg_color(ctx, width, height, draw_parents ? WHITE : BLACK);

		function can_draw_kids(draw_children, node){
			return draw_children && ((!_.isFunction(draw_children)) || draw_children(node));
		}

		this.each(function (node, i) {
			if (_DEBUG) console.log('node %s of %s', i, this.node_list.length);
			var p1 = canvas_uv(node, width, height);
			if (_DEBUG) console.log('node %s', node);
			var color = colors[node.index % colors.length];


			if (draw_children) {
				if (can_draw_kids(draw_children, node)){
					var w = (node.children.length > 12) ? 1 : node.children.length > 6 ? 4 : 8;
					ctx.globalAlpha = 1 / Math.sqrt(w);
					node.children.forEach(function (child, i) {
						if (_DEBUG)    console.log('linking child %s of %s with color %s', i, node.children.length, color.getStyle());
						var p2 = canvas_uv(child, width, height);
						if (_DEBUG)    console.log('drawing arrow from %s to %s', p1, p2);
						arrow(ctx, p1, p2, w, color);
					})
				}
			}

			if (draw_parents) {
				node.parents.forEach(function (parent, i) {
					if (_DEBUG)    console.log('linking child %s of %s with color %s', i, node.children.length, color.getStyle());
					var p2 = canvas_uv(parent, width, height);
					if (_DEBUG)    console.log('drawing arrow from %s to %s', p1, p2);
					arrow(ctx, p1, p2, 18, color, true);
				})
			}
		});

		var text_template = draw_children ? text_template_children : text_template_parents;


		this.each(function (node, i) {
			var color = colors[node.index % colors.length];
			var p1 = canvas_uv(node, width, height);
			if (draw_children && !can_draw_kids(draw_children, node)){
				return;
			}
			ctx.globalAlpha = 1;
			ctx.fillStyle = BLACK.getStyle();
			ctx.beginPath();
			ctx.fillText(text_template(node), p1.x, p1.y);
			ctx.fillText(text_template(node), p1.x + 3, p1.y - 3);
			ctx.closePath();
			ctx.beginPath();
			ctx.fillStyle = WHITE.getStyle();
			ctx.fillText(text_template(node), p1.x + 1, p1.y - 1);
			ctx.closePath();
			ctx.beginPath();
			ctx.fillStyle = color.getStyle();
			ctx.fillText(text_template(node), p1.x + 2, p1.y - 2);
			ctx.closePath();

		});
	}

	return graph;
})();