/**
 * this is a node shell for other classes;
 * do not use on the client side
 *
 * @type {*}
 */

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/galaxy');
var THREE = require('three');
var ext = require('./THREE.ext');
var PGM = require('./PolyhedronGeometryMeta');

module.exports = {
	_prototypes: {

	},
	_statics: {

	}
};