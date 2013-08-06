var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Canvas = require('canvas');
var Planet = require('./../Planet');
var Gate = require('gate');
var assert = require('assert');
var _DEBUG = false;

var Base = require('./../util/_Base.js');

function Cloud_Cover(depth) {

    Base.call(this, depth);

    this.images = {};
}

util.inherits(Cloud_Cover, Base);

_.extend(Cloud_Cover.prototype, {

    load_image_data: require('./Cloud_Cover/load_image_data'),

    vertex_to_buffer: function (vertex) {
        var cover = vertex.data('cloud_cover');
        var buffer = new Buffer(cover.length * 2);
        cover.forEach(function (item, i) {
            buffer.writeInt16BE(item, i * 2);
        });

        return buffer;
    },

    buffer_to_vertex: function (vertex, buffer) {
        var cover = [];
        _.range(0, buffer.length, 2).forEach(function (offset) {
            cover.push(buffer.readInt16BE(offset))
        });

        vertex.data('cloud_cover', cover);
       if ((!vertex % Math.pow(4,  vertex.planet.depth))) console.log('written from buffer to  %s to vertex %s',
             cover.join(','), vertex.index);
    },

    buffer_size: function(){
        return 12 * 2;
    },

    draw: function (file, month, callback, width, height) {
        if (!width) {
            width = 720;
            height = 360;
        }
        this.planet.vertices(function (vertex) {
            var cc = vertex.data('cloud_cover');
            if (_DEBUG) console.log('cloud cover for %s is %s', vertex.index, cc.join(','));
            vertex.data('color', cc[month] / 255);
        });

        this.planet.draw_triangles(width, height, file, callback);
    }
});

module.exports = Cloud_Cover;