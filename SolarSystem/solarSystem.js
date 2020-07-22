let renderer = null,
    scene = null,
    camera = null,
    controls = null;

let objects = [];
let rings = [];
let groups = [];
let orbitGroup = null;

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
    scene.background = new THREE.Color(0.03, 0.03, 0.09);

    /****************************************************************************
     * Camera
     */
    // Add  a camera so we can view the scene
    //PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 4000);
    controls = new THREE.OrbitControls( camera, renderer.domElement );

    camera.position.set(0, 25,250);
    camera.rotation.x = -0.35;

    controls.minDistance = 31;
    controls.maxDistance = 1500;
    controls.update();
    scene.add(camera);

    /****************************************************************************
     * Light
     */
    // Add a directional light to show off the objects
    let light = new THREE.PointLight( 0xfff1c9, 1.5, 1000 );
    light.position.set(0, 0, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffffcc, 0.09);
    scene.add(ambientLight);

    /****************************************************************************
     * Textures and materials
     */
    // Sun
    let sunUrl = "../images/planets/sunMap.jpg";
    let sunTexture = new THREE.TextureLoader().load(sunUrl);
    let sunMaterial = new THREE.MeshBasicMaterial({
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
        bumpScale: 0.05
    });

    // Venus
    let venusUrl = "../images/planets/venusmap.jpg";
    let venusBumpUrl = "../images/planets/venusbump.jpg";
    let venusTexture = new THREE.TextureLoader().load(venusUrl);
    let venusBumpTexture = new THREE.TextureLoader().load(venusBumpUrl);
    let venusMaterial = new THREE.MeshPhongMaterial({
        map: venusTexture,
        bumpMap: venusBumpTexture, 
        bumpScale: 0.05
    });

    // Earth
    let earthUrl = "../images/planets/earthmap1k.jpg";
    let earthBumpUrl = "../images/planets/earthbump1k.jpg";
    let earthTexture = new THREE.TextureLoader().load(earthUrl);
    let earthBumpTexture = new THREE.TextureLoader().load(earthBumpUrl);
    let earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: earthBumpTexture, 
        bumpScale: 0.05
    });
    
    // Mars
    let marsUrl = "../images/planets/marsmap1k.jpg";
    let marsBumpUrl = "../images/planets/marsbump1k.jpg";
    let marsTexture = new THREE.TextureLoader().load(marsUrl);
    let marsBumpTexture = new THREE.TextureLoader().load(marsBumpUrl);
    let marsMaterial = new THREE.MeshPhongMaterial({
        map: marsTexture,
        bumpMap: marsBumpTexture, 
        bumpScale: 0.05
    });

    // Jupiter
    let jupiterUrl = "../images/planets/jupiter2_1k.jpg";
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
    let plutoBumpTexture = new THREE.TextureLoader().load(plutoBumpUrl);
    let plutoMaterial = new THREE.MeshPhongMaterial({
        map: plutoTexture,
        bumpMap: plutoBumpTexture, 
        bumpScale: 0.05
    });

    // Moon
    let moonUrl = "../images/planets/moonmap1k.jpg";
    let moonBumpUrl = "../images/planets/moonbump1k.jpg";
    let moonTexture = new THREE.TextureLoader().load(moonUrl);
    let moonBumpTexture = new THREE.TextureLoader().load(moonBumpUrl);
    let moonMaterial = new THREE.MeshPhongMaterial({
        map: moonTexture,
        bumpMap: moonBumpTexture, 
        bumpScale: 0.05
    });

    // Jupiter Moon 1
    let jupterMoon1Texture = new THREE.TextureLoader().load("../images/planets/jupiterMoon.jpg");
    let jupterMoon1Material = new THREE.MeshPhongMaterial({
        map: jupterMoon1Texture
    });

    // Jupiter Moon 2
    let jupterMoon2Texture = new THREE.TextureLoader().load("../images/planets/jupiterMoon2.jpg");
    let jupterMoon2Material = new THREE.MeshPhongMaterial({
        map: jupterMoon2Texture
    });

    // Phobos
    let phobosBumpTexture = new THREE.TextureLoader().load("../images/planets/phobosbump.jpg");
    let phobosMaterial = new THREE.MeshPhongMaterial({
        color: 0x707070,
        bumpMap: phobosBumpTexture, 
        bumpScale: 0.1
    });

    // Deimos
    let deimosBumpTexture = new THREE.TextureLoader().load("../images/planets/deimosbump.jpg");
    let deimosMaterial = new THREE.MeshPhongMaterial({
        color: 0x707070,
        bumpMap: deimosBumpTexture, 
        bumpScale: 0.1
    });

    let bgMatArray =[]
    let bg_ft = new THREE.TextureLoader().load("../images/stars/corona_ft.png");
    let bg_bk = new THREE.TextureLoader().load("../images/stars/corona_bk.png");
    let bg_up = new THREE.TextureLoader().load("../images/stars/corona_up.png");
    let bg_dn = new THREE.TextureLoader().load("../images/stars/corona_dn.png");
    let bg_rt = new THREE.TextureLoader().load("../images/stars/corona_rt.png");
    let bg_lf = new THREE.TextureLoader().load("../images/stars/corona_lf.png");
    
    bgMatArray.push(new THREE.MeshBasicMaterial({map:bg_ft}));
    bgMatArray.push(new THREE.MeshBasicMaterial({map:bg_bk}))
    bgMatArray.push(new THREE.MeshBasicMaterial({map:bg_up}))
    bgMatArray.push(new THREE.MeshBasicMaterial({map:bg_dn}))
    bgMatArray.push(new THREE.MeshBasicMaterial({map:bg_rt}))
    bgMatArray.push(new THREE.MeshBasicMaterial({map:bg_lf}))

    for(let i=0; i<6; i++){
        bgMatArray[i].side = THREE.BackSide
    }

    let skyboxGeo = new THREE.BoxGeometry(3000,3000,3000);
    let skybox = new THREE.Mesh(skyboxGeo, bgMatArray);
    scene.add(skybox)
    /****************************************************************************
     * Geometry
     */

    //Create the first group (Sun group)
    AddGroup({x:0,y:0,z:0});
    //Static group
    orbitGroup = new THREE.Object3D;
    orbitGroup.position.set(0, 0, 0);
    
    // Create the Sun
    addPlanet('Sun',sunMaterial, 30, 0.002, 0);

    //Add orbit
    addOrbit(40);
    // Create Mercury
    addPlanet('Mercury',mercuryMaterial, 0.5, 0.016,1.57);

    //Add orbit
    addOrbit(7);
    // Create Venus
    addPlanet('Venus',venusMaterial, 1.65, 0.0044,1.17);

    //Add orbit
    addOrbit(8.4);
    // Create Earth
    let earthMeshT = addPlanet('Earth',earthMaterial, 2, 1,1);
    addSatelite('moon',moonMaterial, 0.3, 0, 1.5, 2.5, earthMeshT);
    //Add orbit
    addOrbit(6.65);
    // Create mars
    let marshMeshT = addPlanet('Mars',marsMaterial, 1, 0.96,0.805);
    addSatelite('Phobos',phobosMaterial, 0.1, -0.04, 1, 1.4, marshMeshT);
    addSatelite('Deimos', deimosMaterial, 0.05, 0.036, 0.2, 2.6, marshMeshT);
    //Add orbit
    addOrbit(50);
    // Create Jupiter
    let jupiterhMeshT = addPlanet('Jupiter',jupiterMaterial, 15, 0.16,0.43);
    addSatelite('Io',jupterMoon1Material, 0.3, 0.05, 2, 16, jupiterhMeshT);
    addSatelite('Europa',jupterMoon2Material, 0.15, 0.1,1.5, 16.5,jupiterhMeshT);
    addSatelite('Ganymede',jupterMoon1Material, 0.75, 0.17,1, 17.5,jupiterhMeshT);
    addSatelite('Callisto',jupterMoon2Material, 0.55, 0.25,0.8, 19,jupiterhMeshT);
    //Add orbit
    addOrbit(55);
    // Create Saturn
    addPlanet('Saturn',saturnMaterial, 7, 1.26,0.325);

    //Add orbit
    addOrbit(65);
    // Create Uraus
    addPlanet('Uraus',uranusMaterial, 4, 1.4,0.228);

    //Add orbit
    addOrbit(105);
    // Create Neptune
    addPlanet('Neptune',neptuneMaterial, 4.5, 1.5,0.182);

    //Add orbit
    addOrbit(95);
    // Create Pluto
    addPlanet('Pluto',plutoMaterial, 2, 1.68,0.058);

    // Add all planets to scene
    scene.add(groups[0]);
    scene.add(orbitGroup);
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

function addPlanet(name,material, size, yRotation, speed){
    if (groups.length == 0 || groups == null) AddGroup();
    // Create new Geometry
    let geometry = new THREE.SphereGeometry(size, 24, 24);
    let newMesh = new THREE.Mesh(geometry, material);
    
    let randAngle = Math.random() * Math.PI * 2;
    let xT = Math.cos(randAngle) * orbitDistance;
    let zT = Math.sin(randAngle) * orbitDistance; 
    // Create new group
    AddGroup({x:xT, y:0, z:zT});
    //newMesh.position.set(xT, 0, zT);
    newMesh.position.set(0, 0, 0);
    let newObject = {
        'name': name,
        'mesh': newMesh,
        'yRotation': yRotation,
        'speed': speed,
        'radius': orbitDistance,
        'actualAngle': randAngle,
        'satelites': []
    }
    objects.push(newObject);
    // Add to the group
    groups[0].add(groups[groups.length - 1]);
    groups[groups.length - 1].add(objects[objects.length - 1].mesh);
    return newObject;
}

function addOrbit(distance){
    orbitDistance += distance;

    var newObj = new THREE.TorusGeometry( orbitDistance, 0.15,14,150);
    var newMaterial = new THREE.MeshBasicMaterial( { color: 0xc4c4c4, side: THREE.DoubleSide } );
    var newMesh = new THREE.Mesh( newObj, newMaterial );
    newMesh.rotation.x = Math.PI /2;
    rings.push( newMesh );
    orbitGroup.add(newMesh)
}
function addSatelite(name, material, size, yRotation, speed, distance, planetObj) {
    if ((groups.length <= 1 || groups == null) && objects.length <= 0) return;

    //Creating Satelite
    let geometry = new THREE.SphereGeometry(size, 18, 18);
    let newMesh = new THREE.Mesh(geometry, material);

    let randAngle = Math.random() * Math.PI * 2;
    let xT = Math.cos(randAngle) * distance;
    let zT = Math.sin(randAngle) * distance; 
    newMesh.position.set(xT, 0, zT);

    let newObject = {
        'name': name,
        'mesh': newMesh,
        'yRotation': yRotation,
        'speed': speed,
        'distance': distance,
        'actualAngle': randAngle
    }

    planetObj.satelites.push(newObject)
    planetObj.mesh.parent.add(newMesh);
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let deltaAngle = Math.PI * 2 * fract;

    // Base rotation about its Y axis
    for(let i=0; i<objects.length; i++){
        objects[i].mesh.rotation.y += 1 * deltaAngle * objects[i].yRotation;

        for(let j=0; j<objects[i].satelites.length; j++){
            objects[i].satelites[j].mesh.rotation.y += 1 * deltaAngle * objects[i].satelites[j].yRotation;
        }
    }

    // Base revolution about its Y axis
    for(let i=1; i<objects.length; i++){
        objects[i].mesh.parent.position.x = Math.cos(Math.PI * 2 * objects[i].actualAngle) * objects[i].radius;
        objects[i].mesh.parent.position.z = Math.sin(Math.PI * 2 * objects[i].actualAngle) * objects[i].radius;
        objects[i].actualAngle = objects[i].actualAngle + (0.005 * deltaAngle * objects[i].speed);

        for(let j=0; j<objects[i].satelites.length; j++){
            objects[i].satelites[j].mesh.position.x = Math.cos(Math.PI * 2 * objects[i].satelites[j].actualAngle) * objects[i].satelites[j].distance;
            objects[i].satelites[j].mesh.position.z = Math.sin(Math.PI * 2 * objects[i].satelites[j].actualAngle) * objects[i].satelites[j].distance;
            objects[i].satelites[j].actualAngle = objects[i].satelites[j].actualAngle - (0.1 * deltaAngle * objects[i].satelites[j].speed);
        }
    }
}

function run() {
    requestAnimationFrame(function () {
        run();
    });
    // Render the scene
    renderer.render(scene, camera);

    animate();
}