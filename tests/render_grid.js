var path = require('path');
var util = require('util');
var _ = require('underscore');
var Canvas = require('canvas');
require('./../libs/galaxy/PolyhedronGeometryMeta');
require('./../libs/galaxy/THREE.ext');
var chai = require('chai');
var humanize = require('humanize');
var fs = require('fs');
var test_root = path.resolve(__dirname, '../test_resources/network');

if (_.isFunction(chai.should)) {
	chai.should();
}

var _DEBUG = false;

/* *********************** TEST SCAFFOLDING ********************* */
var SCALE = 4;
var WIDTH = 360 * SCALE;
var HEIGHT = 180;

/* ************************* TESTS ****************************** */

describe('draw grid', function () {
	var grid = new Canvas(WIDTH, HEIGHT);
	var ctx = grid.getContext('2d');

	var geometry = new THREE.SphereGeometry(1, 4, 4);
	var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	var origin = new THREE.Mesh(geometry, material);
	var origin2 = new THREE.Mesh(geometry, material);
	var offset = new THREE.Mesh(geometry, material);
	offset.position.z = 1;
	origin.add(origin2);
	origin2.add(offset);

	before(function () {
		ctx.fillStyle = 'rgba(255,255,255, 1)';

		//	console.log('%s, %s fillStyle: %s', x, y, ctx.fillStyle);

		ctx.beginPath();
		ctx.rect(0, 0, WIDTH, HEIGHT);
		ctx.closePath();
		ctx.fill();
		ctx.font = '10px Arial';
		ctx.fillStyle = 'rgb(0,0,0)';

	});

	it('should be able to draw a predictable lat lon grid', function (done) {

		var template = _.template('(lon <%= lon %>, lat <%= lat %>)');

		_.range(1, 360, 20).forEach(function (lon) {
			origin.rotation.y = lon * Math.PI / 180;
			_.range(-90, 90, 20).forEach(function (lat) {
				origin2.rotation.x = lat * Math.PI / 180;

				origin.updateMatrixWorld();

				var abs = new THREE.Vector3();
				abs.getPositionFromMatrix(offset.matrixWorld);
				var sv = THREE.spherical_vector(abs);
				var x = WIDTH * sv.uv.x;
				var y = HEIGHT * sv.uv.y;
				ctx.beginPath();

				ctx.arc(x, y, 2, 0, Math.PI * 2, true);
				console.log('lat: %s, lon: %s, uv:  %s', lat, lon, sv.uv);
				ctx.fillText(template({lat: lat, lon: lon}), x, y);
			})
		})

		new Number(1).should.eql(1);
		var out = fs.createWriteStream(path.resolve(test_root, 'grid.png'));
		var stream = grid.pngStream();

		stream.on('data', function (c) {
			out.write(c);
		});

		stream.on('end', function () {

			setTimeout(done, 500);
		})
	});

});