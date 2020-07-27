let renderer = null,
    scene = null,
    camera = null;

let menu = null;
let level = null;

let duration = 1000; // ms
let currentTime = Date.now();


function main(canvas) {
    /****************************************************************************
     * Scene
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Set the background color 
    scene.background = new THREE.Color("rgb(224,248,249)");
    // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    /****************************************************************************
     * Camera
     */
    // Add  a camera so we can view the scene
    //PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.5, 4000);
    //camera = new THREE.OrthographicCamera( canvas.width / - 2, canvas.width / 2, canvas.height / 2, canvas.height / - 2, 0.5, 2000 );
    camera.position.set(3, 4, 8);
    camera.rotation.x = -0.4;
    camera.rotation.y = 0.0;
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
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.4);
    scene.add(ambientLight);

    /****************************************************************************
     * Game
     */
    game = new Game();
    level = new Level();
    level.createLevel(1);

    /****************************************************************************
     * Events
     */
    // add mouse handling so we can rotate the scene
    gameEvents();
    buttonEvents(game);
    /****************************************************************************
    * Run the loop
    */
    run();
}

function _update() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;

    game.update();
    level.update();
}

function run() {
    requestAnimationFrame(() => run());
    // Render the scene
    renderer.render(scene, camera);
    _update();
}

class Game{
    constructor() {
        if (!!Game.instance) return Game.instance;
        Game.instance = this;

        this.state = "start";
        this.gameOver = false;
        this.playing = false;
        this.level = 1;
        this.ambienAudio = document.createElement("audio");
        this.ambienAudio.src = "src/bg.mp3";
        this.ambienAudio.volume = 0.2;
        return this;
    }

    update(){

    }

    togglePlaySound(){
        if(this.ambienAudio.paused) {
            this.ambienAudio.play();
            return true;
        }
        else {
            this.ambienAudio.pause();
            return false;
        }
    }

    play(){
        this.state = "game";
        this.playing = true;
        if(this.ambienAudio.paused) this.togglePlaySound();
    }
}

class Level{
    constructor(){
        // s: start, f: front, e:end
        this.levels = ["sffe"];
        //Textures and materials
        this.textureUrl = "../images/checker_large.gif";
        this.texture = new THREE.TextureLoader().load(this.textureUrl);
        this.material = new THREE.MeshPhongMaterial({
            map: this.texture
        });
        this.geometry = new THREE.BoxGeometry(1, 0.3, 1);
        this.meshes = []
        return this;
    }

    update(){
        
    }

    createLevel(lvl){
        for(let i=0; i<this.levels[0].length;i++){
            this.meshes.push(new THREE.Mesh(this.geometry, this.material))
            this.meshes[this.meshes.length-1].position.set(i, 0, 0);
            scene.add( this.meshes[this.meshes.length-1] );
        }
        //this.newMesh.position.set(1, 0, 0);
    }
}

class Player{
    constructor(){

    }
}