// set the scene size
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;

// set some camera attributes
var VIEW_ANGLE = 45,
	ASPECT = window.innerWidth / window.innerHeight,
	NEAR = 0.1

// get the DOM element to attach to
// - assume we've got jQuery to hand
var $container = $('#solar_system');
$container.width(WIDTH).height(HEIGHT);

var earth;
var FAR;

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();
var camera;
var scene = new THREE.Scene();
// draw!
function onWindowResize() {

	var windowHalfX = window.innerWidth / 2,
		windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	//effectFXAA.uniforms[ 'resolution' ].value.set(1 / window.innerWidth, 1 / window.innerHeight);

	//composer.reset();

}

function init() {

	earth = new Earth();
	earth.simulation();
	//earth.sun_sphere.rotation.x = Math.PI / 100;
	earth.update_simulation();
	FAR = earth.distance_to_sun();

	camera = new THREE.PerspectiveCamera(VIEW_ANGLE,
		ASPECT,
		1,
		Math.abs(FAR) * 2.5);

	//window.addEventListener('resize', onWindowResize, false);
// the camera starts at 0,0,0 so pull it back
	camera.position.z = FAR * 1.15;
	console.log('camera', camera);
//	camera.position.y = FAR/150;

// start the renderer
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.sortObjects = true;
// attach the render-supplied DOM element
	$container.append(renderer.domElement);

	scene.add(earth.sun_sphere);
	//scene.add(earth.earth_center);

	_.each(_.range(0, 360, 30), function(a){
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(earth.EARTH_RADIUS, 10,10),
			new THREE.MeshPhongMaterial({color: new THREE.Color().setRGB(1, 0, 0).valueOf()}));
		sphere.position.x = earth.SUN_RADIUS * 3 * Math.cos( a* Math.PI/180);
		sphere.position.z = earth.SUN_RADIUS * 3 * Math.sin(a * Math.PI / 180);
		earth.sun_sphere.add(sphere);
	});



// and the camera
	scene.add(camera);

// create a point light
	var sunLight = new THREE.PointLight(0xFFFFFF);

// set its position
	sunLight.position.x = earth.SUN_RADIUS * 5;
	sunLight.position.y = earth.SUN_RADIUS * 5;
	sunLight.position.z = 0;

// add to the scene
	scene.add(sunLight);


// create a point light
	var sunIllum = new THREE.PointLight(0xFFFFFF);

// set its position
	sunIllum.position.x = 0;
	sunIllum.position.y = 0;
	sunIllum.position.z = earth.SUN_RADIUS * 2;
	sunIllum.intensity = 10;
	sunIllum.distance = earth.SUN_RADIUS * 5;

//	scene.add(sunIllum);

	/*
	var renderModel = new THREE.RenderPass(scene, camera);
	var effectBloom = new THREE.BloomPass(1.5);
	var effectCopy = new THREE.ShaderPass(THREE.CopyShader);

	effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	effectFXAA.uniforms[ 'resolution' ].value.set(1 / WIDTH, 1 / HEIGHT);
	effectCopy.renderToScreen = true;

	composer = new THREE.EffectComposer(renderer);

	composer.addPass(renderModel);
	composer.addPass(effectFXAA);
	//composer.addPass(effectBloom);
	composer.addPass(effectCopy);

	renderer.clear();
	composer.render();
*/

	animate();
}

$(init);

function render() {

	renderer.clear();
	renderer.render(scene, camera);
//	composer.render();

}

var start_time = new Date().getTime();
var lastTime = 0;
function animate() {
	var time = new Date().getTime();
	earth.day = 250 + Math.floor(time - start_time)/200;
	earth.update_simulation();
	if (time - lastTime > 10 ){
		render();
		lastTime = time;
	}
	requestAnimationFrame(animate);

}
