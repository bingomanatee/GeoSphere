if (typeof module !== 'undefined') {
	THREE = require('three');
	var _ = require('underscore');
	var util = require('util');
}
var _DEBUG = 0;

console.log('PGM');
/**
 * @author clockworkgeek / https://github.com/clockworkgeek
 * @author timothypratley / https://github.com/timothypratley
 *
 * @hacked up by bingomanatee / https://github.com/bingomanatee
 */


	// Texture fixing helper. Spheres have some odd behaviours.

function correctUV(uv, vector, azimuth) {

	if (( azimuth < 0 ) && ( uv.x === 1 )) uv = new THREE.Vector2(uv.x - 1, uv.y);
	if (( vector.x === 0 ) && ( vector.z === 0 )) uv = new THREE.Vector2(azimuth / 2 / Math.PI + 0.5, uv.y);
	return uv;

}

// Angle around the Y axis, counter-clockwise when looking from above.

THREE.vector_azimuth = function (vector) {
	return Math.atan2(vector.z, -vector.x);
};

// Angle above the XZ plane.

THREE.vector_inclination = function (vector) {
	return Math.atan2(-vector.y, Math.sqrt(( vector.x * vector.x ) + ( vector.z * vector.z )));
}
// Project vector onto sphere's surface

THREE.spherical_vector = function (vector, list) {

	var vertex = vector.clone().normalize();
	if (list) vertex.index = list.push(vertex) - 1;

	// Texture coords are equivalent to map coords, calculate angle and convert to fraction of a circle.

	var u = THREE.vector_azimuth(vector) / 2 / Math.PI + 0.5;
	var v = THREE.vector_inclination(vector) / Math.PI + 0.5;
	vertex.uv = new THREE.Vector2(u, 1 - v);

	return vertex;
};

THREE.PolyhedronGeometry = function (vertices, faces, radius, detail) {

	THREE.Geometry.call(this);

	radius = radius || 1;
	detail = detail || 0;

	if (_DEBUG) console.log('PolyhedronGeometry: vertices %s, detail: %s', vertices.length, detail);

	var that = this;
	this.sectors = [];

	for (var i = 0, l = vertices.length; i < l; i++) {

		var vector = THREE.spherical_vector(
			new THREE.Vector3(vertices[ i ][ 0 ], vertices[ i ][ 1 ], vertices[ i ][ 2 ]),
			that.vertices
		);
		vector.detail = detail;
	}

	var midpoints = [], p = this.vertices;

	for (var i = 0, l = faces.length; i < l; i++) {

		make(p[ faces[ i ][ 0 ] ], p[ faces[ i ][ 1 ] ], p[ faces[ i ][ 2 ] ], detail, -1);

	}

	this.mergeVertices();

	// Apply radius

	for (var i = 0, l = this.vertices.length; i < l; i++) {

		this.vertices[ i ].multiplyScalar(radius);

	}

	// Approximate a curved face with recursively sub-divided triangles.

	function make(v1, v2, v3, detail, parent_sector) {

		var sector_id = that.sectors.length;
		var sector = {
			vertices: [v1.index, v2.index, v3.index],
			detail:   detail,
			id:       sector_id,
			parent:   parent_sector
		};
		that.sectors.push(sector);

		if (detail < 1) {

			var face = new THREE.Face3(v1.index, v2.index, v3.index, [ v1.clone(), v2.clone(), v3.clone() ]);
			face.centroid.add(v1).add(v2).add(v3).divideScalar(3);
			face.normal = face.centroid.clone().normalize();

			that.faces.push(face);

			var azi = THREE.vector_azimuth(face.centroid);
			that.faceVertexUvs[ 0 ].push([
				correctUV(v1.uv, v1, azi),
				correctUV(v2.uv, v2, azi),
				correctUV(v3.uv, v3, azi)
			]);

		} else {

			detail -= 1;

			make(v1,
				midpoint(v1, v2, detail, sector_id),
				midpoint(v1, v3, detail, sector_id),
				detail,
				sector_id); // top quadrant
			make(midpoint(v1, v2, detail, sector_id),
				v2,
				midpoint(v2, v3, detail, sector_id),
				detail,
				sector_id); // left quadrant
			make(midpoint(v1, v3, detail, sector_id),
				midpoint(v2, v3, detail, sector_id),
				v3,
				detail,
				sector_id); // right quadrant
			make(midpoint(v1, v2, detail, sector_id),
				midpoint(v2, v3, detail, sector_id),
				midpoint(v1, v3, detail, sector_id),
				detail,
				sector_id); // center quadrant

		}

	}

	function midpoint(v1, v2, detail, sector) {

		if (!midpoints[ v1.index ]) midpoints[ v1.index ] = [];
		if (!midpoints[ v2.index ]) midpoints[ v2.index ] = [];

		var mid = midpoints[ v1.index ][ v2.index ];

		if (mid === undefined) {

			// generate mean point and project to surface with prepare()

			midpoints[ v1.index ][ v2.index ] = midpoints[ v2.index ][ v1.index ] = mid = THREE.spherical_vector(
				new THREE.Vector3().addVectors(v1, v2).divideScalar(2),
				that.vertices
			);

			mid.parents = mid.uv.parents = [v1.index, v2.index];
			mid.detail = mid.uv.detail = detail;

			if (!v1.children) {
				v1.children = [];
			}
			if (!v2.children) {
				v2.children = [];
			}

			v1.children.push(mid.index);
			v2.children.push(mid.index);
		}

		if (!mid.sectors) {
			mid.sectors = [];
		}
		if (detail == 0) {
			mid.sectors.push(sector);
			mid.sectors = _.uniq(mid.sectors);
		}

		return mid;

	}

	this.computeCentroids();

	this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);

};

THREE.PolyhedronGeometry.prototype = Object.create(THREE.Geometry.prototype);

if (!THREE.utils) {
	THREE.utils = {};
}

/**
 * lat ranges from - 90 degrees ( - PI radians) at the south pole to 90 degrees (+ PI radians) at the north pole
 * lon ranges from 0 degrees (0 radians) to 360 degrees (2 PI radians).
 * the lon (x) scale goes from 90(x = 0) to 360/0 degrees, then from 0 to 90 at the right edge (x = 1);
 *
 * lat -90 deg = y 100%;
 * lat  90 deg = y 0%
 *
 * lat 0, x = 75%;
 * lat 90, x = 100%;
 * lat 180, x = 25%;
 * lat 270, x = 50%;
 * lat 360, x = 75%
 */
THREE.utils.latLonToVertex = (function () {

	var geometry = new THREE.SphereGeometry(1, 4, 4);
	var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	var origin = new THREE.Mesh(geometry, material);
	var origin2 = new THREE.Mesh(geometry, material);
	var offset = new THREE.Mesh(geometry, material);
	offset.position.z = 1;
	origin.add(origin2);
	origin2.add(offset);

	return function (lat, lon, degrees) {
		if (degrees) {
			lat *= Math.PI / 180;
			lon *= Math.PI / 180;
		}

		origin.rotation.y = lon;
		origin2.rotation.x = lat;
		origin.updateMatrixWorld();
		var abs = new THREE.Vector3();
		abs.getPositionFromMatrix(offset.matrixWorld);
		return THREE.spherical_vector(abs);
	}
})();