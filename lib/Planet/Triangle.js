var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var draw_corner = require('./Triangle/draw_corner');
var fix = require('./Triangle/fix');
var THREE = require('three');

/** ************************************
 * A triangle represents a facet of the sphere,
 * defined by UV coordinates.
 * ************************************ */

/* ******* CLOSURE ********* */

/**
 *
 * @param face {Object}
 * @param sphere {Sphere}
 * @constructor
 */

function Triangle(face, sphere) {
    this.sphere = sphere;
    this.face = face;
    this.a = sphere.vertex(face.a).uv.clone();
    this.b = sphere.vertex(face.b).uv.clone();
    this.c = sphere.vertex(face.c).uv.clone();

    fix(this);
}

var _t = _.template('Triangle (<%= a %>, <%= b %>, <%= c %>)');

function _ext(v) {
    console.log('testing y: %s', v.y);
    return v.y > 0.99 || v.y < 0.1;
}

Triangle.prototype = {

    color: function (corner) {
        var color = this.sphere.vertex_data(this.face[corner], 'color');

        if (_.isNumber(color)) {
            var c = new THREE.Color();
            var g = color;
            c.setRGB(color, color, color);
            color = c;
           // console.log('color: %s %s', g, color.getStyle());
        } else if (Array.isArray(color)) {
            color = new THREE.Color();
            color.setRGB(color[0], color[1], color[2]);
        }
        return color ? color.getStyle() : 'rgb(128,128,128)';
    },

    center: function () {
        return this.a.clone().add(this.b).add(this.c).multiplyScalar(1 / 3);
    },

    top_or_bottom: require('./Triangle/top_or_bottom'),

    draw: function (ctx, h, w) {
        var t = this;

        draw_corner(t, ctx, 'a', h, w, 0, 0);
        draw_corner(t, ctx, 'b', h, w, 0, 0);
        draw_corner(t, ctx, 'c', h, w, 0, 0);

        var x = this.center().x;
        if (x > 0.95) {
            draw_corner(t, ctx, 'a', h, w, -1, 0);
            draw_corner(t, ctx, 'b', h, w, -1, 0);
            draw_corner(t, ctx, 'c', h, w, -1, 0);
        } else if (x < 0.05) {
            draw_corner(t, ctx, 'a', h, w, 1, 0);
            draw_corner(t, ctx, 'b', h, w, 1, 0);
            draw_corner(t, ctx, 'c', h, w, 1, 0);
        }
    },

    max_x: function () {
        return Math.max(this.a.x, this.b.x, this.c.x);
    },

    perimiterSquared: function () {
        return this.a.distanceToSquared(this.b) + this.b.distanceToSquared(this.c) + this.c.distanceToSquared(this.a);
    },

    toString: function () {
        return _t(this);
    },

    clone: function () {
        return new Triangle(this.sphere, this.face);
    },

    offset: function (x, y) {
        this.a.x += x;
        this.a.y += y;
        this.b.x += x;
        this.b.y += y;
        this.c.x += x;
        this.c.y += y;
        return this;
    }

};

/* ********* EXPORTS ******** */

module.exports = Triangle;