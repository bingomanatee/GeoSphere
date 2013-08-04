var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

var humanize = require('humanize');
var Gate = require('gate');
var readline = require('./../util/line_reader');
var THREE = require("three");
var Canvas = require('canvas');
var GLOBE_data_reader = require('./GLOBE_data_reader');

var Planet = require('./../Planet');
var reader = require('./GLOBE_data_reader.js');
var lat_lon_to_vertex = require('./../util/lat_lon_to_Vector3');
var canvas_to_file = require('./../util/canvas_to_file');

var _DEBUG = false;
var lineRE = /([\-\.\d]+)[\t]+([\-\.\d]+([\t]+[\d]+)?(.*))/;

var GLOBE_DATA = path.resolve(__dirname, '../../climate_data');
assert(fs.existsSync(GLOBE_DATA), 'cannot find globe data ' + GLOBE_DATA);
var BIOME_FILE = path.resolve(GLOBE_DATA, 'biome-results.txt');
assert(fs.existsSync(BIOME_FILE), 'cannot find Biome file ' + BIOME_FILE);

function _colorize(biome) {
    if (biome.biome == 'OCEAN') {
        biome.color = new THREE.Color().setRGB(1, 0, 0.3);
        return;
    }

    var brightness = 1 - Math.min(1, (biome.temp + 3) / 8 + 0.05);
    brightness *= brightness;

    var hue = 0;
    var saturation = 1;
    switch (biome.class) {
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

        case 'arid':
            hue = 0.2;
            saturation = 0.75;
            break;

        case 'scrub':
            hue = 0.15;
            saturation = 0.8;
            break;

        case 'tundra':
            hue = 0.6;
            saturation = 0.6;
            brightness = 1 - brightness;
            break;

        default:
            throw new Error('bad class %s', biome.class);
    }

    saturation += (1 - saturation) / 2 * brightness;

    if (_DEBUG) console.log(' %s(%s), class: %s, trees: %s, temp: %s, hue: %s, sat: %s, brightness: %s',
        biome.biome, biome.description, biome.class, biome.trees || '--', biome.temp,
        hue, saturation, brightness
    );

    biome.color = new THREE.Color().setHSL(hue, saturation, brightness);
}


var biome_data = require('./../../climate_data/biomes.json');
biome_data = _.sortBy(biome_data, 'temp');
biome_data = _.sortBy(biome_data, 'class');

biome_data.push({biome: 'OCEAN'});

biome_data.forEach(_colorize);

function Biome(depth) {
    if (_.isObject(depth)) {
        this.planet = depth;
    } else {
        this.planet = new Planet(depth);
    }
    this.lines = 0;
}

function _poll_biomes(biomes) {
    var distribution = biomes.reduce(function (out, biome) {
        if (out[biome]) {
            ++out[biome];
        } else {
            out[biome] = 1;
        }
        return out;
    }, {});

    var total = _.reduce(_.values(distribution), function (t, c) {
        return t + c;
    }, 0);

    _.each(distribution, function (count, biome) {
        distribution[biome] = count / total;
    });
    return distribution;
}

function _most_popular_biome(distribution) {
    return _.reduce(distribution,function (out, count, biome) {

        if (count > out.count) {
            out.count = count;
            out.biome = biome;
        }
        return out;
    }, {biome: '', count: 0}).biome;
}

Biome.make_legend = function (file, callback) {
    var canvas = new Canvas(600, 50 * biome_data.length + 200);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    biome_data.forEach(function (biome, i) {
        ctx.fillStyle = biome.color.getStyle();
        ctx.fillRect(50, i * 50, 100, 50);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(50, i * 50, 100, 50);

        ctx.fillStyle = 'black';
        ctx.fillText(biome.biome + ': ' + biome.description + '(' + biome.color.getStyle() + ')', 250, i * 50 + 30);
    });

    canvas_to_file(canvas, file, function () {
        callback();
    });
};

_.extend(Biome.prototype, {

    load: function (callback) {
        var self = this;

        var index = new GLOBE_data_reader.Index(GLOBE_DATA);
        index.init(function () {
            index.set_planet_elevation(self.planet, 'height', function () {

                var handle = readline(BIOME_FILE);
                handle.on('line', _.bind(self.read_line, self));

                handle.on('end', function () {
                    self.calc_biome();
                    console.log('done lading biome');
                    callback();
                });

                handle.on('error', function (err) {
                    throw err;
                })
            })
        })
    },

    calc_biome: function () {

        this.planet.vertices(function(vertex){
            var height = vertex.data('height');
            if ((height > 10000)  || (height <= 0)){
                vertex.data('biome', ['OCEAN']);
            }
        });

        this.planet.vertices(function (vertex) {
            var biomes = vertex.data('biome');
            if (biomes && biomes.length) {
                biomes = _poll_biomes(biomes);
                vertex.data('main_biome', _most_popular_biome(biomes));
                vertex.data('biome', biomes);
            }
        });

        // fill gaps with neighbor data if it exists.

        this.planet.vertices(function (vertex) {
            if (!vertex.data('main_biome')) {
                var neighbor_biomes = _.compact(vertex.planet.neighbors(vertex.index).map(
                    function (vertex) {
                        return vertex.data('main_biome');
                    }));

                neighbor_biomes = _.reject(neighbor_biomes, function(biome){
                    return biome == 'OCEAN';
                });

                if (neighbor_biomes.length > 0) {
                  if (_DEBUG)  console.log('filling vertex %s', vertex.index);
                    if (_DEBUG)      console.log('... with %s', neighbor_biomes);

                    vertex.data('main_biome', _most_popular_biome(_poll_biomes(neighbor_biomes)));
                }
            }
        });

    },

    read_line: function (line) {
        ++this.lines;
        if (this.lines < 2) return;

        var line_items = _.compact(line.split(/\t/));

        var part = 0;

        var lat = 0;
        var lon = 0;
        var biomes = [];

        line_items.forEach(function (item) {
            switch (part) {
                case 0:
                    lat = parseFloat(item);
                    if (!isNaN(lat)) {
                        ++part;
                    }
                    break;

                case 1:

                    lon = parseFloat(item);
                    if (!isNaN(lon)) {
                        ++part;
                    }
                    break;

                default:
                    ++part;
                    if (/^[A-Z]{4}$/.test(item)) {
                        biomes.push(item);
                    }
                    break;
            }
        });

        if (part < 3) return;

        if (!(lat >= -90) && (lat <= 90)) {
            console.log('strange measureent: %s', line);
            return;
        }

        if (_DEBUG)  console.log('biome: %s, lat: %s, lon: %s',
            biomes, lat, lon
        );

        var point3 = lat_lon_to_vertex(lat, lon, true);
        var closest_vertex = this.planet.closest_point(point3);

        biomes.forEach(function (biome) {
            this.vertex_data_push(closest_vertex.index, 'biome', biome);
        }, this.planet);

    }

});

Biome.DATA = biome_data;
Biome.FILE = BIOME_FILE;

module.exports = Biome;