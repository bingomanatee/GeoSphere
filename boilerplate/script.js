var stats, scene, renderer, composer, geometry;
var camera, cameraControls, material, stage;
var planet, texture, texCanvas, image, image_filter;

function addLights(scene) {
	var light = new THREE.DirectionalLight(new THREE.Color().setRGB(0.2, 0.2, 0.2));
	scene.add(light);

	light = new THREE.DirectionalLight(new THREE.Color().setRGB(0.1, 0.1, 0.1));
	light.position.set(0, 0, -1);
	scene.add(light);
	light = new THREE.DirectionalLight(new THREE.Color().setRGB(0.2, 0.2, 0.2));
	light.position.set(0, 0, 1);
	scene.add(light);

	light = new THREE.DirectionalLight(new THREE.Color().setRGB(0.2, 0.2, 0.2));
	light.position.set(0, 1, 0);
	scene.add(light);

	light = new THREE.DirectionalLight(new THREE.Color().setRGB(0.2, 0.2, 0.2));
	light.position.set(0, -1, 0);
	scene.add(light);

	light = new THREE.DirectionalLight(new THREE.Color().setRGB(0.5, 0.5, 0.5));
	light.position.set(1, 0, 0);
	scene.add(light);

	light = new THREE.DirectionalLight(new THREE.Color().setRGB(0.1, 0.1, 0.1));
	light.position.set(-1, 0, 0);
	scene.add(light);
}

function initRenderer() {

	var renderer;

	if (Detector.webgl) {
		console.log('web gl renderer');
		renderer = new THREE.WebGLRenderer({
			antialias:             true,	// to get smoother output
			preserveDrawingBuffer: true	// to allow screenshot
		});
		renderer.setClearColorHex(0xBBBBBB, 1);
	} else {
		renderer = new THREE.CanvasRenderer();
	}
	renderer.setSize(window.innerWidth, window.innerHeight);

	// transparently support window resize
	THREEx.WindowResize.bind(renderer, camera);
	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(renderer);
	// allow 'f' to go fullscreen where this feature is supported
	if (THREEx.FullScreen.available()) {
		THREEx.FullScreen.bindKey();
		document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
	}

	return renderer;
}

function initCanvas(data) {
	var scale = 2;
	var width = 360 * scale;
	var height = 180 * scale;

	texture = data.content;
	texCanvas = document.createElement('canvas');

	image = new createjs.Bitmap(data.content.image);
	var t = new Date().getTime();

	image_filter = new PlanetFilter(geometry, width, height);
	image_filter.update = function () {
		console.log('preparing PlanetFilter', Math.round((new Date().getTime() - t) / 1000));

		texCanvas.width = width;
		texCanvas.height = height;

		var ctx = texCanvas.getContext('2d');

		var time = new Date().getTime();
		image_filter.applyFilter(ctx, 0, 0, texCanvas.width, texCanvas.height);
		console.log('duration: ', Math.floor((new Date().getTime() - time) / 1000));
	};
	image_filter.update();

	data.content.image = texCanvas;

	return data.content;
}

function initCamera() {

	// put a camera in the scene
	camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(0, 0, 5);
	scene.add(camera);

	var ele = $('#cursor')
	var p = ele.position();
	// create a camera contol
	cameraControls = new THREE.TrackballControls(camera, ele[0]);
	cameraControls.screen.offsetLeft = p.left;
	cameraControls.screen.offsetTop = p.top;
	cameraControls.screen.width = ele.width();
	cameraControls.screen.height = ele.height();
	cameraControls.radius = ele.width() / 2;

	cameraControls.noZoom = true;
}
// init the scene
function initStats() {
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	document.body.appendChild(stats.domElement);
	return stats;
}

/*
 _.each(geometry.faces, function (f, i) {

 n = ( f instanceof THREE.Face3 ) ? 3 : 4;

 for (var j = 0; j < n; j++) {

 vertexIndex = f[ faceIndices[ j ] ];

 p = geometry.vertices[ vertexIndex ];

 var color = new THREE.Color(0xffffff);
 color.setRGB.apply(color, colors[vertexIndex % colors.length]);

 f.vertexColors[ j ] = color;

 }

 }); */

function onLoad(data) {
	console.log('loaded');

	$('canvas').on('click', onDocumentMouseDown);

	console.log('loaded ', data);

	var content = initCanvas(data);

	material = new THREE.MeshLambertMaterial({ color: 0xffffff / 2,
		shading:                                      THREE.FlatShading,
		vertexColors:                                 THREE.VertexColors });

	var materials = [

		//material,
		new THREE.MeshLambertMaterial({
			map: content

		}),
		new THREE.MeshBasicMaterial({ color: 0x000000, shading: THREE.FlatShading, wireframe: true,
			transparent:                     true })

	];
	var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
	planet = mesh;
	scene.add(mesh);
}

function init() {

	geometry = new THREE.IcosahedronGeometry(1, 6);
	console.log('points: ', geometry.vertices.length);
	geometry.dynamic = true;

	// add Stats.js - https://github.com/mrdoob/stats.js
	stats = initStats();

	// create a scene
	scene = new THREE.Scene();

	initCamera();

	renderer = initRenderer();
	document.getElementById('container').appendChild(renderer.domElement);

	addLights(scene);

	var loader = new THREE.TextureLoader();
	loader.crossDomain = true;
	loader.addEventListener('load', onLoad);
	loader.load('../tests/car.jpg');
}

var projector = new THREE.Projector();
var white = new THREE.Color(255, 255, 255);

function onDocumentMouseDown(event) {

	event.preventDefault();

	var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
	projector.unprojectVector(vector, camera);

	var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

	var intersects = raycaster.intersectObjects([planet.children[0]]);

	if (intersects.length > 0) {

		var point = intersects[ 0 ].point;

		console.log('point: ', point);

	}

	var cp = image_filter.vertex.closest_point(point);
	console.log('closest point: ', cp);

	/*
	 //stage.removeAllChildren();

	 var s = new createjs.Shape();
	 s.graphics.beginFill('#FFFFFF');

	 _.each(pts, function (p) {
	 var x = Math.round(p.uv.x * 1000);
	 var y = 500 - Math.round(p.uv.y * 500);
	 s.graphics.drawCircle(x, y, 2)
	 });

	 stage.addChild(s);
	 stage.update();
	 texture.needsUpdate = true; */

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

	// actually render the scene
	renderer.render(scene, camera);
}

if (!init())    animate();
