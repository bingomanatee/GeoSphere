var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Gate = require('gate');

var Base = require('./_Base');

/**
 * this class allows for random access of data expressed in 2d binary format.
 * Note that the data is returned as a small buffer, for maximum flexibility
 * by the consumer.
 */

/**
 *
 * @param planet planet object ||
 * @param file
 * @param params
 * @constructor
 */

function Extractor(planet, file, params) {
    Base.call(this, planet);

    this.rows = 0;
    this.columns = 0;
    this.max_sample_bytes = 1024;
    this.data_size = 4;

    this.file = file;

    _.extend(this, params);

    this.max_sample_bytes -= this.max_sample_bytes % this.data_size;
}

util.inherits(Extractor, Base);

_.extend(Extractor.prototype, {

    data_to_points: function (callback) {

        var self = this;
        var group_cols = this.max_sample_bytes / this.data_size;

        // the number of samples per segment.

        var points = this.planet.vertices().map(function (vertex) {
            var out = {
                row: Math.min(self.rows * vertex.uv.y, self.rows - 1),
                col: Math.min(self.columns * vertex.uv.x, self.columns - 1),
                vertex: vertex
            }
            out.col_group = Math.floor(out.col / group_cols);

            return out;
        })

        fs.open(this.file, function (err, handle) {

            var gate = Gate.create();

            var by_row = _.groupBy(points, 'row');

            _.each(by_row, function (points, row) {
                var cg_points = _.groupBy(row, 'col_group');

                _.each(cg_points, function (points, col_group) {
                    if (!points.length) return;
                    var start_column = points[0].col_group * group_cols;
                    var end_column = Math.min(self.columns, start_column + group_cols);

                    var buffer = new Buffer(end_column - start_column);
                    var start = points[0].col * self.columns * self.data_size;

                    start += self.max_sample_bytes * points[0].col_group;

                    var l = gate.latch();
                    fs.read(handle, buffer, 0, buffer.length, start, function (err, bytesRead, fullBuffer) {
                        if (err) throw error;

                        points.forEach(function (point) {
                            point.data = new Buffer(self.data_size);
                            var sub_start = (point.column - start_column) * self.data_size;
                            fullBuffer.copy(point.data, 0, sub_start, sub_start + self.data_size);
                        });

                        l();
                    })
                });
            });

            gate.await(function () {

                fs.close(function () {
                    callback(null, points);
                })

            })
        })


    }

});

module.exports = Extractor;