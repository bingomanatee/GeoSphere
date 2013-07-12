var mongoose = require('mongoose');

var Planet_Model = mongoose.model('Planet', {
	name:   {type: String, required: true},
	radius: {type: Number, min: 100} // meters
})
