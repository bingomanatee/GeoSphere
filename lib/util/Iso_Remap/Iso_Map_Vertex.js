var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var humanize = require('humanize');
var _DEBUG = false;

function Iso_Map_Vertex(vertex, order, map) {
    this.map = map;
    this.vertex = vertex;
    this.index = vertex.index;
    this.order = order;
    this.value = vertex.toArray().join(',');
}

var _vertex_map_point = _.template('vertex point order: <%= order %> ' +
    '(<%= humanize.numberFormat(vertex.x, 3) %>, <%= humanize.numberFormat(vertex.y, 3) %>, <%= humanize.numberFormat(vertex.z, 3) %>)' +
    ' of map <%= map.detail %>');

_.extend(Iso_Map_Vertex.prototype, {

    report: function () {
        return   [
            this.index, this.order,
            humanize.numberFormat(this.vertex.x, 4),
            humanize.numberFormat(this.vertex.y, 4),
            humanize.numberFormat(this.vertex.z, 4),
            this.d_order(true),
            this.p_order(true),
            this.unparented_rank(),
            this.real_order(true)
        ]
    },

    d_order: function (s) {
        if (this.denser) return this.denser.order;
        return s ? ' ' : -1;
    },

    export: function(bin){

        if (bin){
            var buffer = new Buffer(4 + (3 * 4) + 4);
            buffer.writeInt32BE(this.order, 0);
            buffer.writeInt32BE(this.real_order(), 4);
            buffer.writeFloatBE(this.vertex.x, 8);
            buffer.writeFloatBE(this.vertex.y, 8);
            buffer.writeFloatBE(this.vertex.z, 8);
            return buffer;
        }
      return {
          o: this. order,
          r: this.real_order(),
          x: this.vertex.x,
          y: this.vertex.y,
          z: this.vertex.z
      }

    },

    p_order: function (s) {
        if (this.parent) {
            if (!this.parent.hasOwnProperty('order')) {
                throw new Error(util.format('bad parent %s', util.inspect(this.parent)));
            }
            return this.parent.order;
        }
        return s ? ' ' : -1;
    },

    toString: function () {
        return _vertex_map_point(this);
    },

    real_order: function () {
        if (!this.parent) {
            return this._stack_order();
        } else {
            return this.parent.real_order();
        }
    },

    rank_unparented: function () {
        var self = this;
        return this.map.unparented().reduce(function (out, vertex) {
            if (vertex.order <= self.order) {
                return out + 1;
            } else {
                return out;
            }
        }, 0);
    },

    unparented_rank: function(){
      if (!this.hasOwnProperty('unparented_rank_value')){
          this.map.rank_unparented();
      }
        return this.unparented_rank_value;
    },

    _stack_order: function () {
        var max_parented_order = this.map.max_parented_order();
        if (_DEBUG)    console.log('vertex: %s, max_unparented_order: %s', this, max_parented_order);
        return max_parented_order + this.unparented_rank();
    },

    humanize: humanize

});

module.exports = Iso_Map_Vertex;