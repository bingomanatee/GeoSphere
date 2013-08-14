var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Gate = require('gate');

var ITER_COUNT = 500;

function point(mongoose) {
    var schema = new mongoose.Schema(require('./Point.json'));

    schema.index({'coords.x': 1, 'coords.y': 1, 'coords.z': 1});
    schema.index({'detail': 1, 'order': 1});
    schema.index('detail');
    schema.index('neighbors');
    schema.index('section');

    schema.methods.get_parent = function (cb) {
        if (!this.parent) {
            console.log('no parent for node %s', self.parent);
            cb(null, null);
        } else {
            this.model('point').findOne({_id: this.parent}, cb);
        }
    };

    schema.methods.get_child = function (cb) {
        if (!this.child) {
            cb(null, null);
        } else {
            this.model('point').findOne({_id: this.child}, cb);
        }
    };

    schema.methods.find_parent = function (cb) {
        this.model('point').findOne({
            'coords.x': this.coords.x,
            'coords.y': this.coords.y,
            'coords.z': this.coords.z,
            detail: this.detail - 1
        }).exec(cb);
    };

    schema.methods.find_child = function (cb) {
        this.model('point').findOne({
            'coords.x': this.coords.x,
            'coords.y': this.coords.y,
            'coords.z': this.coords.z,
            detail: this.detail + 1
        }).exec(cb);
    };

    schema.methods.get_real_order = function (cb) {
        if (this.detail == 0) {
            cb(null, this.order);
        } else if (this.parent) {
            var self = this;
            this.get_parent(function (err, parent) {
                if (!parent){
                    console.log('cannot get parent node %s', self.parent);
                }
                parent.get_real_order(cb);
            })
        } else {
            var model = this.model('point');
            var self = this;
            if (!self.toJSON().hasOwnProperty('order')) throw new Error('cannot get_real_order without an order');

            model.find({detail: this.detail, parent: {$exists: true}})
                .count(function (err, parent_count) {
                    //  console.log('%s parent count: %s %s', self._id, err,  parent_count);
                    var s = self.toJSON();
                    var crit = {detail: self.detail, parent: {$exists: false}, order: {$lt: self.order}};
                    //  console.log('%s crit: %s', util.inspect(s), util.inspect(crit));

                    model.find(crit).count(function (err, nonparent_count) {
                        //  console.log('%s nonparent count: %s %s', self._id, err, nonparent_count);
                        cb(null, parent_count + nonparent_count);
                    })

                })
        }
    };

    schema.statics.report = function (detail, callback, max_head, max_child) {
        var Table = require('cli-table');

        var Point = mongoose.model('point');

        function _report(rows, n) {
            var table = new Table({
                head: ['id', 'order', 'r order',
                    'x', 'y', 'z',
                    'parent', 'child'],
                colWidths: [8, 8, 8,
                    10, 10, 10,
                    8, 8],
                colAligns: ['left', 'right', 'right',
                    'right', 'right', 'right',
                    'left', 'left']
            });

            rows.forEach(function (row) {
                var j = row.toJSON();
                table.push([row._id, row.order, row.real_order == 0 ? 0 : row.real_order || '??',
                    row.coords.x, row.coords.y, row.coords.z,
                    j.hasOwnProperty('parent') ? j.parent : '--',
                    j.hasOwnProperty('child') ? j.child : '--']

                );
            });

            callback(null, table.toString().replace(/[├──┼───┤]+\n/g, ''), n);
        }

        Point.find({detail: detail}).count(function (n) {
            if (!max_head || (max_head + max_child >= n)) {
                Point.find({detail: detail}).sort({order: 1}).exec(function (err, rows) {
                    //   console.log('rows: %s', util.inspect(rows));
                    _report(rows, n);
                })
            } else {
                Point.find({detail: detail}).sort({order: 1}).limit(max_head).exec(function (err, rows) {
                    //  console.log('rows: %s', util.inspect(rows));
                    if (max_child) Point.find({detail: detail})
                        .sort({order: 1})
                        .skip(n - max_child).limit(max_child)
                        .exec(function (err, child_rows) {
                            console.log('child_rows: %s', util.inspect(child_rows));
                            _report(rows.concat(child_rows), n);
                        })
                })
            }
        });

    };

    var Point = mongoose.model('point', schema);

    return Point;
}

module.exports = point;