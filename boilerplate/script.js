var stats, scene, renderer, composer;
var camera, cameraControls, material, stage;
var planet, texture;
var texCanvas;

function addLights(scene){
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

function initCamera(){

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
	cameraControls.radius = ele.width()/2;

	cameraControls.noZoom = true;
}
// init the scene
function init() {

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
	document.getElementById('container').appendChild(renderer.domElement);

	// add Stats.js - https://github.com/mrdoob/stats.js
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	document.body.appendChild(stats.domElement);

	// create a scene
	scene = new THREE.Scene();

	initCamera();

	// transparently support window resize
	THREEx.WindowResize.bind(renderer, camera);
	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(renderer);
	// allow 'f' to go fullscreen where this feature is supported
	if (THREEx.FullScreen.available()) {
		THREEx.FullScreen.bindKey();
		document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
	}

	addLights(scene);

	var geometry = new THREE.IcosahedronGeometry(1, 6);
	geometry.dynamic = true;
	//    var ss = new THREE.GeoSubDivModifier(5);
	//   ss.modify(geometry);

	//    THREE.GeometryUtils.analyzeNormals(geometry);

	var faceIndices = [ 'a', 'b', 'c', 'd' ];

	var colors = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];

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

		$('canvas').on('click', onDocumentMouseDown);

		console.log('loaded ', data);
		texture = data.content;
		texCanvas = document.createElement('canvas');
		texCanvas.width= 1000;
		texCanvas.height = 500;

		 stage = new createjs.Stage(texCanvas);
		stage.autoClear = false;

		var image = new createjs.Bitmap(data.content.image);

		var circle = new createjs.Shape();
		circle.graphics.beginFill('#FF0000').drawCircle(50, 50, 50);

		stage.addChild(image);
		stage.addChild(circle);
		stage.update();

		data.content.image = texCanvas;

		material = new THREE.MeshLambertMaterial({ color: 0xffffff / 2,
			shading:                           THREE.FlatShading,
			vertexColors:                      THREE.VertexColors });

		var materials = [

			//material,
			new THREE.MeshLambertMaterial({
				map: data.content

			}),
			new THREE.MeshBasicMaterial({ color: 0x000000, shading: THREE.FlatShading, wireframe: true,
				transparent:                     true })

		];
		var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
		planet = mesh;
			scene.add(mesh);
	}

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

	var mesh = planet.children[0];

	mesh.dynamic = true;
	mesh.geometry.__dirtyColors = true;
	var pts = _.filter(mesh.geometry.vertices, function(p){

		return p.distanceToSquared(point) < 0.0005;

	})

	stage.removeAllChildren();

	var s = new createjs.Shape();
	s.graphics.beginFill('#FFFFFF');

	_.each(pts, function(p){
		var x = Math.round( p.uv.x * 1000);
		var y = 500 - Math.round(p.uv.y * 500);
		s.graphics.drawCircle(x, y, 2)
	});

	stage.addChild(s);
	stage.update();
	texture.needsUpdate = true;

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
