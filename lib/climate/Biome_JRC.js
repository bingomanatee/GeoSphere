var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var THREE = require('three');
var Canvas = require('canvas');

var Base = require('./../util/_Base');
var canvas_to_file = require('./../util/canvas_to_file');
var _DEBUG = false;

function Biome() {

    var GeoSphere = require('./../../index');
    var args = _.toArray(arguments);
    Base.apply(this, args);
    this.data_file = path.resolve(GeoSphere.CLIMATE_ROOT, 'biome_data/biomes.csv');
    this.data_key = 'biome';
}

Biome.make_legend = function (file, callback) {
    var canvas = new Canvas(600, 50 * Biome.biome_map.length + 200);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Biome.biome_map.forEach(function (biome, i) {
        if (!biome.color) {
            throw new Error(util.format('cannot find color for %s', util.inspect(biome)));
        }
        ctx.fillStyle = biome.color.getStyle();
        ctx.fillRect(50, i * 50, 100, 50);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(50, i * 50, 100, 50);

        ctx.fillStyle = 'black';
        ctx.fillText(biome.index + ': ' + biome.name + '(' + biome.color.getStyle() + ')', 250, i * 50 + 30);
    });

    canvas_to_file(canvas, file, function () {
        callback();
    });
};

function _colorize(biome) {

    var brightness = 1 - Math.min(1, (biome.temp + 3) / 8 + 0.05);
    brightness *= brightness;

    var hue = 0;
    var saturation = 1;
    switch (biome.class) {
        case 'water':
            hue = 0.7;
            saturation = 1;
            brighness = 0.7;
            break;
        case 'forest':
            switch (biome.trees) {
                case 'c':
                    hue = 0.475;
                    saturation = 0.4;
                    break;
                case 'm':
                    hue = 0.36;
                    saturation = 0.5;
                    break;
                case 'd':
                    hue = 0.28;
                    saturation = 0.6;
                    break;

                case 'j':
                    hue = 0.55;
                    saturation = 1;
                    break;

                default:
                    hue = 0.45;
            }
            break;

        case 'desert':
            hue = 0.2;
            saturation = 0.75;
            break;

        case 'scrub':
            hue = 0.15;
            saturation = 0.8;
            break;

        case 'mountain':
            hue = 0;
            saturation = 0.6;
            brightness = 1 - brightness;
            break;

        default:
            throw new Error(util.format('bad class %s', biome.class));
    }

    saturation += (1 - saturation) / 2 * brightness;

    if (_DEBUG) console.log(' %s(%s), class: %s, trees: %s, temp: %s, hue: %s, sat: %s, brightness: %s',
        biome.biome, biome.description, biome.class, biome.trees || '--', biome.temp,
        hue, saturation, brightness
    );

    biome.color = new THREE.Color().setHSL(hue, saturation, brightness);
    return biome;
}

Biome.biome_map = require('./.././biome_commons.json').map(_colorize);


util.inherits(Biome, Base);

_.extend(Biome.prototype, {

    init: function (callback) {
        var self = this;
        this.load_table_data(function () {
            console.log('median data:');
            self.median_planet_data();
            callback();
        })
    },

    line: function (item) {
        var lat = parseFloat(item.latitude);
        var lon = parseFloat(item.longitude);
        var biome = parseInt(item.Biome);
        var area = parseFloat(item.area);
        var sa = this.planet.surface_area(true);
        if (area / sa < 0.25) {
        } else {
            var vertex = this.planet.vertex_ll_data_push(lat, lon, this.data_key, biome);
            if (area > sa * 7 / 3) {
                this.planet.neighbors(vertex.index).forEach(function (neighbor) {
                    neighbor.planet.vertex_data.push(neighbor.index, 'biome', biome);
                });
            }
        }
    }

});

module.exports = Biome;