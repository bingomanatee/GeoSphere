/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var mongoose = require('mongoose');
	var _ = require('underscore');
	var util = require('util');
	var fs = require('fs');
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

if (!GALAXY._prototypes.Planet) {
	GALAXY._prototypes.Planet = {};
}

GALAXY.MAX_BUFFER_ARRAY_ENTRIES = 500;

/**
 * @TODO: flush point data to the leaf sectors
 */

/**
 *  saving the point information for a planet
 * @param file_path
 * @param cb
 */

GALAXY._prototypes.Planet.save_binary = function (file_path, cb) {
	var planet = this;
	//console.log('saving binary');
	var handle = fs.createWriteStream(file_path);
	var index = 0;

	var num_buffer = [];

	function flush(force, cb) {
		if (force || num_buffer.length > GALAXY.MAX_BUFFER_ARRAY_ENTRIES) {
			var buffer = new Buffer(num_buffer.length * 4);
			num_buffer.forEach(function (f, index) {
				buffer.writeFloatLE(f, index * 4);
			})
			num_buffer = [];
			return handle.write(buffer, cb);
		} else {
			return true;
		}
	}

	function start_write() {
		//console.log('start write: %s', index);
		var writable = true;

		while (writable) {
			if (index >= planet.iso.vertices.length) {
				flush(true, function () {
					handle.end();
				});
				return;
			}
			//	console.log('writing index %s', index);
			var v = planet.iso.vertices[index];
			num_buffer.push(v.x);
			num_buffer.push(v.y);
			num_buffer.push(v.z);
			num_buffer.push(v.uv.x);
			num_buffer.push(v.uv.y);
			++index;
			writable = flush();
		}
	}

	handle.on('drain', start_write);
	handle.on('close', cb);
//	handle.on('drain', function () {console.log('drained')});
//	handle.on('finish', function () { console.log('finished')});
//	handle.on('close', function () {console.log('closed')});

	start_write();
};

function atoi(a) {
	return _.map(a, function (v) {
		if (_.isArray(v)) {
			return atoi(v);
		} else {
			return parseInt(v);
		}
	})
};
/**
 * Data extracted straight from the PolyhedronGeometryMeta sector data
 *
 * The sector array is
 *   [
 *     name (4 numbers)
 *     id (1 number)
 *     parent (1 number)
 *     number of vertices (1 number)
 *     vertices (? numbers)
 *   ]
 *
 * @returns {[[integer]]}
 */
GALAXY._prototypes.Planet.sector_to_array = function (n) {
	var sector = this.iso.sectors[n];

	return sector.vertices.concat([
		sector.detail,
		sector.id,
		sector.parent
	]);

};

GALAXY._prototypes.Planet.save_sector_binary = function (file_path, cb) {

	var handle = fs.createWriteStream(file_path);
	var index = 0;

	if (_DEBUG)  console.log('sectors: %s', util.inspect(sectors));

	var num_buffer = [];

	function flush(force, cb, sector) {
		if (force || num_buffer.length > GALAXY.MAX_BUFFER_ARRAY_ENTRIES) {
			var buffer = new Buffer(num_buffer.length * 4);
			num_buffer.forEach(function (f, index) {
				try {
					buffer.writeInt32LE(f, index * 4);
				} catch (err) {
					console.log('cannot write %s ( %s) ', f, util.inspect(sector));
					throw err;
				}
			})
			num_buffer = [];
			return handle.write(buffer, cb);
		} else {
			return true;
		}
	}

	var self = this;

	function start_write() {

		var writable = true;

		while (writable) {
			if (index >= self.iso.sectors.length) {
				flush(true, function () {
					handle.end();
				});
				return;
			}
			var sector = self.sector_to_array(index);
			++index;

			num_buffer.push.apply(num_buffer, sector);
			writable = flush(null, null, sector);

		}

	}

	handle.on('drain', start_write);
	handle.on('close', cb);

	start_write();
};

GALAXY._prototypes.Planet.load_vertices_binary = function (file_path, cb) {
	var planet = this;
	//console.log('saving binary');
	var handle = fs.createReadStream(file_path);

	var num_buffer = [];
	planet.vertices = [];

	function array_to_vertex(x, y, z, ux, uy) {
		var vertex = new THREE.Vector3(x, y, z);
		vertex.uv = new THREE.Vector2(ux, uy);
		return vertex
	}

	handle.on('data', function (buffer) {
		var index = 0;
		while (index < buffer.length) {
			num_buffer.push(buffer.readFloatLE(index));
			index += 4;

			if (num_buffer.length == 5) {
				planet.vertices.push(array_to_vertex.apply(null, num_buffer));
				num_buffer = [];
			}
		}
	});
	handle.on('close', cb);
};

GALAXY._prototypes.Planet.load_sectors_binary = function (file_path, cb) {

	var planet = this;
	//console.log('saving binary');
	var handle = fs.createReadStream(file_path);

	var num_buffer = [];
	planet.sectors = [];

	function array_to_sector(a, b, c, depth, id, parent) {
		return {
			vertices: [a, b, c],
			detail:    depth,
			id:       id,
			parent:   parent
		}
	};

	handle.on('data', function (buffer) {
		var index = 0;
		while (index < buffer.length) {
			num_buffer.push(buffer.readInt32LE(index));
			index += 4;

			if (num_buffer.length == 6) {
				planet.sectors.push(array_to_sector.apply(null, num_buffer));
				num_buffer = [];
			}
		}
	});
	handle.on('close', cb);

};

GALAXY._prototypes.Planet.load_binary = function (sector_path, vertices_path, cb) {
	this.iso = new THREE.Geometry();

	var self = this;
	var tasks = 0;
	this.load_sectors_binary(sector_path, function () {
		self.sectors.forEach(function (sector) {
			if (sector.depth == 0) {
				self.iso.faces.push(new THREE.Face3(sector.vertices.a, sector.vertices.b, sector.vertices.c));
			}
		})

		if (++tasks == 2) {
			cb();
		}
	});

	this.load_vertices_binary(vertices_path, function () {
		self.iso.vertices = self.vertices;
		if (++tasks == 2) {
			cb();
		}
	});

};
