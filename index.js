var path = require('path');


function _init_to_detail(detail, callback){
    var ir = new GeoSphere.util.Iso_Remap(detail);

    ir.load_cache_from_bin(callback);
}

var GeoSphere = {
    init_to_detail: _init_to_detail,
    Planet: require('./lib/Planet.js'),
    util: require('./lib/util'),
    climate: require('./lib/climate'),
    CLIMATE_ROOT: path.resolve(__dirname,  '../climate_data'),
    CLIMATE_BINARY: path.resolve(__dirname, 'climate_binary_data'),
    PLANET_BINARY: path.resolve(__dirname, 'planet_binary_data'),
    Sector: require('./lib/Sector.js'),
    model: require('./lib/model')
};

module.exports = GeoSphere;