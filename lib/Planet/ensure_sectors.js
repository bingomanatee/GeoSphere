var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Sector = require('./../Sector.js');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To populate the sectors property
 */

function ensure_sectors() {
    if (!this._sectors_loaded) {

        var sector = new Sector(this.depth + 1);

        var self = this;

        sector.indexes.forEach(function (sector_data) {
            var points = sector_data.detail[self.depth];
            if (!points) {
                debugger;
            }
            points.forEach(function (index) {
                self.vertex_data_push(index, 'sectors', sector_data.sector);
            });

        });
        this._sectors_loaded = true;
    }

}

/* -------------- EXPORT --------------- */

module.exports = ensure_sectors