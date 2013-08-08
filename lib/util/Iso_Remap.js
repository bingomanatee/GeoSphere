var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var THREE = require('three');
var assert = require('assert');
var _DEBUG = true;

function Iso_Remap(detail, redraw) {
    this.redraw = redraw;
    this.detail = detail;
    this.generate();
}

function _q(v) {
    return  (v.x >= 0 ? 1 : 0) + (v.y >= 0 ? 2 : 0) + (v.z >= 0 ? 4 : 0);
}

function _unmatched(v) {
    return !v.matched
}
function _matched(v) {
    return v.matched
};

/**
 * the generation process of THREE.IcosahedronGeometry does not put the
 * same point with the same indexes. This class re-maps the vertices
 * so that the same point always has the same index.
 */
_.extend(Iso_Remap.prototype, {

    generate: function () {
        var detail = this.detail;

        while ((!fs.existsSync(this.path(detail, true))) || (this.redraw && detail == this.detail)) {
            if (_DEBUG) console.log('ensuring file for detail %s', detail);
            if (detail == 0) {
                if (!fs.existsSync(this.path(0, true))) {
                    var origin = new THREE.IcosahedronGeometry(1, 0);
                    this.graph(origin, false);
                    this.graph(origin, true);
                }
                ++detail;
            } else {
                --detail;
            }
        }

        while (detail <= this.detail) {
            if (_DEBUG) console.log('reconciling detail %s', detail);
            ++detail;
            this.reconcile(detail);
        }
    },

    get_base: function (detail) {
        var base = JSON.parse(fs.readFileSync(this.path(detail - 1, true), 'utf8'));
        return base;
    },

    clean_verts: function (iso) {
        return  iso.vertices.map(function (v, i) {
            v.o_index = i;
            v.s = v.toArray().join(',');
            delete v.index;
            return v
        });
    },

    reconcile: function (detail) {

        if (_DEBUG) console.log(' ============= RECONCILING %s ===========', detail)

        var iso = new THREE.IcosahedronGeometry(1, detail);

        var vertices = this.clean_verts(iso);

        vertices.forEach(function (v, i) {
            v.index = i;
            v.o_index = i;
            v.s = v.toArray().join(',');
        });

        this.graph(iso);


        if (detail == 0) {
            this.graph(iso, true);
            return;
        }

        vertices.forEach(function(v){v.index = Number.MAX_VALUE});

        var base_data = this.get_base(detail, true);
        if (_DEBUG) console.log('retrieved base data for detail %s', base_data.detail);

        var by_string = base_data.data.reduce(function (index, base_data_vertex) {
            index[base_data_vertex.s] = base_data_vertex;
            return index;
        }, {});

        if (detail == 2) {
            debugger;
        }

        var max_matched = -1;
        vertices.forEach(function (v, i) {
            if (by_string[v.s]) {
                var perfect_match = by_string[v.s];
                v.index = perfect_match.index;
                if (detail == 2 && v.index > 12) {
                    debugger;
                }
                if (_DEBUG) console.log('mapping vertex %s (%s) of iso %s with base_data vertex %s',
                    v.index, v.s, iso.detail, util.inspect(perfect_match));
                max_matched = Math.max(max_matched, perfect_match.index);
                v.matched = true;
                base_data.matched = true;
            }
        });

        vertices.filter(_unmatched).forEach(function(vertex){
            ++max_matched;
            vertex.index = max_matched;
        })

        iso.vertices = _.sortBy(vertices, 'index');

        this.graph(iso, true);
    },

    path: function (depth, remapped) {
        return path.resolve(__dirname, 'order_remap/' + depth + '_' + (remapped ? 'remapped' : 'original') + '.json');
    },

    graph: function (iso, remapped) {
        var vert_data = iso.vertices.map(function (vertex, i) {
            var out = _.pick(vertex, 'index', 'o_index', 'x', 'y', 'z', 's');
            out.s = vertex.toArray().join(',');
            return out;
        });
        var data = JSON.stringify({detail: iso.detail, remapped: remapped, data: vert_data});
        var file = this.path(iso.detail, remapped);
        if (_DEBUG) {
            console.log('writing %s to %s', data, file);
        }
        fs.writeFileSync(file, data, {encoding: 'utf8'});
    }
});

module.exports = Iso_Remap;