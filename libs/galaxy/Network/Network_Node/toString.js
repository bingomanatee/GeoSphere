/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
	var humanize = require('humanize');
	var _DEBUG = false;
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Network_Node) {
	GALAXY._prototypes.Network_Node = {};
}

/**
 * links points into a network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network_Node.toString = (function () {

	var template = _.template('NODE #<%= nid %> - index <%= index %>: <%= index %>(network <%= network.detail %>) -- vertex (<%= vertex.toString(true) %>) :' +
		' <%= parents.length %> parents (<%= _.pluck(parents, "index").join(",") %>), ' +
		' <%= children.length %> children (<%= _.pluck(children, "index").join(",") %>)');

	//@TODO: can we compose?
	function toString() {
		return template(_.extend({humanize: humanize}, this));
	}

	return toString;
})();