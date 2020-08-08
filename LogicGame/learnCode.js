let renderer = null,
    scene = null,
    camera = null;

let game = null;
let level = null;
let player = null;
let hud = null;

let root = null;
let playerGroup = null;

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
    camera.position.set(1.5, 4, 7.5);
    camera.rotation.x = 11 * Math.PI / 6;
    scene.add(camera);

    /****************************************************************************
     * Light
     */
    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight(0xffffff, 1.3);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(1, 3, 0);
    light.target.position.set(0, 0, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xe0faff, 0.5);
    scene.add(ambientLight);

    /****************************************************************************
     * Game
     */
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    game = new Game();
    hud = new HUD();
    let deepClone = JSON.parse(JSON.stringify(game.levelsData[game.level]));
    game.levelObj = new Level(deepClone);
    player = new Player();

    //root.rotation.y = 11 * Math.PI / 6;
    // Now add the group to our scene
    scene.add(root);

    /****************************************************************************
     * Events
     */
    // add mouse handling so we can rotate the scene
    gameEvents(game);
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
    //if (level) level.update();
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
        // Singleton -----------
        if (!!Game.instance) return Game.instance;
        Game.instance = this;
        // General ---------------
        this.loaded = false;
        this.playing = false; // If characer are executing commands
        this.levelWin = false; // If player wins the level
        this.state = "menu";
        this.debug = false;
        this.instructions = false; // Show a the level tutorial
        // Menu -------------
        this.actualMenu = "main"; // "main" "win" "end" 
        this.hudUpdated = false;
        // Level -------------
        this.level = 0;
        this.levelObj = null;
        this.commands = []
        this.levelsData = [{
                level: "se",
                buttons: {
                    DragFront: 2,
                    DragLeft: 0,
                    DragRight: 0
                }
            },
            {
                level: "slfre",
                buttons: {
                    DragFront: 2,
                    DragLeft: 1,
                    DragRight: 1
                }
            },
            {
                level: "sflfrffre",
                buttons: {
                    DragFront: 5,
                    DragLeft: 2,
                    DragRight: 2
                }
            },
        ]
        // Animation
        this.isSceneOut = false;
        this.isSceneIn = false;
        // Audio -------------
        this.volume = false; // Sound volume
        this.ambienAudio = document.createElement("audio");
        this.ambienAudio.src = "src/bg.mp3";
        this.ambienAudio.loop = true;
        this.ambienAudio.volume = 0.25;
        this.robotAudio = document.createElement("audio");
        this.robotAudio.volume = 0.3;
        this.hudAudio = document.createElement("audio");
        this.hudAudio.src = "src/click.mp3";
        this.hudAudio.volume = 0.35;
        this.levelAudio = document.createElement("audio");
        this.levelAudio.src = "src/winLevel.mp3";
        this.levelAudio.volume = 0.25;
        this.happyAudio = document.createElement("audio");
        this.happyAudio.src = 'src/robotHappy.wav'
        this.happyAudio.volume = 0.5;
        return this;

    }

    update() {
        // If player and level exist and
        if (this.levelObj && player && this.levelObj.loaded && player.loaded) {
            if (!this.loaded) this.loaded = true;

            if (!player.isSceneOutTween) {
                this.isSceneOut = false;
            }
        }

        if (this.state == "menu") {
            // Check if all the assets are loaded
            if (!this.hudUpdated) {
                if (this.loaded) {
                    hud.startButton();
                    this.hudUpdated = true;
                }
            }

            switch (this.actualMenu) {
                case "main":
                    break;
                case "win":
                    break;
                case "end":
                    break;
                default:
                    break;
            }
        } else if (this.state == "game") {
            if (!player.inAction && this.playing) {
                if (this.commands.length <= 0) {
                    this.playing = false;
                    //Collision detenction, chack if player win or lose
                    game.levelObj.tiles.forEach(tile => {
                        if (tile.boxColider && player.boxColider) {
                            this.levelWin = tile.boxColider.intersectsBox(player.boxColider);
                            if (this.levelWin) game.playHappySound()
                            // Game out animation
                            hud.toggleDragAndDrop();
                            this.sceneOut();
                            this.state = "gameOver"
                        }
                    });
                    return;
                } else {
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
        } else if (this.state == "gameOver") {
            //Check if scene out animation over
            if (!this.isSceneOut) {
                if (this.debug) this.toggleDebug(); //
                // If player win
                if (this.levelWin) {
                    // If win last level
                    if (this.level >= this.levelsData.length - 1) {
                        this.state = "menu"
                        this.actualMenu = "end"
                        game.playWinLevel();
                        hud.openMenu(this.actualMenu)
                    } else { // Next Level menu
                        this.state = "menu"
                        this.actualMenu = "win"
                        this.hudUpdated = false;
                        game.playWinLevel();
                        hud.openMenu(this.actualMenu)
                        this.loadNextLevel();
                    }
                } else { // If player lose
                    player.reset();
                    this.sceneIn();
                    this.resetLevelParams();
                    this.state = "game"
                }
            }
        } else if (this.state == "transition") {
            if (this.loaded) this.sceneIn()
        }

        // Update the level object
        if (this.levelObj) this.levelObj.update();
    }

    playGame() {
        if (!game.volume) game.toggleSound();
        this.state = "game";
        hud.closeMenu();
        this.sceneIn();
    }

    playTurn() {
        this.playing = true;
        hud.togglePlayBtn(true)
    }

    sceneIn() {
        this.isSceneIn = true;
        // Add level to the scene if they are not
        if (!this.levelObj.inThreeScene) this.levelObj.add();
        this.levelObj.sceneIn();
        // Add player to the scene
        if (!player.inThreeScene) player.add();
        player.sceneIn();
        // Add Drag and drop Hud
        hud.toggleDragAndDrop();
        hud.closeMenu();
    }

    //Scene out all elements in scene
    sceneOut() {
        this.isSceneOut = true;
        player.sceneOut();
        this.levelObj.sceneOut();

    }

    loadNextLevel() {
        // Change game states
        this.loaded = false;
        //Remove old elements
        this.levelObj.delete();
        this.levelObj = null;
        // Update
        this.level++;
        // Create new level
        let deepClone = JSON.parse(JSON.stringify(this.levelsData[this.level]));
        this.levelObj = new Level(deepClone);
    }

    playNextLevel() {
        this.state = "game"
        player.reset();
        this.sceneIn();
        this.resetLevelParams();
    }

    resetLevelParams() {
        this.playing = false; // If characer are executing commands
        this.levelWin = false; // If player wins the level
        this.state = "game";
        this.commands = []

        hud.setHudDraggables();
    }

    deleteDropItem(cln, id) {
        let index = findRow3(cln);
        let newArr = []

        this.levelObj.addBtn(id)

        delete this.commands[index - 1]
        for (let i = 0; i < this.commands.length; i++) {
            if (this.commands[i] != undefined || this.commands[i] != null) {
                newArr.push(this.commands[i])
            }
        }
        this.commands = newArr;
        cln.remove();
    }

    toggleDebug() {
        if (this.loaded) {
            this.debug = !this.debug;
            if (player.boxColiderH) player.boxColiderH.visible = !player.boxColiderH.visible;
            game.levelObj.tiles.forEach(tile => {
                if (tile.boxColiderH) tile.boxColiderH.visible = !tile.boxColiderH.visible
            });
        }
    }

    toggleAmbienSound() {
        if (this.ambienAudio.paused) {
            this.ambienAudio.play();
            document.getElementById("soundBtn").innerHTML = "Sound Off"
            return true;
        } else {
            this.ambienAudio.pause();
            document.getElementById("soundBtn").innerHTML = "Sound On"
            return false;
        }
    }

    playBtnSound() {
        this.hudAudio.play();
    }

    playWinLevel() {
        this.levelAudio.play();
    }

    playSound(soundSrc) {
        this.robotAudio.pause();
        this.robotAudio.src = soundSrc;
        this.robotAudio.play();
    }

    playHappySound() {
        this.happyAudio.play();

    }

    toggleSound() {
        this.toggleAmbienSound();

        if (this.volume) { // Off volume
            this.robotAudio.volume = 0;
            this.hudAudio.volume = 0;
            this.levelAudio.volume = 0;
            this.happyAudio.volume = 0;
            this.volume = false;
        } else { // On volume
            this.robotAudio.volume = 0.3;
            this.hudAudio.volume = 0.35;
            this.levelAudio.volume = 0.25;
            this.happyAudio.volume = 0.5;
            this.volume = true;
        }
    }

    toggleInstructions(){
        if(this.instructions){
            document.getElementById("instructionsModal").style.display = "none";
        }else{
            document.getElementById("instructionsModal").style.display = "flex";
        }
        this.instructions = !this.instructions;
    }
}

class Level {
    constructor(levelData) {
        this.loaded = false;
        this.inThreeScene = false;
        //Resources ----------------
        this.tileTextureUrl = 'src/tileTexture.png'
        this.tileTextureEndUrl = 'src/tileTextureEnd.png';
        this.tileTexture = new THREE.TextureLoader().load(this.tileTextureUrl);
        this.tileTextureEnd = new THREE.TextureLoader().load(this.tileTextureEndUrl);
        this.materialTile = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.tileTexture,
        });
        this.materialTileEnd = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.tileTextureEnd,
        });
        // Level struct ----------------
        this.level = levelData.level; // s: start, f: front, e:end
        this.buttons = levelData.buttons;
        this.tiles = []
        this.setTiles()
        return this;
    }

    update() {
        // Check if tiles loaded
        if (this.tiles.length > 0 && !this.loaded) {
            if (this.tiles.every(this.isTileLoad)) {
                hud.setHudDraggables();
                this.loaded = true;
            }
        }

        // Update all tiles
        if (this.loaded) {
            this.tiles.forEach(tile => {
                tile.update();
            });
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

            if (tileType == 's') {
                let tile = new Tile({
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                }, tileType);
                this.tiles.push(tile);
            } else if (tileType == 'f' || tileType == 'e') {
                let offset = {
                    x: 0,
                    y: 0,
                    z: 0
                }

                if (dir == 0) offset.x = 1;
                else if (dir == 1) offset.z = -1;
                else if (dir == 2) offset.x = -1;
                else if (dir == 3) offset.z = 1;

                pos.x += offset.x;
                pos.z += offset.z;
                let tile = new Tile({
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                }, tileType);
                this.tiles.push(tile);
            } else if (tileType == 'l') {
                dir = (dir + 1) % 4

            } else if (tileType == 'r') {
                dir--;
                if (dir < 0) dir = 3;
            }

            if (tileType == 'e') return;
        }
    }

    add() {
        if (this.loaded) {
            this.tiles.forEach(tile => {
                tile.add();
            });
            this.inThreeScene = true;
        }
        console.warn("Tiles not loaded. Imposible to add to scene")
    }

    sceneIn() {
        if (this.loaded) {
            this.tiles.forEach(tile => {
                tile.sceneIn();
            });
        }
    }

    sceneOut() {
        if (this.loaded) {
            this.tiles.forEach(tile => {
                tile.sceneOut();
            });
        }
    }

    //with actual level values
    removeBtn(id) {
        this.buttons[id] -= 1;
        hud.updateDraggable(id, this.buttons[id]);
    }

    addBtn(id) {
        console.log(this.buttons);
        this.buttons[id] += 1;
        hud.updateDraggable(id, this.buttons[id]);
    }

    delete() {
        if (this.loaded) {
            this.tiles.forEach(tile => {
                root.remove(tile.obj)
                if (tile.boxColiderH) scene.remove(tile.boxColiderH);
                //tile.material.dispose();
            });
            this.materialTile.dispose();
            this.materialTileEnd.dispose()
            delete this.level;
            delete this.buttons;
            this.tiles = []
        } else {
            return false
        }
    }
}

class Tile {
    constructor(pos, type) {
        // General ------------
        this.loaded = false;
        this.inThreeScene = false;
        this.type = type;
        //Resources ----------------
        this.resourceUrl = 'src/tileB.fbx';
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
        // Collider (Only e tile use collider) ----------
        this.boxColider = null; // Box 3 - Represents an axis-aligned bounding box
        this.boxColiderH = null; // Helper object to visualize a Box3
        // Animation ------------
        this.sceneInTween = null;
        this.isSceneInTween = false;
        // SceneOut
        this.sceneOutTween = null;
        this.isSceneOutTween = false;
        return this;
    }

    update() {
        if (this.boxColider) {
            let newBounds = this.obj.children[0].geometry.boundingBox;
            newBounds.max.z = 1
            this.boxColider.copy(newBounds).applyMatrix4(this.obj.children[0].matrixWorld);
        }
    }

    updloadSuccess(tileObj, pos) {
        tileObj.children[0].material = (this.type != "e") ? game.levelObj.materialTile : game.levelObj.materialTileEnd
        tileObj.scale.set(0.01, 0.01, 0.01);
        tileObj.position.set(pos.x, pos.y, pos.z)
        this.obj = tileObj;
        // Add collider
        if (this.type == 'e') {
            this.obj.children[0].geometry.computeBoundingBox();
            //this.boxColider = new THREE.Box3();
            this.boxColider = new THREE.Box3().setFromObject(this.obj);
            this.boxColiderH = new THREE.Box3Helper(this.boxColider, 0xff0033);
            this.boxColiderH.visible = false;
        }
        this.loaded = true;
    }

    uploadProcessing(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded tile');
    }

    uploadError(error) {
        console.log('An error happened');
        console.log(error)
    }

    // Add objects to the scene
    add() {
        root.add(this.obj);
        if (this.boxColiderH) scene.add(this.boxColiderH);
        this.inThreeScene = true; // In three.js scene
    }

    //Scene in animation
    sceneIn() {
        this.isSceneInTween = true;
        this.playTweenAnimation();
    }
    //Scene out animation
    sceneOut() {
        //Scene in animation
        this.isSceneOutTween = true;
        this.playTweenAnimation();
    }

    playTweenAnimation() {
        // Scene In animation
        if (this.sceneInTween) this.sceneInTween.stop(); // override tween animation
        if (this.isSceneInTween) {
            let deepTempPos = JSON.parse(JSON.stringify(this.obj.position)); // Save the actual position 
            this.obj.position.set(this.obj.position.x, 5, this.obj.position.z);
            this.frontTween =
                new TWEEN.Tween(this.obj.position).to({
                    x: deepTempPos.x,
                    y: 0,
                    z: deepTempPos.z
                }, 2.5 * 1000)
                .interpolation(TWEEN.Interpolation.Bezier)
                .delay(0)
                .easing(TWEEN.Easing.Bounce.Out)
                .repeat(0)
                .start()
                .onComplete(() => {
                    this.isSceneInTween = false;
                })
        }
        // Scene Out animation
        if (this.sceneOutTween) this.sceneInTween.stop(); // override tween animation
        if (this.isSceneOutTween) {
            this.frontTween =
                new TWEEN.Tween(this.obj.position).to({
                    x: this.obj.position.x,
                    y: this.obj.position.y - 8,
                    z: this.obj.position.z
                }, 1.5 * 1000)
                .interpolation(TWEEN.Interpolation.Bezier)
                .delay(0)
                .easing(TWEEN.Easing.Back.In)
                .repeat(0)
                .start()
                .onComplete(() => {
                    this.isSceneOutTween = false;
                })
        }
    }
}

class Player {
    constructor() {
        // General --------
        this.loaded = false;
        this.inThreeScene = false;
        this.inAction = false;
        this.action = 'idle'
        this.obj = null;
        //Resources ----------
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
        playerGroup = new THREE.Object3D;
        // Animation ------------
        this.actionAnim = null;
        //Tween durations
        this.durationTween = 1.3; // sec
        //Front anim
        this.frontTween = null;
        this.isFrontTween = false;
        // LeftAnim
        this.leftTween = null;
        this.isLeftTween = false;
        // RightAnim
        this.rightTween = null;
        this.isRightTween = false;
        // SceneIn
        this.sceneInTween = null;
        this.isSceneInTween = false;
        // SceneOut
        this.sceneOutTween = null;
        this.isSceneOutTween = false;
        // Raycaster( origin, direction, near, far ) ------------
        this.raycaster = new THREE.Raycaster(playerGroup.position, new THREE.Vector3(0, -1, 0), 0, 10);
        // Collider ----------
        this.boxColider = null; // Box 3 - Represents an axis-aligned bounding box
        this.boxColiderH = null; // Helper object to visualize a Box3
        // Loader ----------
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
            //console.log("-----> ", this.action)
            // Rig animation 
            if (this.obj.mixer != null) this.obj.mixer.update((deltat) * 0.001);

            // Ad gravity to player
            if (this.action == "fall") {
                playerGroup.position.y -= 0.005 * deltat;
                //Avoid inifinite falling
                if (playerGroup.position.y <= -9) {
                    this.inAction = false;
                    this.action = "idle"
                }
            }

            // Update the box collider
            if (this.action != 'idle' && this.action != 'fall' && this.boxColider) {
                this.boxColider = new THREE.Box3().setFromObject(this.obj);
                if (this.boxColiderH) this.boxColiderH.update();
            }
        }
    }

    add() {
        playerGroup.add(this.obj);
        if (this.boxColiderH) scene.add(this.boxColiderH);
        root.add(playerGroup);
        this.inThreeScene = true;
    }
    //Scene in animation
    sceneIn() {
        this.isSceneInTween = true;
        this.playTweenAnimation();
    }

    sceneOut() {
        this.isSceneOutTween = true;
        this.playTweenAnimation();
    }

    reset() {
        this.inAction = false;
        this.action = 'idle'
        this.resetTweens();
        playerGroup.position.set(0, 0, 0)
        playerGroup.rotation.set(0, 0, 0)
    }

    resetTweens() {
        if (this.frontTween) this.frontTween.stop()
        if (this.leftTween) this.leftTween.stop()
        if (this.rightTween) this.rightTween.stop()
    }

    updloadSuccess(robotObj) {
        robotObj.children[0].material = this.material;
        robotObj.mixer = new THREE.AnimationMixer(scene);
        robotObj.scale.set(0.01, 0.01, 0.01);
        robotObj.rotation.y = Math.PI / 2;

        if (robotObj.animations.length > 0) {
            this.actionAnim = robotObj.mixer.clipAction(robotObj.animations[0], robotObj);
            this.actionAnim.play();
        }

        this.obj = robotObj;

        // Add collider
        this.boxColider = new THREE.Box3().setFromObject(this.obj);
        //this.boxColiderH = new THREE.Box3Helper( this.boxColider, 0x0022ff ); //BOX3 Helper
        this.boxColiderH = new THREE.BoxHelper(this.obj, 0xff0033);
        this.boxColiderH.visible = false;
        this.boxColiderH.update();

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

    checkFloor() {
        let intersects = this.raycaster.intersectObjects(root.children, true, []);
        if (intersects.length <= 0) {
            game.playSound("src/fall.mp3");
            game.commands = []
            this.inAction = true;
            this.action = "fall"
        } else {
            this.inAction = false;
            this.action = "idle"
        }
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
                .interpolation(TWEEN.Interpolation.Bezier)
                .delay(0)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .repeat(0)
                .start()
                .onStart(() => {
                    game.playSound("src/robotFront.mp3");
                })
                .onComplete(() => {
                    this.isFrontTween = false;
                    this.checkFloor();
                })
        }
        // Left animation
        if (this.leftTween) this.leftTween.stop(); // override tween animation
        if (this.isLeftTween) {
            game.playSound("src/robotRot.mp3");

            this.inAction = true;
            this.action = 'left';
            this.leftTween =
                new TWEEN.Tween(playerGroup.rotation).to({
                    y: playerGroup.rotation.y + Math.PI / 2
                }, this.durationTween * 1000)
                .interpolation(TWEEN.Interpolation.Bezier)
                .delay(0)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .repeat(0)
                .start()
                .onStart(() => {
                    game.playSound("src/robotRot.mp3");
                })
                .onComplete(() => {
                    this.isLeftTween = false;
                    this.inAction = false;
                    this.action = 'idle';
                })
        }
        // Right animation
        if (this.rightTween) this.rightTween.stop(); // override tween animation
        if (this.isRightTween) {

            this.inAction = true;
            this.action = 'right';
            this.rightTween =
                new TWEEN.Tween(playerGroup.rotation).to({
                    y: playerGroup.rotation.y - Math.PI / 2
                }, this.durationTween * 1000)
                .interpolation(TWEEN.Interpolation.Bezier)
                .delay(0)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .repeat(0)
                .start()
                .onStart(() => {
                    game.playSound("src/robotRot.mp3");
                })
                .onComplete(() => {
                    this.isRightTween = false;
                    this.inAction = false;
                    this.action = 'idle';
                })
        }
        // Scene In animation
        if (this.sceneInTween) this.sceneInTween.stop(); // override tween animation
        if (this.isSceneInTween) {
            //let deepTempPos = JSON.parse(JSON.stringify(playerGroup.position)); // Save the actual position 
            playerGroup.position.set(0, 5, 0);
            this.inAction = true;
            this.action = 'transition';
            this.frontTween =
                new TWEEN.Tween(playerGroup.position).to({
                    x: 0,
                    y: 0,
                    z: 0
                }, 2.5 * 1000)
                .interpolation(TWEEN.Interpolation.Bezier)
                .delay(0)
                .easing(TWEEN.Easing.Bounce.Out)
                .repeat(0)
                .start()
                .onComplete(() => {
                    this.isSceneInTween = false;
                    this.inAction = false;
                    this.action = 'idle';
                    //game.state = 'game';
                })
        }
        // Scene Out animation
        if (this.sceneOutTween) this.sceneInTween.stop(); // override tween animation
        if (this.isSceneOutTween) {
            this.inAction = true;
            this.action = 'transition';
            this.frontTween =
                new TWEEN.Tween(playerGroup.position).to({
                    x: playerGroup.position.x,
                    y: playerGroup.position.y - 8,
                    z: playerGroup.position.z
                }, 1.5 * 1000)
                .interpolation(TWEEN.Interpolation.Bezier)
                .delay(0)
                .easing(TWEEN.Easing.Back.In)
                .repeat(0)
                .start()
                .onComplete(() => {
                    this.isSceneOutTween = false;
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
        this.draggables = document.getElementById("draggables");
        this.dropzone = document.getElementById("dropzone");
        this.startBtn = document.getElementById("startGame");
        this.playBtn = document.getElementById("playTurn");
        //Menus
        this.levelComplete = document.getElementById("levelComplete");
        this.mainMenu = document.getElementById("mainMenu");
        this.endMenu = document.getElementById("endMenu");
    }

    toggleDragAndDrop() {
        if (dragAndDrop.style.display == "flex") dragAndDrop.style.display = "none";
        else dragAndDrop.style.display = "flex";
    }

    clearDrag() {
        while (this.draggables.firstChild) this.draggables.removeChild(this.draggables.lastChild);
    }

    clearDrop() {
        while (this.dropzone.firstChild) this.dropzone.removeChild(this.dropzone.lastChild);
        this.playBtn.disabled = true;
    }

    // Clear and Set the hud draggables relative to game gamelevel data
    setHudDraggables() {
        // this.buttons = game.levelsData[game.level].buttons;
        game.levelObj.buttons = JSON.parse(JSON.stringify(game.levelsData[game.level].buttons));
        this.clearDrop();
        this.clearDrag();

        for (const [key, value] of Object.entries(game.levelsData[game.level].buttons)) {
            //console.log(`${key}: ${value}`);
            if (value > 0) this.appendDragable(key, value)
        }
    }

    // Add html visual draggable
    appendDragable(id, num = 1) {
        let draggable = document.createElement('div');
        let imgArrow = document.createElement("img");
        imgArrow.draggable = false;
        draggable.id = id;
        switch (id) {
            case 'DragFront':
                imgArrow.src = "src/frontArrow.png";
                draggable.appendChild(imgArrow)
                //draggable.innerHTML = "Front";
                break;
            case 'DragLeft':
                imgArrow.src = "src/leftArrow.png";
                draggable.appendChild(imgArrow)
                //draggable.innerHTML = "Left";
                break;
            case 'DragRight':
                imgArrow.src = "src/rightArrow.png";
                draggable.appendChild(imgArrow)
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

    // Change the dragable on every drop
    updateDraggable(id, num) {
        let draggable = document.getElementById(id);
        if (!draggable) return;

        for (var i = 0; i < draggable.childNodes.length; i++) {
            if (draggable.childNodes[i].className == "number") {
                if (num > 0) {
                    draggable.childNodes[i].innerHTML = num;
                    draggable.draggable = true;
                    draggable.classList.remove("disabled");
                } else {
                    draggable.draggable = false;
                    draggable.classList.add("disabled");
                    draggable.childNodes[i].innerHTML = 0;
                }
                break;
            }
        }
    }

    //Open specific menu
    openMenu(menu) {
        switch (menu) {
            case "main":
                this.mainMenu.style.display = "block";
                break;
            case "win":
                this.levelComplete.style.display = "block";
                break;
            case "end":
                this.endMenu.style.display = "block"
                break;
            default:
                break;
        }
    }

    // Close all menus
    closeMenu() {
        this.levelComplete.style.display = "none";
        this.mainMenu.style.display = "none";
        this.endMenu.style.display = "none";
    }

    togglePlayBtn(disable) {
        if (disable) this.playBtn.disabled = true;
        else this.playBtn.disabled = false;
    }

    startButton() {
        this.startBtn.disabled = false;
        this.startBtn.innerHTML = 'Start Game';
    }
}