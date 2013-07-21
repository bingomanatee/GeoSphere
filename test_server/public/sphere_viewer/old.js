var stats, scene, renderer, composer;
var camera, video, texture, cameraControl;

if (!init())    animate();

// init the scene
function init() {

	if (Detector.webgl) {
	renderer = new THREE.WebGLRenderer({
	antialias:             true,	// to get smoother output
	preserveDrawingBuffer: true	// to allow screenshot
	});
renderer.setClearColorHex(0xBBBBBB, 1);
} else {
	renderer = new THREE.CanvasRenderer();
	}
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// add Stats.js - https://github.com/mrdoob/stats.js
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0px';
document.body.appendChild(stats.domElement);

// create a scene
scene = new THREE.Scene();

// put a camera in the scene
camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 5);
scene.add(camera);

// create a camera contol
cameraControls = new THREE.TrackballControls(camera)

// transparently support window resize
THREEx.WindowResize.bind(renderer, camera);
// allow 'p' to make screenshot
THREEx.Screenshot.bindKey(renderer);
// allow 'f' to go fullscreen where this feature is supported
if (THREEx.FullScreen.available()) {
	THREEx.FullScreen.bindKey();
	document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
	}

// here you add your objects
// - you will most likely replace this part by your own
var light = new THREE.DirectionalLight(Math.random() * 0xffffff);
light.position.set(Math.random(), Math.random(), Math.random()).normalize();
scene.add(light);
var light = new THREE.DirectionalLight(Math.random() * 0xffffff);
light.position.set(Math.random(), Math.random(), Math.random()).normalize();
scene.add(light);

video = document.getElementById( 'video' );

texture = new THREE.Texture( video );
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBFormat;
texture.generateMipmaps = false;

var parameters = { color: 0xffffff, map: texture },
material_base = new THREE.MeshLambertMaterial( parameters );

renderer.initMaterial( material_base, scene.lights );

var geometry = new THREE.IcosahedronGeometry(3);
//   var material = new THREE.MeshBasicMaterial({ambient: 0x808080, map: texture});
var mesh = new THREE.Mesh(geometry, material_base);
scene.add(mesh);

}

// animation loop
function animate() {

	// loop on request animation loop
	// - it has to be at the begining of the function
	// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	requestAnimationFrame(animate);

	// do the render
	render();

	// update stats
	stats.update();
	}

// render the scene
function render() {
	// variable which is increase by Math.PI every seconds - usefull for animation
	var PIseconds = Date.now() * Math.PI;

	// update camera controls
	cameraControls.update();


	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {

	if ( texture ) texture.needsUpdate = true;

	}

// animate PointLights
scene.lights.forEach(function (light, idx) {
	if (light instanceof THREE.PointLight === false)    return;
	var angle = 0.0005 * PIseconds * (idx % 2 ? 1 : -1) + idx * Math.PI / 3;
	light.position.set(Math.cos(angle) * 3, Math.sin(angle * 3) * 2, Math.cos(angle * 2)).normalize().multiplyScalar(2);
	});

// actually render the scene
renderer.render(scene, camera);
}
