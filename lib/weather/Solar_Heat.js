var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');


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

var AVERAGE_LAND_BOWEN =  ( BOWEN_RATIOS.grassland * GRASS_RATIO
    + BOWEN_RATIOS.forests * FOREST_RATIO
    + BOWEN_RATIOS.semiarid * SEMIARID_RATIO
    + BOWEN_RATIOS.desert * DESERT_RATIO) / (GRASS_RATIO + FOREST_RATIO + SEMIARID_RATIO + DESERT_RATIO);

BOWEN_RATIOS.average = BOWEN_RATIOS.sea * SEA_RATIO +  (1 - SEA_RATIO) * AVERAGE_LAND_BOWEN;

function Heat(params) {
    this.terrain = 'grassland';
    _.extend(this, params);
}

_.extend(Heat.prototype, {
       generate_history: function(start, end, inc){
            if (!inc) inc = 1;
           return _.range(start, end, inc).map( function(hour){
                 return new Flux(this, {hour: hour});
           }, this);
       }
});

function Flux(heat, params) {
    this.hour = 0;
    _.extend(this, params);
    this.heat = heat;
}

_.extend(Flux.prototype, {

    /* ----------------------- BASE SOLAR INPUT BY TIME ------------------ */
    /**
     * hour cycle of day
     * @returns {number}
     */
    hour_of_day: function(){
        return this.hour % 24;
    },

    solar_angle: function(){
        return Math.PI * (2 * this.hour_of_day())/24;
    },

    /**
     * absolute energy from sun
     * @returns {number}
     */
    solar_energy: function(){
        return Math.max(0, Math.cos(this.solar_angle()));
    },

    /* ------------------------- FLUX CALCULATIONS ----------------------- */

    /**
     * Flux/*
     * energy input/output to ground/space
     * @returns {number}
     */
    total_flux: function(){
        return  -(this.solar_energy() * 0.65 - 0.1);
    },

    /**
     * X
     * transfer rate of transfer of energy from / to ground
     * @returns {number}
     */
    ground_transfer: function(){
      return this.total_flux() > 0 ? 0.1 : 0.5
    },

    /**
     * Flux/G
     * transfer of heat into/from ground
     * @returns {number}
     */
    ground_conduction: function () {
        return  this.total_flux() * this.ground_transfer();
    },

    bowen_ratio: function(){
        var out = BOWEN_RATIOS[this.heat.terrain];
        if (!out) throw new Error('bad terrain');
        return out;
    },

    _heat_deficit: function(){
        return this.ground_conduction() -  this.total_flux();
    },

    /**
     * Flux/E
     * evaporation/condensation
     */
    latent_heat_flux: function () {
       return this.bowen_ratio() * this._heat_deficit()/(1 + this.bowen_ratio());
    },

    /**
     * Flux/H
     * heat transport into the air
     * @returns {number}
     */
    sensible_heat_flux: function(){
        return this._heat_deficit() / (1 + this.bowen_ratio());
    },

    balance: function(){
        this.total_flux() + this.sensible_heat_flux() + this.latent_heat_flux() - this.ground_conduction();
    }

})


module.exports = Heat;