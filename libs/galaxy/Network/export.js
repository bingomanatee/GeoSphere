/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var THREE = require('three');
	var _ = require('underscore');
	var Network_Node = require('./Node');
	var util = require('util');
	var _DEBUG = false;
	var fs = require('fs');
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

/**
 * links points into a network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.export = function (file_path, cb) {
	var self = this;

	var handle = fs.createWriteStream(file_path, {encoding: 'utf8'});

	var index = 0;

	function write_node() {
		do {

			if (index >= self.node_list.length) {
				handle.end(cb);
				return;
			}

			var node = self.node_list[index];
			if (_DEBUG)        console.log('writing node %s', node);

			++index;

			var data = node.export();

			//	console.log('data: %s', JSON.stringify(data));
			var b = new Buffer(4 * data.length);
			var offset = 0;
			_.each(data, function (def) {
				switch (def[0]) {
					case 'int':
						b.writeInt32LE(def[1], offset);
						offset += 4;
						break;

					case 'float':
						b.writeFloatLE(def[1], offset);
						offset += 4;
						break;

					default:
						throw new Error(util.format('encoding error: def %s', def[0]));
				}
			});

			writable = handle.write(b);

		} while (writable);

	}

	handle.on('drain', write_node);

	var d_buffer = new Buffer(4);
	d_buffer.writeInt32LE(this.detail, 0);
	var writable = handle.write(d_buffer);

	if (writable) write_node();

};

GALAXY._prototypes.Network.import = function (file_path, cb) {

	var self = this;
	var handle = fs.createReadStream(file_path);

	function _post_process() {
		self.each(function (node) {
			var nears = node.near_nodes;
			node.near_nodes = [];

			_.each(nears, function (near) {
				var near_node = self.nodes[near.index];
				//	console.log('adding near node %s for %s', near_node.index, near.index);
				node.near_nodes.push(near_node)
			})
			node.vertex.parents = _.pluck(node.parents, 'index');
		})

		cb();
	}

	this.node_list = [];
	var current_node;
	var state = 'network_detail';
	var nears_length
		, children_length
		, parents_length
		, influence_parents_length;

	function _node(index, detail_offset) {
		var detail = self.detail + detail_offset;
		return {index: index, detail: detail}
	}

	if (_DEBUG)        console.log('read file %s: loading network %s', file_path, self);

	handle.on('data', function (buffer) {
		var offset = 0;
		if (_DEBUG)        console.log('reading buffer %s', buffer.length);
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

			switch (state) {
				case 'network_detail':
					self.detail = _int();
					state = 'new';
					break;

				case  'new':
					if (current_node)    if (_DEBUG)     console.log('saved %s', current_node);
					current_node = new Network_Node(self);
					self.node_list.push(current_node);
					if (_DEBUG)    console.log('initialized node # %s', self.node_list.length);
					current_node.vertex = new THREE.Vector3();
					current_node.uv = current_node.vertex.uv = new THREE.Vector2();
					state = 'node_index';
					break;

				case 'node_index':
					var index = _int();
					current_node.index = index;
					self.nodes[current_node.index] = current_node;

					//	console.log('--------- index %s', index);
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
					break;

				case 'nears_length':
					nears_length = _int();
					//	console.log('nears: %s', nears_length);
					state = 'nears';
					break;

				case 'nears':
					if (nears_length == current_node.near_nodes.length) {
						state = 'children_length';
					} else {
						current_node.near_nodes.push(_node(_int(), 0));
						//		console.log('added near_nodes %s', current_node.near_nodes.length);

					}

					break;

				case 'children_length':
					children_length = _int();
					//	console.log('children: %s', children_length);

					state = 'children';
					break;

				case 'children':
					if (children_length == current_node.children.length) {
						state = 'parents_length';
					} else {
						current_node.children.push(_node(_int(), -1));
						//		console.log('added children %s', current_node.children.length);
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

						state = 'new';
					} else {
						current_node.parents.push(_node(_int(), 1));
						//		console.log('added parent %s', current_node.parents.length);
					}
					break;

				case 'influence_parents_length':
					influence_parents_length = _int();
					state = 'influence_parents';
					break;

				case 'influence_parents':
					if (influence_parents_length == current_node.influence_parents.length) {
						state = 'new';
					} else {
						current_node.influence_parents.push(_int());
					}
					break;
			}
		} while (offset < buffer.length - 1); // note - assuming buffers come in 4 divisible chunks
		if (_DEBUG)        console.log('done with buffer');
	})

	handle.on('end', _post_process);

}