let renderer = null, 
scene = null, 
camera = null;

let objects = [];
let groups = [];

let duration = 5000; // ms
let currentTime = Date.now();
let posOffset = {x:0,y:0,z:0};
let objsSize=0.75;


function createScene(canvas)
{
    /****************************************************************************
     * Scene
     */
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Set the background color 
    scene.background = new THREE.Color( 0.16, 0.16, 0.185 );
    // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    /****************************************************************************
     * Camera
     */
    // Add  a camera so we can view the scene
    //PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 0.5, 4000 );
    camera.position.set(0,3.75,10);
    camera.rotation.x=-0.35;
    scene.add(camera);

    /****************************************************************************
     * Light
     */
    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight( 0xffffff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    /****************************************************************************
     * Textures and materials
     */
    let textureUrl = "../images/checker_large.gif";
    let texture = new THREE.TextureLoader().load(textureUrl);
    let material = new THREE.MeshPhongMaterial({ map: texture });

    /****************************************************************************
     * Geometry
     */

    //Create the first group (empty)
    AddGroup();

    // Create new Geometry
    AddFigure(material);
    AddFigure(material);

    // Add to scene
    scene.add( groups[0] );

    /****************************************************************************
     * Events
     */
    // add mouse handling so we can rotate the scene
    addMouseHandler(canvas, groups[0]);
    btnEvnts();
}

// Add figure to the actual group
function AddFigure(material=null){
    if(groups.length==0 || groups == null) AddGroup();
    // Create new Geometry
    let r = Math.floor(Math.random() * 4);
    let newObj;
    if(material == null) material = new THREE.MeshPhongMaterial( {color: 0xffff00} );
    switch(r){
        case(0):
            newObj = new THREE.DodecahedronGeometry(objsSize,0);
            break;
        case(1):
            newObj = new THREE.IcosahedronGeometry(objsSize,0);   
            break;
        case(2):
            newObj = new THREE.OctahedronGeometry(objsSize,0);
            break;
        case(3):
            newObj = new THREE.SphereGeometry( objsSize, 12, 8 );
            break;
        default:
            newObj = new THREE.BoxGeometry( objsSize, 1, 1 );
            break;
    }
    let newMesh = new THREE.Mesh(newObj, material);
    newMesh.position.x += posOffset.x;
    newMesh.position.y += posOffset.y;
    newMesh.position.z += posOffset.z;
    objects.push(newMesh);

    //Change init params
    rSign = Math.random() >= 0.5; 
    randomX = (Math.random() * 1.9) + 0.9;
    randomZ = (Math.random() * 1.9) + 0.9;
    posOffset.x += randomX;
    posOffset.y = (Math.random()*2)-1;
    posOffset.z += randomZ;
    if(objects.length == 1) objsSize=0.5;

    // Add to the group
    groups[groups.length - 1].add(objects[objects.length -1]);
}

function AddGroup(){
    console.log("creando")
    // Create a group to hold all the objects
    let newGroup = new THREE.Object3D;
    newGroup.position.set(0, 0, 0);
    groups.push(newGroup);
}

function clearFigures(){
    while(objects.length > 0){
        groups[groups.length - 1].remove(objects.pop());
    }
    posOffset = {x:0,y:0,z:0}
}

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    // Base revolution about its Y axis
    groups.forEach(gp => {
        gp.rotation.y -= angle / 2;
    });

    /*
    // Base rotation about its Y axis
    objects.forEach(object => {
        object.rotation.y += angle;
    });
    */
}

function run() {
    requestAnimationFrame(function() { run(); });
    // Render the scene
    renderer.render( scene, camera );

    animate();
}

