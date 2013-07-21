var camera, scene, renderer, sun;
var composer, video, planet_anchor, sun_center;
var geometry, material, planet_mesh, mesh2;

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
		video_material = new THREE.MeshLambertMaterial(parameters),
		t = new THREE.ImageUtils.loadTexture('/images/normal_test.png'),
		image_material = new THREE.MeshBasicMaterial({map: t, ambient: t});
	material = new THREE.MeshBasicMaterial({ color: 0xffffff });

	renderer = new THREE.WebGLRenderer({ antialias: false });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = false;

	var light = new THREE.AmbientLight(0xffffff);
	scene.add(light);
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(-0.5, 1, 1).normalize();
	light.intensity = 0.5;
	scene.add(light);

	var ico = new THREE.IcosahedronGeometry(200, 3);
	console.log('ico made; ', ico.vertices.length, 'vertices');
	var wireframe = new THREE.MeshBasicMaterial({wireframe: true, color: 0xff0000});
//new THREE.Mesh(ico, video_material);
	planet_mesh = THREE.SceneUtils.createMultiMaterialObject(ico, [video_material, wireframe]);

	planet_anchor = new THREE.Mesh(new THREE.CubeGeometry(), material);
	planet_anchor.position.x = -500;
	planet_anchor.add(planet_mesh);


	sun_center = new THREE.Mesh(new THREE.CubeGeometry(), material);
	sun_center.add(planet_anchor);

	var sun_material = new THREE.MeshBasicMaterial({ambient: 0xffff00, color: 0xffff00});
	sun = new THREE.Mesh(new THREE.SphereGeometry(100, 24, 12), sun_material);
	sun.add(sun_center);

	scene.add(sun);

	mesh2 = new THREE.Mesh(new THREE.CubeGeometry(200, 200, 200), image_material);

//	scene.add(mesh2);

	renderer.initMaterial(video_material, scene.__lights);

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

var init_video;
var max_time = 1;
var current_time = 0;

function animate() {
	var angle = Math.PI * current_time * 2 / max_time;

	sun_center.rotation.y = angle;
	planet_anchor.rotation.y = -angle;
	sun.updateMatrixWorld();

	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		if (texture) {
			texture.needsUpdate = true;
			//console.log('pushing texture from video');
		}
		if (!init_video){
			init_video = true;
			(function(){
				var v = document.getElementsByTagName('video')[0]
				var t = document.getElementById('time');
				v.addEventListener('timeupdate',function(event){
					t.innerHTML = v.currentTime;
					 max_time = Math.max(max_time, v.currentTime);
					current_time = v.currentTime;
				},false);
			})();
		}
	}

	camera.lookAt(scene.position);
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame(animate);
	/*
	 planet_mesh.rotation.x += 0.01;
	 planet_mesh.rotation.y += 0.02;
	 mesh2.rotation.x += 0.01;
	 mesh2.rotation.y += 0.02;*/

	renderer.clear();
	//renderer.render(scene, camera);
	composer.render();

}

