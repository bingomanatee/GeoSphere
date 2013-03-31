var stats, scene, renderer, composer, geometry;
var camera, cameraControls, material, stage;
var planet, texture, texCanvas, image, image_filter;

var scale = 3;
var isoDepth = 7;
var CANVAS_SIZE = 400;

var color_scale = [
	{grey: 0, color: [0, 0, 0]},
	{grey: 28/255, color: [0, 0, 75]}, // lightest blue
	{grey: 31/255, color: [0, 0, 100]}, // swamp/shallow water
	{grey: 31.5/255, color: [255, 255, 0]}, // coast
	{grey: 33/255, color: [51, 125, 25]}, // valley
	{grey: 36/255, color: [75, 100,15]}, // low hills
	{grey: 40/255, color: [128,85,0]}, // hills
	{grey: 50/255, color: [100, 50, 0]}, // high hills
	{grey: 55/255, color: [75, 25, 75]}, // low mountains
	{grey: 60/255, color: [75, 25, 0]}, // mountains
	{grey: 65/255, color: [51, 51, 128]}, // mountains
	{grey: 75/255, color: [255, 255, 255]}, // high mountain
	{grey: 1, color: [255, 255, 255]} // highest mountain
];

function _makeLight(x, y, z, intensity){
	var light = new THREE.DirectionalLight(new THREE.Color(intensity, intensity, intensity));
	light.intensity = intensity;
	light.position.set(x, y, z);
	scene.add(light);
}

function addLights(scene) {

	// poles
	_makeLight(0, -1, 0, 0.5);
	_makeLight(0,  1, 0, 0.5);

	// front, back fill
	_makeLight(0, 0, -1, 0.5);
	_makeLight(0, 0, -1, 0.5);

	// sun and fill
	_makeLight(-1, 0, 0, 1.5);
	_makeLight( 1, 0, 0, 0.5);
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
	var width = 360 * scale;
	var height = 180 * scale;

	texture = data.content;
	texCanvas = document.createElement('canvas');

	image = new createjs.Bitmap(data.content.image);

	image_filter = new PlanetFilter(geometry, width, height, color_scale);
	image_filter.update = function () {
		console.log('preparing PlanetFilter');

		texCanvas.width = width;
		texCanvas.height = height;

		var ctx = texCanvas.getContext('2d');

		var time = new Date().getTime();
		image_filter.applyFilter(ctx, 0, 0, texCanvas.width, texCanvas.height);
		texture.needsUpdate = true;
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

function onLoadMap(data){

	console.log('map loaded', data);
	var image = data.content.image;
	console.log('image: ', image);

	var canvas = document.getElementById('map_canvas');
	canvas.width = image.width;
	canvas.height = image.height;

	// drawing thumb
	console.log('image canvas: ', canvas);

	var stage = new createjs.Stage(canvas);

	var bitmap = new createjs.Bitmap(image);

	var w = image.width;
	var h = image.height;
	bitmap.scaleX = CANVAS_SIZE/w;
	bitmap.scaleY = CANVAS_SIZE/h;

	//bitmap.draw(canvas.getContext('2d'));
	stage.addChild(bitmap);
	stage.update();

	var ctx = canvas.getContext('2d');
	var image_data = ctx.getImageData(0, 0, w, h).data;

	var count = 0;

	function uv_to_color(u, v){
		var x = Math.floor(u * CANVAS_SIZE);
		var y = Math.floor((1 - v) * CANVAS_SIZE);
		var row_offset =  w * y;
		var col_offset =  x;
		var offset = 4 * (row_offset + col_offset);

		var out = [image_data[offset], image_data[offset + 1], image_data[offset + 2]];

		if ((!(x % 20) && (y % 20)))
		if (count++ < 10){
			console.log('x,y: (',x, y,'): out: ', out);
			out[3] = true;
		}
		return out;
	}

	_.each(image_filter.vertices.vertices, function(point){
		var color = uv_to_color(point.x, point.y);
		point.grey = point.ngrey = ((color[0] + color[1] + color[2])/(3.0 * 255));
		if (color[3]){
			console.log('point.grey: ', point.ngrey);
		}
	});

	image_filter.update();
	texture.needsUpdate = material.needsUpdate = true;
}

function onLoad(data) {
	console.log('loaded');

	$('canvas').on('click', onDocumentMouseDown);

	console.log('loaded ', data);

	var content = initCanvas(data);

	material = new THREE.MeshLambertMaterial({
		color: new THREE.Color(0.2, 0.2, 0.2),
		shading:       THREE.FlatShading,
		vertexColors:  THREE.VertexColors });

	var materials = [
		new THREE.MeshLambertMaterial({ map: content }),
		new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.2, 0.2),
			shading: THREE.FlatShading, wireframe: true, transparent: true })

	];
	var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
	planet = mesh;
	scene.add(mesh);

	var map_loader = new THREE.TextureLoader();
	map_loader.crossDomain = true;
	map_loader.addEventListener('load', onLoadMap);
	map_loader.load('images/earth.png');
}

function init() {

	geometry = new THREE.IcosahedronGeometry(1, isoDepth);
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

	var colored = image_filter.color_point(point, 0, 0, 0);
	colored[0].uv.ngrey = colored[0].uv.grey = 0;

	console.log('coloring ', colored);
	image_filter.update();
	material.needsUpdate = true;
}

// animation loop
function animate() {
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
