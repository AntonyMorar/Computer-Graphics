let renderer = null,
    scene = null,
    camera = null;

let game = null;
let level = null;
let dancers = [];

let duration = 1000; // ms
let currentTime = Date.now();

let loader2 = new THREE.FBXLoader();

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
    game = new Game()
    level = new Level(game.levelsData[game.level]);
    let player = new Player();

    /*
    // Load a glTF resource
    loader2.load(
        // resource URL
        'src/SambaDancing.fbx',
        // called when the resource is loaded
        function (robotObj) {
            console.log(robotObj)
            robotObj.mixer = new THREE.AnimationMixer( scene );
            robotObj.scale.set(0.01, 0.01, 0.01);
            robotObj.rotation.y = Math.PI / 2;
            let action = robotObj.mixer.clipAction( robotObj.animations[ 0 ], robotObj );
            console.log(robotObj.animations);
            action.play();
            dancers.push(robotObj);
            scene.add( robotObj );
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened');
            console.log(error)
        }
    );
    */


    /****************************************************************************
     * Events
     */
    // add mouse handling so we can rotate the scene
    gameEvents(game, level);
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

    if (dancers.length > 0) {
        for (dancer_i of dancers)
            dancer_i.mixer.update((deltat) * 0.001);
    }
}

function run() {
    requestAnimationFrame(() => run());
    // Render the scene
    renderer.render(scene, camera);
    _update();
}

class Game {
    constructor() {
        if (!!Game.instance) return Game.instance;
        Game.instance = this;

        this.state = "start";
        this.gameOver = false;
        this.playing = false;
        this.level = 0;
        this.levelsData = [{
                level: "sfffe",
                buttons: {
                    DragFront: 2,
                    DragLeft: 0,
                    DragRight: 0
                }
            },
            {
                level: "sfflfe",
                buttons: {
                    DragFront: 3,
                    DragLeft: 1,
                    DragRight: 0
                }
            },
        ]
        this.ambienAudio = document.createElement("audio");
        this.ambienAudio.src = "src/bg.mp3";
        //this.ambienAudio.volume = 0.25;
        this.ambienAudio.volume = 0.0;
        return this;
    }

    update() {

    }

    togglePlaySound() {
        if (this.ambienAudio.paused) {
            this.ambienAudio.play();
            return true;
        } else {
            this.ambienAudio.pause();
            return false;
        }
    }

    playLevel() {
        console.log("play level")
        this.state = "game";
        this.playing = true;
        if (this.ambienAudio.paused) this.togglePlaySound();
        level.createLevel();
    }
}

class Level {
    constructor(levelData) {
        // s: start, f: front, e:end
        this.level = levelData.level;
        this.buttons = levelData.buttons;
        this.stack = []
        //Textures and materials
        this.textureUrl = "../images/checker_large.gif";
        this.texture = new THREE.TextureLoader().load(this.textureUrl);
        this.material = new THREE.MeshPhongMaterial({
            map: this.texture
        });
        this.geometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
        this.tiles = []
        return this;
    }

    update() {

    }

    createLevel() {
        for (let i = 0; i < this.level.length; i++) {
            this.tiles.push(new THREE.Mesh(this.geometry, this.material))
            this.tiles[this.tiles.length - 1].position.set(i * 1.5, 0, 0);
            scene.add(this.tiles[this.tiles.length - 1]);
        }
        //this.newMesh.position.set(1, 0, 0);
    }

    playTurn() {
        console.log(this.stack)
    }
}

class Tile {
    constructor(type) {

    }
}

class Player {
    constructor() {
        this.isMoving = false;
        this.loaded = false;
        this.resourceUrl = 'src/SambaDancing.fbx';
        this.action = null;
        this.loader = new THREE.FBXLoader();
        this.loader.load(
            // resource URL
            this.resourceUrl,
            // called when the resource is loaded
            (robotObj) => this.updloadSuccess(robotObj),
            // called while loading is progressing
            (xhr) => this.uploadProcessing(xhr),
            // called when loading has errors
            (error) => this.uploadError(error)
        );
    }

    update() {}

    updloadSuccess(robotObj) {
        this.loaded = true;
        //console.log(robotObj)
        robotObj.mixer = new THREE.AnimationMixer(scene);
        robotObj.scale.set(0.01, 0.01, 0.01);
        robotObj.rotation.y = Math.PI / 2;
        this.action = robotObj.mixer.clipAction(robotObj.animations[0], robotObj);
        this.action.play();

        dancers.push(robotObj);
        scene.add(robotObj);
    }

    uploadProcessing(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }

    uploadError(error) {
        console.log('An error happened');
        console.log(error)
    }
}