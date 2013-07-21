var camera, scene, renderer;
var composer, video;
var geometry, material, mesh, mesh2;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 1000;

	scene = new THREE.Scene();

	geometry = new THREE.IcosahedronGeometry(200, 3); //.CubeGeometry( 200, 200, 200 );

	video = document.getElementById('video');

	texture = new THREE.Texture(video);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;
	texture.generateMipmaps = false;

	var parameters = {  map: texture, color: 0xffffff },
		material_base = new THREE.MeshLambertMaterial(parameters);
	material = new THREE.MeshBasicMaterial({ color: 0xffffff });

	renderer = new THREE.WebGLRenderer({ antialias: false });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = false;

	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0.5, 1, 1).normalize();
	scene.add(light);
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(-0.5, 1, 1).normalize();
	light.intensity = 0.5;
	scene.add(light);

	var ico = new THREE.IcosahedronGeometry(400, 3);
	console.log('ico made; ', ico.vertices.length, 'vertices');
	var wireframe = new THREE.MeshBasicMaterial({wireframe:true, color: 0xff0000});
//new THREE.Mesh(ico, material_base);
	mesh = THREE.SceneUtils.createMultiMaterialObject(ico, [material_base, wireframe]);
	scene.add(mesh);

	mesh2 = new THREE.Mesh(new THREE.CubeGeometry(200, 200, 200), material_base);

//	scene.add(mesh2);

	renderer.initMaterial(material_base, scene.__lights);

	var renderModel = new THREE.RenderPass(scene, camera);
	var effectBloom = new THREE.BloomPass(1.3);
	var effectCopy = new THREE.ShaderPass(THREE.CopyShader);

	effectCopy.renderToScreen = true;

	composer = new THREE.EffectComposer(renderer);

	composer.addPass(renderModel);
//	composer.addPass(effectBloom);
	composer.addPass(effectCopy);

	document.body.appendChild(renderer.domElement);

}

function animate() {
	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		if (texture) {
			texture.needsUpdate = true;
			console.log('pushing texture from video');
		}

	}

	camera.lookAt(scene.position);
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(animate);
/*
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	mesh2.rotation.x += 0.01;
	mesh2.rotation.y += 0.02;*/

	renderer.clear();
	//renderer.render(scene, camera);
	composer.render();

}
