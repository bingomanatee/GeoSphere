var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var THREE = require('three');
function Sector(detail) {
    this.detail = detail || 0;
    this.indexes = _.range(0, 20).map(function (i) {
        return {
            sector: i, detail: []
        };
    });
    this.generate();
}

_.extend(Sector.prototype, {

    sectors: function (detail) {
        return this.indexes.map(function (sector_data) {
            return sector_data.detail[detail];
        })
    },

    generate: function (detail) {
        var Planet = require('./Planet');

        if (arguments.length < 1) detail = this.detail;
        var self = this;

        _.range(0, detail + 1).forEach(function (detail) {
            var planet = new Planet(detail);
            // console.log('=========== loading faces for detail %s', detail);
            switch (detail) {
                case 0:
                    planet.iso.faces.forEach(function (face, i) {
                        this.indexes[i].detail[detail] = _.sortBy([
                            face.a, face.b, face.c
                        ], _.identity);

                    }, this);

                    break;

                default:

                    self.indexes.forEach(function (sector_data) {

                        planet.vertex_data_all('count', 0);
                        var seed_indexes = sector_data.detail[detail - 1];

                        seed_indexes.forEach(function (seed_index) {
                            planet.neighbors(seed_index, true).forEach(function (neighbor_index) {
                                planet.vertex_data_op(neighbor_index, 'count', 1, '+');
                            });

                        });

                        sector_data.detail[detail] = _.sortBy(
                            _.pluck(
                                planet.vertices().filter(
                                    function (v) {
                                        return v.data('count') > 1
                                    }
                                ),
                                'index'
                            ).concat(seed_indexes),
                            _.identity
                        );
                    })

            }
        }, this);
    }
});

module.exports = Sector;