function gameEvents(game, level, player) {
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start drag events
    document.getElementById("DragFront").addEventListener("dragstart", event => onDragStart(event));
    document.getElementById("DragLeft").addEventListener("dragstart", event => onDragStart(event));
    document.getElementById("DragRight").addEventListener("dragstart", event => onDragStart(event));

    // DragOver events
    document.getElementById("dropzone").addEventListener("dragover", event => onDragOver(event));

    //  Drop events
    document.getElementById("dropzone").addEventListener("drop", event => onDrop(event, game));

    document.getElementById("soundBtn").addEventListener("click", () => toggleSound(game));
    
    document.getElementById("infoBtn").addEventListener("click", () => {
        console.log("info");
    });

    document.getElementById("shareBtn").addEventListener("click", () => {
        console.log("share");
    });

    document.getElementById("startGame").addEventListener("click", () => {
        game.playLevel();
        document.getElementById("mainMenu").style.display = "none";
    });

    document.getElementById("playTurn").addEventListener("click", () => {
        game.playTurn();
    });
}

function onDragStart(event) {
    console.log(event.target.id)
    event.dataTransfer.setData('text/plain', event.target.id);
    event.currentTarget.style.backgroundColor = 'black';
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function onDrop(event, game) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text');
    // Game 
    game.commands.push(id)
    // HTML
    const draggableElement = document.getElementById(id);
    // Clone and modify the element
    let cln = draggableElement.cloneNode(true);
    cln.removeEventListener('dragstart', ()=>{})
    cln.draggable = false;
    cln.classList.add("inStack");

    document.getElementById("dropzone").appendChild(cln);
    event.dataTransfer.clearData();

    if(game.commands.length > 0 && document.getElementById("playTurn").disabled) document.getElementById("playTurn").disabled = false
}

function toggleSound(game){
    game.togglePlaySound();
    if (game.ambienAudio.paused) document.getElementById("soundBtn").innerHTML = "Sound On"
    else document.getElementById("soundBtn").innerHTML = "Sound Off"
}