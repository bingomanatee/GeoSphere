var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.z = 8;
camera.position.x = 0;
camera.position.y = 0;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function cube(color, cubeSize){
	var geometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
	var material = new THREE.MeshLambertMaterial( { color: color } );
	return new THREE.Mesh( geometry, material );

}
var center = cube(0x00ff00,0.1);
scene.add( center );

var offset = cube(0xff0000, 0.2);
scene.add(offset);

//var echo = cube(0xff00ff, 0.3);
//scene.add(echo);

var spot = new THREE.SpotLight( 0xffffff, 6, 20, true );
spot.position.x = 3;
spot.position.y = 3;
spot.position.z = 4;
scene.add(spot);

var reference = new THREE.Object3D();
var reference2 = new THREE.Object3D();
reference2.add(reference);
scene.add(reference2);

var signal = new cube(0x0000ff, 0.25);
signal.position.x = 5;
reference.add(signal);


var rad = 0;
var mode = 0;
var update = false;

setTimeout(function(){
	update = true;
}, 100);

function render() {
	requestAnimationFrame(render);

	if (update){
		update = false;

		setTimeout(function(){
			update = true;
		}, 100);

	rad += 0.01;
	if (rad > Math.PI * 2){
		mode = !mode;
		rad = 0;
	}

	if (mode){
		var x = Math.sin(rad) * 3;
		var y = Math.cos(rad) * 3;
		offset.position.x = x;
		offset.position.y = y;
		offset.position.z = 0.5;
	} else {
		var x = Math.sin(rad) * 3;
		var z = Math.cos(rad) * 3;
		offset.position.x = x;
		offset.position.z = z;
		offset.position.y = 0.5;
	}

	var center = THREE.spherical_vector(offset.position);

	var lat =  2 * (0.5 - center.uv.x) + 1;
		lat *= Math.PI;
	var lon = 0.5 - center.uv.y;
		lon *= Math.PI * 2;

	reference.rotation.y = lat * rtd;
	reference2.rotation.x = lon *rtd;
//	echo.position.copy(p2);

	$('#x').text(new Number(center.x).toFixed(3));
	$('#y').text(new Number(center.y).toFixed(3));
	$('#z').text(new Number(center.z).toFixed(3));
//	$('#x2').text(new Number(p2.x).toFixed(3));
//	$('#y2').text(new Number(p2.y).toFixed(3));
//	$('#z2').text(new Number(p2.z).toFixed(3));
	$('#lat').text(new Number(lat).toFixed(4));
	$('#lon').text(new Number(lon).toFixed(4));
	};

	renderer.render(scene, camera);
}
render();