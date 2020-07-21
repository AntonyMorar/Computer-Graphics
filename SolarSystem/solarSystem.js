let renderer = null,
    scene = null,
    camera = null;

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
    camera.position.set(0, 15, 45);
    camera.rotation.x = -0.35;
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

     // Earth
    let earthUrl = "../images/planets/sunmap.jpg";
    let earthTexture = new THREE.TextureLoader().load(earthUrl);
    let earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture
    });

    /****************************************************************************
     * Geometry
     */

    //Create the first group (Sun group)
    let newGroup = new THREE.Object3D;
    newGroup.position.set(0, 0, 0);
    groups.push(newGroup);
    
    // Create the Sun
    let geometry = new THREE.SphereGeometry(10, 24, 24);
    let sunMesh = new THREE.Mesh(geometry, earthMaterial);
    sunMesh.position.set(0, 0, 0);
    objects.push({
        'mesh': sunMesh,
        'satelites': []
    });
    // Add to the group
    groups[0].add(objects[objects.length - 1].mesh);


    // Add to scene
    scene.add(groups[0]);

    /****************************************************************************
     * Events
     */
    // add mouse handling so we can rotate the scene
    addMouseHandler(canvas, groups[0]);
}

// Add figure to the actual group
function addFigure() {
    if (groups.length == 0 || groups == null) AddGroup();
    // Create new Geometry
    let newObj = new THREE.SphereGeometry(objsSize, 12, 12);;
    let material = new THREE.MeshPhongMaterial({
        color: 0xffff00
    });
    let newMesh = new THREE.Mesh(newObj, material);

    let randAngle = Math.random() * Math.PI * 2;
    let xT = Math.cos(randAngle) * orbitDistance;
    let zT = Math.sin(randAngle) * orbitDistance;
    //console.log(xT,zT)
    newMesh.position.set(xT, 0, zT);
    objects.push({
        'mesh': newMesh,
        'satelites': []
    });
    // Add to the group
    groups[0].add(objects[objects.length - 1].mesh);
    
    //Change init params    
    if (objects.length == 1){
        objsSize = 0.5;
        orbitDistance += 2;
    } 
}


function addOrbit(distance=2){
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

function AddGroup() {
    // Create a group to hold all the objects
    let newGroup = new THREE.Object3D;
    newGroup.position.set(0, 0, 0);
    groups.push(newGroup);
}

function clearFigures() {
    groups[0].remove(...groups[0].children)
    objects = [];
    rings = [];
    while(groups.length > 1){
        groups.pop()
    }
    orbitDistance = 0;
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