/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
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

if (!GALAXY._prototypes.UV_index) {
	GALAXY._prototypes.UV_index = {};
}

GALAXY._prototypes.UV_index.redistribute = function () {
	if (!this.children.length){
		return;
	}
	var vertices = this.vertices;
	this.vertices = [];
	this.load(vertices);
	this.trim();
};

GALAXY._prototypes.UV_index.vertex_count = function () {
	return _.reduce(this.children, function(total, uv_index){
		return total + uv_index.vertex_count();
	}, this.vertices.length);
};

GALAXY._prototypes.UV_index.trim = function () {
	this.children = _.filter(this.children, function(child){
		return child.vertex_count();
	});
	this.children.forEach(function(child){
		child.trim();
	})
};

GALAXY._prototypes.UV_index.load = function (vertices) {
	if (this.children.length) {
		_.each(vertices, function (vertex) {
			var match = _.find(this.children, function (child) {
				child.contains(vertex);
			});

			if (match) {
				match.add(vertex);
			} else {
				this.add(vertex);
			}
		}, this);
	} else {
		this.add(vertices);
	}

	this.trim();
};

