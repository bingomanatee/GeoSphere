var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');

var humanize = require('humanize');
var Table = require('cli-table');
var Solar_Heat = require('./../lib/weather/Solar_Heat');

function _n(n){ return humanize.numberFormat(n, 3); }

function _ol(s){
    return _.filter(s.split("\n"), function(s, i){ return i % 2}).join("\n");
}

tap.test('solar heat transfer', {timeout: 1000 * 10, skip: false }, function (suite) {

        suite.test('flux history', {timeout: 1000 * 10, skip: false }, function (flux_test) {

            var table = new Table({
                head:      ['hour',  'Sun', 'Flux/G', 'heat def', 'Flux/H',   'Flux/E', 'Balance', 'Bowen'],
                colAligns: ['right', 'right', 'right', 'right', 'right',    'right', 'right', 'right'],
                colWidths: [6,        12,      12,     12,       12,          12, 12, 12]
            });
            table.options.chars.left = ' ';
            table.options.chars.right = ',';

            var solar_heat = new Solar_Heat({terrain: 'grassland'});

            solar_heat.generate_history(0, 24, 0.5).forEach(function (flux) {
                table.push([
                    flux.hour,
                    _n(flux.total_flux()),
                    _n(flux.ground_conduction()),
                    _n(flux._heat_deficit()),
                    _n(flux.sensible_heat_flux()),
                    _n(flux.latent_heat_flux()),
                    _n(flux.balance()),
                    _n( flux.latent_heat_flux()/ flux.sensible_heat_flux())

                ])
            });

            console.log(_ol(table.toString()));

            flux_test.end();
        });


        suite.test('temperature history', {timeout: 1000 * 10, skip: true}, function (temp_test) {

            temp_test.end();
        });

        suite.end();

    }
);