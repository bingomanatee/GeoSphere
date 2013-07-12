/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
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
 * adding/replacing child node
 * @param node {Network_Node}
 */

GALAXY._prototypes.Network_Node.add_child = function (node) {
	var children = _.reduce(this.children, function (children, child) {
		children[child.index] = child;
		return children;
	}, {});
	children[node.index] = node;
	this.children = _.values(children);
};
