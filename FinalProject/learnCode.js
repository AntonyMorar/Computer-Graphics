let renderer = null,
    scene = null,
    camera = null;

let root = null;
let playerGroup = null;
let game = null;
let level = null;
let player = null;
let hud = null;

const levelsData = [{
        level: "sflfe",
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
    let light = new THREE.DirectionalLight(0xffffff, 2.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(1, 3, 0);
    light.target.position.set(0, 0, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.5);
    scene.add(ambientLight);

    /****************************************************************************
     * Game
     */
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    game = new Game();
    hud = new HUD();
    level = new Level();
    player = new Player();

    // Now add the group to our scene
    scene.add(root);

    /****************************************************************************
     * Events
     */
    // add mouse handling so we can rotate the scene
    gameEvents(game, level, player, hud);
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
    player.update(deltat);
    /*
        if (dancers.length > 0) {
            for (dancer_i of dancers)
                dancer_i.mixer.update((deltat) * 0.001);
        }
    */
}

function run() {
    requestAnimationFrame(() => run());
    // Render the scene
    renderer.render(scene, camera);

    _update();
    // Update the animations
    TWEEN.update();
}

class Game {
    constructor() {
        if (!!Game.instance) return Game.instance;
        Game.instance = this;

        this.loaded = false;
        this.state = "start";
        this.gameOver = false;
        this.playing = false;
        this.level = 0;
        this.commands = []
        this.ambienAudio = document.createElement("audio");
        this.ambienAudio.src = "src/bg.mp3";
        //this.ambienAudio.volume = 0.25;
        this.ambienAudio.volume = 0.0;
        return this;
    }

    update() {
        if (!this.loaded && level.loaded && player.loaded) {
            hud.startButton();
        }

        if (this.state == "game" && this.playing) {
            if (!player.inAction) {
                if (this.commands.length <= 0) {
                    this.playing = false;
                    hud.togglePlayBtn(false)
                    return;
                }
                let actualCommand = this.commands.shift()
                switch (actualCommand) {
                    case 'DragFront':
                        player.isFrontTween = true;
                        break;
                    case 'DragLeft':
                        player.isLeftTween = true;
                        break;
                    case 'DragRight':
                        player.isRightTween = true;
                        break;
                    default:
                        break;
                }
                player.playTweenAnimation()
            }
        }
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
        this.state = "game";
        if (this.ambienAudio.paused) this.togglePlaySound();
        level.show();
        player.show();

        hud.toggleDragAndDrop(true)
        this.loaded = true;
    }

    playTurn() {
        this.playing = true;
        hud.togglePlayBtn(true)
        //playAnimations()
        //player.playTweenAnimation()
    }

    resetLevel() {
        this.gameOver = false;
        this.playing = false;
        this.commands = []
        player.reset();
        hud.resetDrop()
        level.setHudDraggables();
    }
}

class Level {
    constructor() {
        // s: start, f: front, e:end
        this.loaded = false;
        this.win = false;
        // Level struct
        this.level = levelsData[game.level].level;

        this.btns = levelsData[game.level].buttons;
        this.tiles = []
        this.setTiles()
        this.setHudDraggables()
        return this;
    }

    update() {
        if (this.tiles.length > 0 && !this.loaded) {
            if (this.tiles.every(this.isTileLoad)) this.loaded = true;
        }
    }

    isTileLoad(tile) {
        return (tile.loaded)
    }

    setTiles() {
        let pos = {
            x: 0,
            y: 0,
            z: 0
        }
        let dir = 0 // (0) foward - x+, (1) left - z-, (2) right - z+, (3) backward - x-,
        for (let i = 0; i < this.level.length; i++) {
            let tileType = this.level[i];

            console.log(tileType)
            if (tileType == 's') {
                let tile = new Tile({
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                });
                this.tiles.push(tile);
            } else if (tileType == 'f' || tileType == 'e') {
                let offset = {
                    x: 0,
                    y: 0,
                    z: 0
                }

                if(dir==0)offset.x = 1;
                else if(dir==1)offset.z = -1;
                else if(dir==2)offset.x = -1;
                else if(dir==3)offset.z = 1;

                pos.x += offset.x;
                pos.z += offset.z;
                console.log(pos)
                let tile = new Tile({
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                });
                this.tiles.push(tile);
            }else if(tileType == 'l'){
                dir = (dir+1)%4
                
            }else if(tileType == 'r'){
                dir--;
                if(dir < 0) dir = 3;
                console.log(dir)
            }

            if (tileType == 'e') return;
        }
        //this.loaded = true;
    }

    show() {
        if (this.loaded) {
            this.tiles.forEach(tile => {
                root.add(tile.obj);
            });
        }
    }

    // Set and reset the hud draggables relative to game gamelevel data
    setHudDraggables() {
        this.btns = levelsData[game.level].buttons;
        console.log(this.btns)
        hud.resetDrag();

        for (const [key, value] of Object.entries(levelsData[game.level].buttons)) {
            //console.log(`${key}: ${value}`);
            if (value > 0) hud.appendDragable(key, value)
        }
    }

    //with actual level values
    removeBtn(id) {
        this.btns[id] -= 1;
        hud.updateDraggable(id, this.btns[id]);
    }

}

class Tile {
    constructor(pos) {
        this.loaded = false;
        this.resourceUrl = 'src/tileB.fbx';
        this.material = new THREE.MeshStandardMaterial({
            color: 0xffffff
        });
        this.obj = null;
        this.loader = new THREE.FBXLoader();
        this.loader.load(
            // resource URL
            this.resourceUrl,
            // called when the resource is loaded
            (tileObj) => this.updloadSuccess(tileObj, pos),
            // called while loading is progressing
            (xhr) => this.uploadProcessing(xhr),
            // called when loading has errors
            (error) => this.uploadError(error)
        );
        return this;
    }

    updloadSuccess(tileObj, pos) {
        tileObj.children[0].material = this.material;
        tileObj.scale.set(0.01, 0.01, 0.01);
        tileObj.position.set(pos.x, pos.y, pos.z)
        this.obj = tileObj;
        this.loaded = true;
    }

    uploadProcessing(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded tile');
    }

    uploadError(error) {
        console.log('An error happened');
        console.log(error)
    }
}

class Player {
    constructor() {
        // General
        this.loaded = false;
        this.inAction = false;
        this.action = 'idle'
        this.obj = null;
        //Resources
        this.resourceUrl = 'src/robot.fbx';
        this.textureUrl = 'src/robotTexture.png';
        this.texture = new THREE.TextureLoader().load(this.textureUrl);
        this.textureEm = new THREE.TextureLoader().load('src/robotEmissive.png');
        this.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.texture,
            emissive: 0xffffff,
            emissiveMap: this.textureEm
        });
        // Animation
        this.actionAnim = null;
        //Tween durations
        this.durationTween = 1.5; // sec
        //Front anim
        this.frontTween = null;
        this.isFrontTween = false;
        // LeftAnim
        this.leftTween = null;
        this.isLeftTween = false;
        // RightAnim
        this.rightTween = null;
        this.isRightTween = false;
        // Loader
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

    update(deltat) {
        if (this.loaded) {
            if (this.obj.mixer != null) this.obj.mixer.update((deltat) * 0.001);
        }
    }

    show() {
        playerGroup = new THREE.Object3D;
        playerGroup.add(this.obj)
        root.add(playerGroup);
    }

    reset() {
        this.inAction = false;
        this.action = 'idle'
        if (this.frontTween) this.frontTween.stop()
        if (this.leftTween) this.leftTween.stop()
        if (this.rightTween) this.rightTween.stop()
        playerGroup.position.set(0, 0, 0)
        playerGroup.rotation.set(0, 0, 0)
    }

    updloadSuccess(robotObj) {
        robotObj.children[0].material = this.material;
        //console.log(robotObj.children[0].material)

        robotObj.mixer = new THREE.AnimationMixer(scene);
        robotObj.scale.set(0.01, 0.01, 0.01);
        robotObj.rotation.y = Math.PI / 2;

        if (robotObj.animations.length > 0) {
            this.actionAnim = robotObj.mixer.clipAction(robotObj.animations[0], robotObj);
            this.actionAnim.play();
        }

        this.obj = robotObj;
        //dancers.push(robotObj);
        this.loaded = true;
    }

    uploadProcessing(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }

    uploadError(error) {
        console.log('An error happened');
        console.log(error)
    }

    playTweenAnimation() {
        if (this.inAction) return;
        // Front animation
        if (this.frontTween) this.frontTween.stop(); // override tween animation
        if (this.isFrontTween) {
            let target = new THREE.Vector3(1, 0, 0).applyQuaternion(playerGroup.quaternion)
            this.inAction = true;
            this.action = 'front';
            this.frontTween =
                new TWEEN.Tween(playerGroup.position).to({
                    x: playerGroup.position.x + target.x,
                    y: playerGroup.position.y + target.y,
                    z: playerGroup.position.z + target.z
                }, this.durationTween * 1000)
                .interpolation(TWEEN.Interpolation.Linear)
                .delay(0)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .repeat(0)
                .start()
                .onComplete(() => {
                    this.isFrontTween = false;
                    this.inAction = false;
                    this.action = 'idle';
                })
        }

        if (this.leftTween) this.leftTween.stop(); // override tween animation
        if (this.isLeftTween) {
            this.inAction = true;
            this.action = 'left';
            this.leftTween =
                new TWEEN.Tween(playerGroup.rotation).to({
                    y: playerGroup.rotation.y + Math.PI / 2
                }, this.durationTween * 1000)
                .interpolation(TWEEN.Interpolation.Linear)
                .delay(0)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .repeat(0)
                .start()
                .onComplete(() => {
                    this.isLeftTween = false;
                    this.inAction = false;
                    this.action = 'idle';
                })
        }

        if (this.rightTween) this.rightTween.stop(); // override tween animation
        if (this.isRightTween) {
            this.inAction = true;
            this.action = 'right';
            this.rightTween =
                new TWEEN.Tween(playerGroup.rotation).to({
                    y: playerGroup.rotation.y - Math.PI / 2
                }, this.durationTween * 1000)
                .interpolation(TWEEN.Interpolation.Linear)
                .delay(0)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .repeat(0)
                .start()
                .onComplete(() => {
                    this.isRightTween = false;
                    this.inAction = false;
                    this.action = 'idle';
                })
        }
    }
}

class HUD {
    constructor() {
        // In game items
        this.dragAndDrop = document.getElementById("dragAndDrop");
        this.dropzone = document.getElementById("dropzone");
        this.startBtn = document.getElementById("startGame");
        this.playBtn = document.getElementById("playTurn");
        this.draggables = document.getElementById("draggables");
    }

    toggleDragAndDrop(visible) {
        if (visible) dragAndDrop.style.opacity = 1;
        else dragAndDrop.style.opacity = 0;
    }

    togglePlayBtn(disable) {
        if (disable) this.playBtn.disabled = true;
        else this.playBtn.disabled = false;
    }

    resetDrag() {
        while (this.draggables.firstChild) this.draggables.removeChild(this.draggables.lastChild);
    }

    resetDrop() {
        while (this.dropzone.firstChild) this.dropzone.removeChild(this.dropzone.lastChild);
        this.playBtn.disabled = true;
    }

    startButton() {
        this.startBtn.disabled = false;
        this.startBtn.innerHTML = 'Start Game'
    }

    appendDragable(id, num = 1) {
        let draggable = document.createElement('div');
        draggable.id = id;
        draggable.innerHTML = "Null";
        switch (id) {
            case 'DragFront':
                draggable.innerHTML = "Front";
                break;
            case 'DragLeft':
                draggable.innerHTML = "Left";
                break;
            case 'DragRight':
                draggable.innerHTML = "Right";
                break;
            default:
                break;
        }

        draggable.className = 'draggable';
        draggable.draggable = true;
        // Start drag events
        draggable.addEventListener("dragstart", event => onDragStart(event));

        if (num > 0) {
            let number = document.createElement('span');
            number.innerHTML = num;
            number.className = 'number';
            draggable.appendChild(number)
        } else {
            draggable.draggable = false;
            draggable.classList.add("disabled");
        }
        this.draggables.appendChild(draggable);
    }

    updateDraggable(id, num) {
        let draggable = document.getElementById(id);
        if (!draggable) return;

        for (var i = 0; i < draggable.childNodes.length; i++) {
            if (draggable.childNodes[i].className == "number") {
                if (num > 0) {
                    draggable.childNodes[i].innerHTML = num
                } else {
                    draggable.draggable = false;
                    draggable.classList.add("disabled");
                    draggable.removeChild(draggable.childNodes[i])
                }
                break;
            }
        }
        console.log(draggable)
    }
}