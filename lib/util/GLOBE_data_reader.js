var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var array_to_canvas = require('./array_to_canvas');
var canvas_to_file = require('./canvas_to_file');
var Gate = require('gate');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function Tile(params, index) {
	this.rows = 0;
	this.cols = 0;
	this.index = index;
	this.encoding = 'Int16BE';

//	console.log('tile params: %s', util.inspect(params));
	if (params) _.extend(this, params);
}

Tile.prototype = {

	range: function(callback){
		var file = this.get_file_path();
		var stream = fs.createReadStream(file);

		var min = null;
		var max = null;

		stream.on('data', function(buffer){
			var index = 0;

			_.range(0, buffer.length, 2).forEach(function(index){
				var number = buffer.readInt16LE(index);
				if(number == -500) return;
				if (_.isNull(min)){
					min = max = number;
				} else {
					min = Math.min(min, number);
					max = Math.max(max, number);
				}
			})
		});

		stream.on('end', function(){
			console.log('done reading %s', file);
			callback(null, min, max);
		});
	},

	get_file_path: function(){
		return  path.resolve(this.index.root, this.tile);
	},

	init: function (callback) {
		var self = this;
		this.file_path = this.get_file_path();
		console.log('initializing %s', this.file_path);
		var stat = fs.statSync(this.file_path);
		console.log('file size: %s; bytes per data: %s', stat.size, stat.size / (this.rows * this.cols));

		fs.open(this.file_path, 'r', function (err, handle) {
			if (err) throw err;
			if (!handle) throw new Error('no handle');
			self.handle = handle;
			callback(err);
		});
	},

	rc_value:  function (r, c, callback) {
		var self = this;
		var index = r * this.cols + c;

		if (!this.handle) {
			throw new Error('getting rc_value from uninitialized tile');
		} else {
			var buffer = new Buffer(2);
			fs.read(this.handle, buffer, 0, 2, index, function (err, count, buffer) {
				callback(null, buffer.readInt16LE(0));
			});
		}
	}
	
	, rc_map: function (props, callback) {
		var self = this;
	//	console.log('mapping %s with %s', this.file_path, util.inspect(props));
		props.r_max = Math.min(this.rows, props.r_max);
		props.c_max = Math.min(this.cols, props.c_max);
		props.inc |= 1;
		props.scale  |= 2000;

		var gate = Gate.create();
		var out = [];
		var cols = 0;
		var rows = 0;
		var col_bytes = 2 * this.cols;

		_.range(props.r_min, props.r_max, props.inc).forEach(function (r, row_index) {
			++ rows;

			var start = 2 * this.cols *  r;
			var buffer = new Buffer(col_bytes);
			var l = gate.latch();

			fs.read(this.handle, buffer, 0, col_bytes, start, function(err, bytes, buffer){
			//	if (r < 4) console.log('bytes read: %s, desired %s', bytes, col_bytes);
				var data = [];

				_.range(0, col_bytes, 2 * props.inc).forEach(function(buffer_place){
					var i = buffer.readUInt16LE(buffer_place);
					data.push(Math.min(1, Math.sqrt(i/(props.scale))));
				})
				out[row_index] = data;
				cols = data.length;
				l();
			});

		}, this);

		gate.await(function(){
			var reverse_out = _.map(_.range(0, out[0].length), function(r){
				return out.map(function(range){
					return range[r];
				});
			})
		//	console.log('read (rows %s x cols %s) data from %s', rows, cols, self.file_path);
			callback(null, {rows: rows, cols: cols, values: _.flatten(reverse_out)});
		})
	}
	
	, draw: function(params, callback){
		var self = this;

		if (!this.handle){
			return this.init(function(){
				self.draw(params, callback);
			});
		}

	//	console.log('drawing %s', params.file);
		params.r_min |= 0;
		params.r_max |= this.rows;
		params.c_min |= 0;
		params.c_max |= this.cols;
		if(!params.file) throw new Error('Must specify file');
		this.rc_map(params, function(err, data){
		//	console.log('creating %s(%s x %s) from %s.... [%s]', params.file, data.cols, data.rows, data.values.slice(0, 50).join(','), data.values.length);
			var c = array_to_canvas(data.cols, data.rows, data.values);
			canvas_to_file(c, params.file, function(){
				console.log('_____ finished writing %s', self.file_path);
				callback();
			});
		});
	}
	
};

function Index(root) {
	this.root = root;
	this.tiles = [];
	this.parse_index();
}

Index.prototype = {
	parse_index: function () {
		var self = this;
		var data_file = fs.readFileSync(this.root + '/index.txt', 'utf8');
		var lines = data_file.split(/[\r\n]+/);
		var index = lines[0].split(/[\s]+/);
		lines.slice(1).forEach(function (line) {
			var info = line.split(/[\s]+/).map(function(value, i){
			return i ? parseInt(value) : value;
			});
			self.add_tile(_.object(index, info));
		});
	},

	add_tile: function (data) {
		this.tiles.push(new Tile(data, this));
	}
};

/* ********* EXPORTS ******** */

module.exports = {
	Tile:  Tile,
	Index: Index
};