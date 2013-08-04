var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/** ------------------ BOWEN RATIOS ------------------------- */

var BOWEN_RATIOS = {

    sea: 0.1,
    grassland: 0.2,
    crops: 0.5,
    forests: 0.6,
    semiarid: 5,
    deserts: 10

};
var SEA_RATIO = 0.6;
// these ratios are ratios for all land surfaces
var GRASS_RATIO = 2;
var FOREST_RATIO = 1.5;
var SEMIARID_RATIO = 2;
var DESERT_RATIO = 0.75;

var AVERAGE_LAND_BOWEN = ( BOWEN_RATIOS.grassland * GRASS_RATIO
    + BOWEN_RATIOS.forests * FOREST_RATIO
    + BOWEN_RATIOS.semiarid * SEMIARID_RATIO
    + BOWEN_RATIOS.desert * DESERT_RATIO) / (GRASS_RATIO + FOREST_RATIO + SEMIARID_RATIO + DESERT_RATIO);

BOWEN_RATIOS.average = BOWEN_RATIOS.sea * SEA_RATIO + (1 - SEA_RATIO) * AVERAGE_LAND_BOWEN;

/** --------------------- HEAT CONSTANTS ------------------- */

var GLOBAL_SOLAR_ABSORPTION = 2 / 3;
var GLOBAL_HEAT_LOSS = 0.1;

/**
 * This represents a factory for heat data for a specific region of the planet.
 * there are no adjustments for the area of the region -
 * measurements are flux based,
 * effectively for a area limit of zero.
 *
 * @param params {object}
 * @constructor
 */
function Flux_Model(params) {
    this.terrain = 'grassland';
    _.extend(this, params);
}

_.extend(Flux_Model.prototype, {
    absorption: GLOBAL_SOLAR_ABSORPTION,
    loss: GLOBAL_HEAT_LOSS,

    generate_history: function (solar_energy) {
        var heat = this;
        return solar_energy.map(function (energy) {
            return heat.flux(energy);
        })
    },

    flux: function (solar_energy) {
        return new Flux(this, {solar_energy: solar_energy});
    }
});

/**
 * A record of the heat transfer statistics of the region, based on a specific solar input.
 * Time of day (night/day) based on the presence of a nonzero solar
 * @param heat
 * @param params {Object} overrides/initializations of values
 * @constructor
 */
function Flux(heat, params) {
    this.solar_energy = 0;
    _.extend(this, params);
    this.heat = heat;
}

_.extend(Flux.prototype, {

    /* ------------------------- FLUX CALCULATIONS ----------------------- */

    /**
     * Flux/*
     * energy input/output to planet
     * The net effect of the planets radiation of energy
     * and the suns input of energy.
     * @returns {number}
     */
    total_flux: function () {
        return  -(this.solar_energy * this.heat.absorption - this.heat.loss);
    },

    /**
     * X
     * transfer rate of transfer of energy from / to ground
     * @returns {number}
     */
    ground_transfer: function () {
        return this.solar_energy < 0 ? 0.1 : 0.5
    },

    /**
     * Flux/G
     * transfer of heat into/from ground
     * @returns {number}
     */
    ground_conduction: function () {
        return  this.total_flux() * this.ground_transfer();
    },

    bowen_ratio: function () {
        var out = BOWEN_RATIOS[this.heat.terrain];
        if (!out) throw new Error('bad terrain');
        return out;
    },

    _heat_deficit: function () {
        return this.ground_conduction() - this.total_flux();
    },

    /**
     * Flux/E
     * evaporation/condensation
     */
    latent_heat_flux: function () {
        return this.bowen_ratio() * this._heat_deficit() / (1 + this.bowen_ratio());
    },

    /**
     * Flux/H
     * heat transport into the air
     * @returns {number}
     */
    sensible_heat_flux: function () {
        return this._heat_deficit() / (1 + this.bowen_ratio());
    },

    balance: function () {
        return this.total_flux() + this.sensible_heat_flux() + this.latent_heat_flux() - this.ground_conduction();
    }

})


module.exports = Flux_Model;