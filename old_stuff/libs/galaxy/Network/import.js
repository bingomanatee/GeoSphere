/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Network_Node = require('./Node');
	var util = require('util');
	var _DEBUG = 0;
	var _ECHO = false

		;
	var fs = require('fs');
	var async = require('async');
	var mkdirp = require('mkdirp');
	var path = require('path');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.Network) {
	GALAXY._prototypes.Network = {};
}

GALAXY._prototypes.Network.get_node = function (index) {
	if (typeof index == 'undefined') {
		throw new Error('network.get_node index == undefiined');
	}

	if (this.nodes[index]) {
		return this.nodes[index];
	} else {
		var out = _.find(this.node_list, function (node) {
			return (node.index == index);
		}, this);

		if (out) {
			this.nodes[index] = out;
			return out;
		} else {
			throw new Error('cannot find index ' + index + ' in ' + this.toString());
		}
	}
};

GALAXY._prototypes.Network.import = function (file_path, cb) {

	var self = this;
	var handle = fs.createReadStream(file_path);
	this.node_list = [];
	var current_node;
	var state = 'network_detail';
	var nears_length
		, children_length
		, root_sectors_length
		, parents_length
		, influence_parents_length;

	function _node(index, detail_offset) {
		var detail = self.detail + detail_offset;
		return {index: index, detail: detail}
	}

	if (_DEBUG)        console.log('read file %s: loading network %s', file_path, self);

	handle.on('data', function (buffer) {
		var offset = 0;
		for (var i = 0; i < buffer.length - 5; i += 4) {
			if (i < buffer.length - 5) {
				//	console.log('int %s: %s', i, buffer.readInt32LE(i));
			}
		}
		//console.log(' ............');

		function _int() {
			var out = buffer.readInt32LE(offset);
			offset += 4;
			return out;
		}

		function _float() {
			var out = buffer.readFloatLE(offset);
			offset += 4;
			return out;
		}

		do {
			//	console.log('state: %s', state);
			if (_ECHO > 1) console.log('    %s', state)

			switch (state) {
				case 'network_detail':
					self.detail = _int();
					if (_ECHO) console.log('detail: %s', self.detail);

					state = 'new';
					break;

				case  'new':
					if (current_node)    if (_DEBUG)     console.log('saved %s', current_node);
					current_node = new Network_Node(self);
					self.node_list.push(current_node);
					current_node.vertex = new THREE.Vector3();
					current_node.uv = current_node.vertex.uv = new THREE.Vector2();
					state = 'node_index';
					break;

				case 'node_index':
					var index = _int();
					current_node.index = index;
					current_node.vertex.index = current_node.index;
					if (_ECHO)    console.log('  1 index %s', index);
					self.nodes[current_node.index] = current_node;

					state = 'vertex_x';
					break;

				case 'vertex_x':
					current_node.vertex.x = _float();
					state = 'vertex_y';
					break;

				case 'vertex_y':
					current_node.vertex.y = _float();
					state = 'vertex_z';
					break;

				case 'vertex_z':
					current_node.vertex.z = _float();
					state = 'vertex_uv_x';
					break;

				case 'vertex_uv_x':
					current_node.vertex.uv.x = _float();
					state = 'vertex_uv_y';
					break;

				case 'vertex_uv_y':
					current_node.vertex.uv.y = _float();
					state = 'nears_length';
					if (_ECHO)    console.log('  2 vertex %s', current_node.vertex.toString(true));
					break;

				case 'nears_length':
					nears_length = _int();
					state = 'nears';
					break;

				case 'nears':
					if (_ECHO) console.log('... processing near %s of %s', current_node.near_nodes.length, nears_length);
					if (nears_length == current_node.near_nodes.length) {
						state = 'children_length';
					} else {
						current_node.near_nodes.push(_node(_int(), 0));
					}

					break;

				case 'children_length':
					if (_ECHO)    console.log('  4 nears(%s): %s', nears_length, util.inspect(current_node.near_nodes));
					children_length = _int();
					state = 'children';
					break;

				case 'children':
					if (children_length == current_node.children.length) {
						state = 'parents_length';
					} else {
						current_node.children.push(_node(_int(), -1));
					}
					break;

				case 'parents_length':

					parents_length = _int();
					//	console.log('parents: %s', parents_length);
					state = 'parents';
					break;

				case 'parents':
					if (parents_length == current_node.parents.length) {
						state = 'influence_parents_length';
					} else {
						current_node.parents.push(_node(_int(), 1));
						//		console.log('added parent %s', current_node.parents.length);
					}
					break;

				case 'influence_parents_length':
					if (_ECHO)    console.log('  4 parents(%s): %s', parents_length, util.inspect(current_node.parents));

					influence_parents_length = _int();
					state = 'influence_parents';
					break;

				case 'influence_parents':
					if (influence_parents_length == current_node.influence_parents.length) {
						state = 'root_sectors_length';
					} else {
						current_node.influence_parents.push(_int());
					}
					break;

				case 'root_sectors_length':
					root_sectors_length = _int();
					current_node.vertex.root_sectors = [];
					state = 'root_sectors';
					break;

				case 'root_sectors':
					if (root_sectors_length == current_node.vertex.root_sectors.length) {
						state = 'new';
					} else {
						current_node.vertex.root_sectors.push(_int());
					}
					break;
			}
		} while (offset < buffer.length - 1); // note - assuming buffers come in 4 divisible chunks
		if (_DEBUG)        console.log('done with buffer');
	})

	handle.on('end', cb);

};