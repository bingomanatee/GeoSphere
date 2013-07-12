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

/**
 * links points into a network of data
 *
 * @param id: {String | ObjectId}
 * @param cb: {function}
 */

GALAXY._prototypes.Network.export_sector = function (file_path, sector, cb) {
	console.log("writing %s", file_path);
	var self = this;

	var handle = fs.createWriteStream(file_path, {encoding: 'utf8'});

	var index = 0;
	var percent = 0;
	var cells = [];

	function flush_cells() {
		var b = new Buffer(4 * cells.length);
		var offset = 0;
		cells.forEach(function (def) {
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

		cells = [];

		writable = handle.write(b);
		if (writable) {
			process.nextTick(write_nodes)
		}
	}

	function write_nodes() {
		while (cells.length < 500) {
			do {
				if (index >= self.node_list.length) {
					flush_cells();
					handle.end(cb);
					return;
				}

				var node = self.node_list[index];
				++index;
			} while (!(_.contains(node.vertex.root_sectors, sector)));

			var next_percent = Math.floor(index / self.node_list.length);
			if (next_percent - percent > 1) {
				console.log('%s % done exporting %s', next_percent, self);
				percent = next_percent;
			}
			cells.push.apply(cells, node.export());
		}

		flush_cells();
	}

	handle.on('drain', write_nodes);

	var d_buffer = new Buffer(4);
	d_buffer.writeInt32LE(this.detail, 0);
	var writable = handle.write(d_buffer);

	if (writable) write_nodes();

};
GALAXY._prototypes.Network.export = function (file_path, cb) {

	var self = this;
	console.log('exporting network %s: %s nodes', file_path, this.node_list.length);

	if (this.node_list.length > 10000) {
		var filename = path.basename(file_path);
		var filename_base = filename.replace(/\.[\w]+$/, '');
		var dirname = path.dirname(file_path);
		var sector_dir = path.resolve(dirname, 'sectors');

		var functions = _.map(_.range(0, 20), function (sector) {

			var sector_file = path.resolve(sector_dir, filename_base, 'sector_' + sector + '.bin');

			return function (callback) {
				mkdirp(path.resolve(sector_dir, filename_base),
					function () {
						console.log('saving sector %s of %s', sector, filename);
						self.export_sector(sector_file, sector, callback);
					})
			}
		});

		return async.series(functions, cb);

	}

	console.log("writing %s", file_path);

	var handle = fs.createWriteStream(file_path, {encoding: 'utf8'});

	var index = 0;
	var percent = 0;
	var cells = [];

	function flush_cells() {
		var b = new Buffer(4 * cells.length);
		var offset = 0;
		cells.forEach(function (def) {
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

		cells = [];

		writable = handle.write(b);
		if (writable) {
			process.nextTick(write_nodes)
		}
	}

	function write_nodes() {
		while (cells.length < 500) {
			if (index >= self.node_list.length) {
				flush_cells();
				handle.end(cb);
				return;
			}

			var node = self.node_list[index];
			++index;

			var next_percent = Math.floor(index / self.node_list.length);
			if (next_percent - percent > 1) {
				console.log('%s % done exporting %s', next_percent, self);
				percent = next_percent;
			}
			cells.push.apply(cells, node.export());
		}

		flush_cells();
	}

	handle.on('drain', write_nodes);

	var d_buffer = new Buffer(4);
	d_buffer.writeInt32LE(this.detail, 0);
	var writable = handle.write(d_buffer);

	if (writable) write_nodes();

};
