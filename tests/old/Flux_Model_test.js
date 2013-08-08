var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');

var humanize = require('humanize');
var Table = require('cli-table');
var Flux_Model = require('././Flux_Model');
var _DEBUG = false;

function _n(n) {
    return humanize.numberFormat(n, 4);
}

function _ol(s) {
    return _.filter(s.split("\n"),function (s, i) {
        return i % 2
    }).join("\n");
}

tap.test('Flux_Model', {timeout: 1000 * 10, skip: false }, function (suite) {

        suite.test('flux history', {timeout: 1000 * 10, skip: false }, function (flux_test) {

            var table = new Table({
                head: ['hour', 'Sun', 'Flux/G', 'heat def', 'Flux/H', 'Flux/E', 'Balance', 'Bowen', 'Temp'],
                colAligns: ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right'],
                colWidths: [6, 12, 12, 12, 12, 12, 12, 12]
            });
            table.options.chars.left = ' ';
            table.options.chars.right = ',';

            var solar_heat = new Flux_Model({terrain: 'grassland'});

            solar_energy = _.range(0, 24).map(function (hour) {
                var angle = (Math.PI * hour / 12);
                var cos = Math.cos(angle);
                return Math.max(0, cos);
            })

            solar_heat.generate_history(solar_energy).forEach(function (flux, i) {

                table.push([
                    i,
                    _n(flux.total_flux()),
                    _n(flux.ground_conduction()),
                    _n(flux._heat_deficit()),
                    _n(flux.sensible_heat_flux()),
                    _n(flux.latent_heat_flux()),
                    _n(flux.balance()),
                    _n(flux.latent_heat_flux() / flux.sensible_heat_flux()),
                    _n(flux.temp)
                ]);

                var flux_ratio = flux.latent_heat_flux() / flux.sensible_heat_flux();

                flux_test.ok(Math.abs(flux_ratio / flux.bowen_ratio() - 1) < 0.01,
                    'latent/sensible heat fluxes (' +
                    _n(flux.latent_heat_flux())  +  '/' + _n(flux.sensible_heat_flux()) + ') : ' + _n(flux_ratio) +
                    ' ~= bowen ratio, ' + _n(flux.bowen_ratio()));

                flux_test.ok(Math.abs(flux.balance()) < 0.01, 'flux energy balances for energy ' + _n(flux.solar_energy));
                if (flux.total_flux() > 0) {
                    flux_test.ok(flux.ground_conduction() >= 0, 'positive flux energy going into ground at energy ' + _n(flux.solar_energy));
                } else {
                    flux_test.ok(flux.ground_conduction() <= 0, 'negative flux energy radiating from ground at energy ' + _n(flux.solar_energy));
                }
            });

            console.log(_ol(table.toString()));

            flux_test.end();
        });

        suite.end();

    }

);