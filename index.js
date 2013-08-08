var path = require('path');

module.exports = {
    Planet: require('./lib/Planet.js'),
    util: require('./lib/util'),
    climate: require('./lib/climate'),
    CLIMATE_ROOT: path.resolve(__dirname,  '../climate_data'),
    CLIMATE_BINARY: path.resolve(__dirname, 'climate_binary_data'),
    Sector: require('./lib/Sector.js')
};