var Earth = (function () {
	/** ******************
	 * This is a solar system simulation; really, "Earth" is not the best name space.
	 * It simulates the rotation of Earth around the sun for a given time period.
	 */

	var KM = 1000;
	var A = 149598; // 149,598,000 km major axis of earth orbit around center of ellipse
	var B = 149231; // 149,231,000 km minor axis of earth orbit
	var C = 2502;   // 2,502,000 km deviation of Sun from center of ellipse
	var DAYS_PER_YEAR = 365.242;
	var E = C / A;
	var E2 = E * E;
	var GM = 1.00094; // gm Calculations
	var AXIAL_TILT = 23 * Math.PI / 180;
	var SCALE_UP = 25;
	var EARTH_RADIUS = 6.371;  // in 1000 km
	var MOON_RADIUS = 1.7374; // in 1000 km 1,737.4 km
	var SUN_RADIUS = 695;  // in 1000 km
	var MOON_ORBIT = 405.503 // in 1000 km 405,503 km

	/* ******* CLOSURE ********* */

	function Earth(resolution) {
		this.day = 0;
		this.hour = 0;
		this.A = A;
		this.B = B;
		this.C = C;
		this.E = E;
		this.E2 = E2;
		this.DAYS_PER_YEAR = DAYS_PER_YEAR;
		this.GM = GM;
		this.AXIAL_TILT = AXIAL_TILT;
		this.SUN_RADIUS = SUN_RADIUS;
		this.EARTH_RADIUS = EARTH_RADIUS;
		this.resolution = resolution;
	}

var t = new THREE.ImageUtils.loadTexture( 'sunmap.png' );
var e = new THREE.ImageUtils.loadTexture( 'Earth.jpg' );
	var sunMaterial = new THREE.MeshBasicMaterial({
	map: t, ambient: new THREE.Color().setRGB(1,1,1).valueOf()
	  });
	var moonMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

	var earthMaterial = new THREE.MeshLambertMaterial({ map: e, color: 0x009999 });
	var starMaterial = new THREE.MeshBasicMaterial({map: new THREE.ImageUtils.loadTexture( 'stars.png' ) });

	function _update() {
		this.sun_sphere.rotation.y = this.sun_angle();
		this.earth_center.position.x = this.distance_to_sun();
		this.earth_sphere.rotation.y = (this.day % 1) * 2* Math.PI;
		this.ec_counter_rotation.rotation.y = -1 * this.sun_angle();
	}

	/* ********* EXPORTS ******** */

	function _simulation() {
		this.update_simulation = _.bind(_update, this);

		this.sun_sphere = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS * SCALE_UP, 50, 50), sunMaterial);
		this.earth_sphere = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * SCALE_UP , 20, 20), earthMaterial);
		this.moon_sphere = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS * SCALE_UP , 20, 20), moonMaterial);
		this.moon_sphere.position.x = MOON_ORBIT * 2;
		//@TODO: scale planet
		this.earth_center = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), earthMaterial);
		this.ec_counter_rotation = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), earthMaterial);
		this.earth_axial_tilt = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), earthMaterial);
		this.moon_center = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), earthMaterial);
		this.moon_center.add(this.moon_sphere);

		this.sun_sphere.add(this.earth_center);
		this.earth_center.add(this.ec_counter_rotation);
		this.ec_counter_rotation.add(this.earth_axial_tilt);
		this.earth_axial_tilt.add(this.earth_sphere);
		this.earth_sphere.add(this.moon_center);
		this.earth_axial_tilt.rotation.z = this.AXIAL_TILT;

		var star_geo = new THREE.SphereGeometry(this.distance_to_sun() * 10);
		this.star_map = new THREE.Mesh(star_geo, starMaterial);
		star_geo.dynamic = true
		star_geo.__dirtyVertices = true;
		star_geo.__dirtyNormals = true;

		this.star_map.flipSided = true;

		for(var i = 0; i<star_geo.faces.length; i++) {
			star_geo.faces[i].normal.x = -1*star_geo.faces[i].normal.x;
			star_geo.faces[i].normal.y = -1*star_geo.faces[i].normal.y;
			star_geo.faces[i].normal.z = -1*star_geo.faces[i].normal.z;
		}
		star_geo.computeVertexNormals();
		star_geo.computeFaceNormals();

	}; // end export function

	Earth.prototype = {
		date:            function () {
			throw new Error('date requires moment');
			var d = moment('2000-01-03', 'YYYY-MM-DD');
			d.add('days', this.day);
			return d;
		},
		distance_to_sun: function () {
			return this.sun_to_earth().length();
		},
		sun_angle:       function () {
			return (Math.PI * 2 * (this.day / this.DAYS_PER_YEAR)) % Math.PI * 2;
		},
		sun_to_earth:    function () {
			var x = Math.cos(this.sun_angle()) * this.A - this.C;
			var y = Math.sin(this.sun_angle()) * this.B;

			return new THREE.Vector3(x, y, 0); // note - NOT taking orbital rotation at this point.
		},
		earth_to_sun:    function () {
			return this.sun_to_earth().multiplyScalar(-1);
		},
		simulation:      _simulation,

	};

	/* ********* EXPORTS ******** */

	return Earth;
})();
