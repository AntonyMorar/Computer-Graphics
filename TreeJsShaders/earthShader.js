var container;

var camera, scene, renderer, composer, clock;

var uniforms, mesh;

init();
animate();

function init(canvas) {
	// renderer
	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);

	// scene
	scene = new THREE.Scene();
	clock = new THREE.Clock();

	// camera
	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 3000);
	camera.position.z = 4;

	// ambient light
	scene.add(new THREE.AmbientLight(0x222222));

	// directional light
	let light = new THREE.DirectionalLight(0xffffff, 0.7);
	light.position.set(-.5, .2, 1);
	light.target.position.set(0, -2, 0);
	scene.add(light);

	// axes
	scene.add(new THREE.AxesHelper(20));

	var textureLoader = new THREE.TextureLoader();
	uniforms = {
		"diffuse": new THREE.Color('gray'),
		"fogDensity": {
			value: 0.45
		},
		"fogColor": {
			value: new THREE.Vector3(0, 0, 0)
		},
		"time": {
			value: 1.0
		},
		"uvScale": {
			value: new THREE.Vector2(1.0, 1.0)
		},
		"baseTexture": {
			value: textureLoader.load('../images/planets/earthmap1k.jpg')
		},
		"bumpTexture": {
			value: textureLoader.load('../images/planets/earthbump1k.jpg')
		},
		"cloudsTexture": {
			value: textureLoader.load('../images/planets/earthcloudmap.jpg')
		},
		"cloudsAlphaTexture": {
			value: textureLoader.load('../images/planets/earthcloudmaptrans.jpg')
		},
		"perlinTexture": {
			value: textureLoader.load('../images/perlinNoise.png')
		},
	};

	uniforms["baseTexture"].value.wrapS = uniforms["baseTexture"].value.wrapT = THREE.RepeatWrapping;
	uniforms["bumpTexture"].value.wrapS = uniforms["bumpTexture"].value.wrapT = THREE.RepeatWrapping;
	uniforms["cloudsTexture"].value.wrapS = uniforms["cloudsTexture"].value.wrapT = THREE.RepeatWrapping;
	uniforms["cloudsAlphaTexture"].value.wrapS = uniforms["cloudsAlphaTexture"].value.wrapT = THREE.RepeatWrapping;
	uniforms["perlinTexture"].value.wrapS = uniforms["perlinTexture"].value.wrapT = THREE.RepeatWrapping;

	var size = 0.65;

	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		transparent: true
	});

	var material2 = THREE.ShaderMaterial.extend(THREE.MeshPhongMaterial, {
		// Will be prepended to vertex and fragment code
		header: 'varying vec3 vNN; varying mat3 NM; varying vec3 vEye;',
		// Insert code lines by hinting at a existing
		vertex: {
			// Inserts the line after #include <fog_vertex>
			'#include <fog_vertex>': `

			NM = normalMatrix;	
			vNN = normalize(transformedNormal);
			vEye = normalize(transformed-cameraPosition);`
		},
		fragment: {
			'gl_FragColor = vec4( outgoingLight, diffuseColor.a );': `
			gl_FragColor.rgb += (0.2 * pow(1.0 - abs(dot(normalize(NM*vEye), vNN )), 2.5) * 2.0) * vec3(0,0.2,1);
			`,
			'#include <map>':
			''
		},
		// Uniforms (will be applied to existing or added)

		uniforms: uniforms,
		transparent: true
	});

	// mesh
	mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 30, 30), material2);
	mesh.rotation.x = 0.3;
	scene.add(mesh);


	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

	requestAnimationFrame(animate);
	render();

}

function render() {

	var delta = 5 * clock.getDelta();

	uniforms["time"].value += 0.2 * delta;

	renderer.render(scene, camera);
}