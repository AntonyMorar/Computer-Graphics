let renderer = null,
    scene = null,
    camera = null,
    controls = null;

let objects = [];
let rings = [];
let groups = [];

let duration = 5000; // ms
let currentTime = Date.now();
let orbitDistance = 0;
let objsSize = 0.75;


function createScene(canvas) {
    /****************************************************************************
     * Scene
     */
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Set the background color 
    scene.background = new THREE.Color(0.06, 0.0, 0.07);

    /****************************************************************************
     * Camera
     */
    // Add  a camera so we can view the scene
    //PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    camera.position.set(0, 25, 75);
    camera.rotation.x = -0.35;
    controls.update();
    scene.add(camera);

    /****************************************************************************
     * Light
     */
    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0, -2, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    /****************************************************************************
     * Textures and materials
     */
    // Sun
    let sunUrl = "../images/planets/sunmap.jpg";
    let sunTexture = new THREE.TextureLoader().load(sunUrl);
    let sunMaterial = new THREE.MeshPhongMaterial({
        map: sunTexture
    });

    // Mercury
    let mercuryUrl = "../images/planets/mercurymap.jpg";
    let mercuryBumpUrl = "../images/planets/mercurybump.jpg";
    let mercuryTexture = new THREE.TextureLoader().load(mercuryUrl);
    let mercuryBumpTexture = new THREE.TextureLoader().load(mercuryBumpUrl);
    let mercuryMaterial = new THREE.MeshPhongMaterial({
        map: mercuryTexture,
        bumpMap: mercuryBumpTexture, 
        bumpScale: 0.1
    });

    // Venus
    let venusUrl = "../images/planets/venusmap.jpg";
    let venusBumpUrl = "../images/planets/venusbump.jpg";
    let venusTexture = new THREE.TextureLoader().load(venusUrl);
    let venusMaterial = new THREE.MeshPhongMaterial({
        map: venusTexture
    });

    // Earth
    let earthUrl = "../images/planets/earthmap1k.jpg";
    let earthBumpUrl = "../images/planets/earthbump1k.jpg";
    let earthTexture = new THREE.TextureLoader().load(earthUrl);
    let earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture
    });
    
    // Mars
    let marsUrl = "../images/planets/marsmap1k.jpg";
    let marsBumpUrl = "../images/planets/marsbump1k.jpg";
    let marsTexture = new THREE.TextureLoader().load(marsUrl);
    let marsMaterial = new THREE.MeshPhongMaterial({
        map: marsTexture
    });

    // Jupiter
    let jupiterUrl = "../images/planets/jupitermap.jpg";
    let jupiterTexture = new THREE.TextureLoader().load(jupiterUrl);
    let jupiterMaterial = new THREE.MeshPhongMaterial({
        map: jupiterTexture
    });

    // Saturn
    let saturnUrl = "../images/planets/saturnmap.jpg";
    let saturnTexture = new THREE.TextureLoader().load(saturnUrl);
    let saturnMaterial = new THREE.MeshPhongMaterial({
        map: saturnTexture
    });

    // Uranus
    let uranusUrl = "../images/planets/uranusmap.jpg";
    let uranusTexture = new THREE.TextureLoader().load(uranusUrl);
    let uranusMaterial = new THREE.MeshPhongMaterial({
        map: uranusTexture
    });

    // Neptune
    let neptuneUrl = "../images/planets/neptunemap.jpg";
    let neptuneTexture = new THREE.TextureLoader().load(neptuneUrl);
    let neptuneMaterial = new THREE.MeshPhongMaterial({
        map: neptuneTexture
    });

    // Pluto
    let plutoUrl = "../images/planets/plutomap1k.jpg";
    let plutoBumpUrl = "../images/planets/plutobump1k.jpg";
    let plutoTexture = new THREE.TextureLoader().load(plutoUrl);
    let plutoMaterial = new THREE.MeshPhongMaterial({
        map: plutoTexture
    });
    

    /****************************************************************************
     * Geometry
     */

    //Create the first group (Sun group)
    AddGroup({x:0,y:0,z:0})
    
    // Create the Sun
    addPlanet(sunMaterial, 25)

    //Add orbit
    addOrbit(40);
    // Create Mercury
    addPlanet(mercuryMaterial, 1)

    //Add orbit
    addOrbit(10);
    // Create Venus
    addPlanet(venusMaterial, 2)

    //Add orbit
    addOrbit(10);
    // Create Earth
    addPlanet(earthMaterial, 2)

    //Add orbit
    addOrbit(10);
    // Create mars
    addPlanet(marsMaterial, 1.5)

    //Add orbit
    addOrbit(35);
    // Create Jupiter
    addPlanet(jupiterMaterial, 9)

    //Add orbit
    addOrbit(32);
    // Create Saturn
    addPlanet(saturnMaterial, 7)

    //Add orbit
    addOrbit(25);
    // Create Uraus
    addPlanet(uranusMaterial, 4)

    //Add orbit
    addOrbit(20);
    // Create Neptune
    addPlanet(neptuneMaterial, 3.5)

    //Add orbit
    addOrbit(12);
    // Create Pluto
    addPlanet(plutoMaterial, 2)

    // Add all planets to scene
    scene.add(groups[0]);

    /****************************************************************************
     * Events
     */
    // add mouse handling so we can rotate the scene
    addMouseHandler(canvas, groups[0]);
}

function AddGroup(pos) {
    // Create a group to hold all the objects
    let newGroup = new THREE.Object3D;
    newGroup.position.set(pos.x, pos.y, pos.z);
    groups.push(newGroup);
}

function addPlanet(material, size){
    if (groups.length == 0 || groups == null) AddGroup();
    // Create new Geometry
    let geometry = new THREE.SphereGeometry(size, 24, 24);
    let newMesh = new THREE.Mesh(geometry, material);
    
    let randAngle = Math.random() * Math.PI * 2;
    let xT = Math.cos(randAngle) * orbitDistance;
    let zT = Math.sin(randAngle) * orbitDistance; 
    newMesh.position.set(xT, 0, zT);
    objects.push({
        'mesh': newMesh,
        'satelites': []
    });
    // Add to the group
    groups[0].add(objects[objects.length - 1].mesh);
}

function addOrbit(distance){
    orbitDistance += distance;

    var newObj = new THREE.TorusGeometry( orbitDistance, 0.05,12,100);
    var newMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    var newMesh = new THREE.Mesh( newObj, newMaterial );
    newMesh.rotation.x = Math.PI /2;
    rings.push( newMesh );
    groups[0].add(newMesh)
}



function andsoo(distance=2){
    if ((groups.length <= 1 || groups == null) && objects.length <= 0) return;
    orbitDistance += distance;
    addFigure();

    var newoBJ = new THREE.RingGeometry( orbitDistance, orbitDistance+0.05, 64, 1 );
    var newMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    var newMesh = new THREE.Mesh( newoBJ, newMaterial );
    newMesh.rotation.x = Math.PI /2;
    rings.push( newMesh );
    groups[0].add(newMesh)
}

function addSatelite() {
    if ((groups.length <= 1 || groups == null) && objects.length <= 0) return;
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    // Creating Group
    let newGroup;
    if (objects[objects.length - 1].satelites > 0) {
        newGroup = groups[groups.length - 1];
    } else {
        newGroup = new THREE.Object3D;
        newGroup.position.set(
            objects[objects.length - 1].mesh.position.x,
            objects[objects.length - 1].mesh.position.y,
            objects[objects.length - 1].mesh.position.z
        );
        groups.push(newGroup);
        groups[0].add(newGroup);
    }

    //Creating Satelite
    let newObj = new THREE.DodecahedronGeometry(0.2, 0);
    let material = new THREE.MeshPhongMaterial({
        color: 0x04f30f
    });
    let newMesh = new THREE.Mesh(newObj, material);
    let randAngle = Math.random() * Math.PI * 2;
    let xT = Math.cos(randAngle) * 0.75;
    let zT = Math.sin(randAngle) * 0.75;
    let yT = Math.random() * 0.5;
    if(plusOrMinus) yT*=-1;
    newMesh.position.set(xT, yT, zT);

    objects[objects.length-1].satelites.push(newMesh)
    newGroup.add(newMesh);
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    // Base revolution about its Y axis
    let i = 0;
    groups.forEach(gp => {
        if (i == 0) gp.rotation.y -= angle / 2.5;
        else(gp.rotation.y += angle * 2)

        i++;
    });

    let j = 0;
    // Base rotation about its Y axis
    objects.forEach(object => {
        if (j == 0) object.mesh.rotation.y += angle;
        else object.mesh.rotation.y -= angle;
        j++;

        object.satelites .forEach(sat => {
            sat.rotation.y += angle*2;
        });
    });
}

function run() {
    requestAnimationFrame(function () {
        run();
    });
    // Render the scene
    renderer.render(scene, camera);

    animate();
}