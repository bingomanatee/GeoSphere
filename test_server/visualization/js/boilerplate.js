
var stats, scene, renderer, composer;
var camera, cameraControl;
var earth;

if( !init() )	animate();

// init the scene
function init(){

	if( Detector.webgl ){
		renderer = new THREE.WebGLRenderer({
			antialias		: true,	// to get smoother output
		//	preserveDrawingBuffer	: true	// to allow screenshot
		});
	//	renderer.setClearColorHex( 0xBBBBBB, 1 );
	}else{
		Detector.addGetWebGLMessage();
		return true;
	}
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('solar_system').appendChild(renderer.domElement);

	// create a scene
	scene = new THREE.Scene();

	earth = new Earth();
	earth.simulation();
	//earth.sun_sphere.rotation.x = Math.PI / 100;
	earth.update_simulation();

	FAR = Math.abs(earth.distance_to_sun()) * 1;
	// put a camera in the scene
	camera	= new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 1, FAR * 50);
	camera.position.set(0, 0, FAR);
	camera.lookAt(earth.earth_sphere);
	scene.add(camera);

	// create a camera contol
//	cameraControls	= new THREE.TrackballControls( camera );

	// transparently support window resize
	THREEx.WindowResize.bind(renderer, camera);
	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(renderer);
	// allow 'f' to go fullscreen where this feature is supported
	if( THREEx.FullScreen.available() ){
		THREEx.FullScreen.bindKey();
	//	document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
	}

	// here you add your objects
	// - you will most likely replace this part by your own
	var light	= new THREE.PointLight( 0xffffff);
	light.position.set( earth.SUN_RADIUS , earth.SUN_RADIUS , 0);
		//.normalize().multiplyScalar(1.2);
	scene.add( light );
	light.intensity = 1.5;

	var alight = new THREE.AmbientLight(0x666666);
	scene.add(alight);
;
	scene.add(earth.sun_sphere);
	scene.add(earth.star_map);

}

var start_time = new Date().getTime();
var lastTime = 0;
var scalar = 500;
function animate() {
	var time = new Date().getTime();

	earth.day = 310 + ((time - start_time)/scalar);
	earth.update_simulation();
	render();
	requestAnimationFrame(animate);

}


// render the scene
function render() {
	// variable which is increase by Math.PI every seconds - usefull for animation
	var PIseconds	= Date.now() * Math.PI;

	// update camera controls
//	cameraControls.update();

	// animation of all objects
/*	for( var i = 0; i < scene.objects.length; i ++ ){
		scene.objects[ i ].rotation.y = PIseconds*0.0003 * (i % 2 ? 1 : -1);
		scene.objects[ i ].rotation.x = PIseconds*0.0002 * (i % 2 ? 1 : -1);
	}*/

	// actually render the scene
	renderer.render( scene, camera );
	var vector = new THREE.Vector3();
	vector.setPositionFromMatrix(earth.earth_sphere.matrixWorld);
	camera.lo5okAt(vector);
}
