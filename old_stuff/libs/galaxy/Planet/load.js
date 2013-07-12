/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var mongoose = require('mongoose');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes){
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

/**
 * The load function
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Planet.load = function (id, cb) {
	if (!id) {
		id = this.options.id;
	}
	var self = this;

	if (!id) throw new Exception('cannot find ID to load');

	Planet_Model = mongoose.model('Tank');
	Planet_Model.get(id, function(err, record){
		if (err) return cb(err);

		if (record){
			_.extend(self.options, record.toJSON());
			return cb(null, self, record);
		}
	})

};