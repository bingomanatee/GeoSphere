var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var msgpack = require('msgpack-js');
var _DEBUG = false;

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: to pack the planetary data as a msgpack buffer.
 */

function pack_planet(callback, asJSON, root) {
  if (_DEBUG)  console.log('pack args: %s', _.toArray(arguments).join(','));
    this.ensure_sectors();
    var data = this.vertices(function(v){
        return {
            i: v.index,
            c: v.toArray(),
            u: v.uv.toArray(),
            n: v.planet.neighbors(v.index, true),
            s: v.data('sectors')
        };
    });

    fs.writeFile(this.pack_file(asJSON, root), asJSON? JSON.stringify(data) : msgpack.encode(data), callback);
}

/* -------------- EXPORT --------------- */

module.exports = pack_planet;