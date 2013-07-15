var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (t, ctx, point, h, w, x_offset, y_offset) {

	var m = t.center();
	var p, p1, p2, color;
	color = t.color(point);

	switch(point){
		case 'a':
			p = t.a.clone();
			p1 = t.b.clone().add(p).multiplyScalar(0.5);
			p2 = t.c.clone().add(p).multiplyScalar(0.5);
			break;

		case 'b':
			p = t.b.clone();
			p1 = t.a.clone().add(p).multiplyScalar(0.5);
			p2 = t.c.clone().add(p).multiplyScalar(0.5);

			break;

		case 'c':
			p = t.c.clone();
			p1 = t.b.clone().add(p).multiplyScalar(0.5);
			p2 = t.a.clone().add(p).multiplyScalar(0.5);

			break;
	}

	_.each([p, p1, p2, m], function(pp){
		pp.x += x_offset || 0;
		pp.y += y_offset || 0;
		pp.x *= h;
		pp.y *= w;
	})

	_.each([[p, p1, m], [p, p2, m]], function(data){

		(function(q, r, s){

			//	console.log('drawing fragment %s, %s, %s', q, r,s);
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.strokeWidth = 2;
			ctx.beginPath();

			ctx.moveTo.apply(ctx, [q.x, q.y]);
			ctx.lineTo.apply(ctx, [r.x, r.y]);
			ctx.lineTo.apply(ctx, [s.x, s.y]);
			ctx.lineTo.apply(ctx, [q.x, q.y]);

			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}).apply({}, data);
	})
}