var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var THREE = require('three');
var canvas_to_file = require('./../util/canvas_to_file.js');

function _avg(ns) { return ns.reduce(function(o,v){ return o + v}) / ns.length};

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: Draws the planet, colored by sector, with numbers for vertices
 */

function graph (width, height, file, callback) {

    this.ensure_sectors();

    this.vertices(function (v) {
        if (!v.data('color')) {
            var sectors = v.data('sectors');
            if (!sectors){
                console.log('no sector for point %s', v.index);
                return v.data('color', 0);
            }
            sectors.forEach(function(sector){
                v.planet.vertex_data_push(v.index, 'color', new THREE.Color().setHSL(
                    sector / 20, 1, sector % 2 ? 0.75 :0.25));
            });
            var colors = v.data('color');
            if (colors.length == 1) {
                v.data('color', colors[0]);
            } else {
                var color = new THREE.Color().setRGB(
                    _avg(_.pluck(colors, 'r')),
                    _avg(_.pluck(colors, 'g')),
                    _avg(_.pluck(colors, 'b'))
                );
                v.data('color', color);
            }

        }


    });

    var MARGIN = 25;
    var self = this;

    this.draw_triangles(width, height, function (err, canvas) {
        var ctx = canvas.getContext('2d');
        ctx.font = '10pt Arial bold';
        ctx.textAlign = 'center';

        self.vertices(function (v) {

            var x = v.uv.x * width;
            var y = v.uv.y * height;

            var tx =     Math.min(width - MARGIN, Math.max(MARGIN * 2, x));
            var ty = Math.min(height - MARGIN, Math.max(MARGIN * 2, y));
            ctx.strokeStyle = 'rgb(0, 255, 255)';
            ctx.strokeWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(tx, ty);
            ctx.closePath();
            ctx.stroke();

            ctx.strokeStyle = 'white';
            ctx.strokeWidth = 3;
            ctx.strokeText(v.index, tx, ty, 2);

            ctx.fillStyle = 'black';
            ctx.fillText(v.index, tx, ty);
        })

        canvas_to_file(canvas, file, callback);
    });
}

/* -------------- EXPORT --------------- */

module.exports = graph;