function gameEvents(game) {
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // DragOver events
    document.getElementById("dropzone").addEventListener("dragover", event => onDragOver(event));

    //  Drop events
    document.getElementById("dropzone").addEventListener("drop", event => onDrop(event, game));

    document.getElementById("soundBtn").addEventListener("click", () => toggleSound(game));
    
    document.getElementById("infoBtn").addEventListener("click", () => {
        game.playBtnSound();
        console.log("info");
    });

    document.getElementById("shareBtn").addEventListener("click", () => {
        game.playBtnSound();
        console.log("share");
    });

    document.getElementById("startGame").addEventListener("click", () => {
        game.playBtnSound();
        game.playGame();
    });

    document.getElementById("playTurn").addEventListener("click", () => {
        game.playBtnSound();
        game.playTurn();
    });
/*
    document.getElementById("resetLvl").addEventListener("click", () => {
        game.resetLevel();
    });
*/
    document.getElementById("nextLevel").addEventListener("click", () => {
        game.playBtnSound();
        game.sceneIn();
    });

    document.getElementById("tryAgain").addEventListener("click", () => {
        game.playBtnSound();
        game.resetLevelParams();
    });

    document.getElementById("debug").addEventListener("click", () => {
        game.playBtnSound();
        game.toggleDebug();
    });
}

function onDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    //event.currentTarget.style.backgroundColor = 'black';
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function onDrop(event, game) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text');
    // HTML
    const draggableElement = document.getElementById(id);
    if(draggableElement==null) return;
    game.commands.push(id)
    // Clone and modify the element
    let cln = draggableElement.cloneNode(true);
    cln.removeEventListener('dragstart', ()=>{})
    cln.draggable = false;
    cln.classList.add("inStack");
    cln.removeAttribute('id');
    for (var i = 0; i < cln.childNodes.length; i++) {
        if (cln.childNodes[i].className == "number") {
            cln.removeChild(cln.childNodes[i])
            break;
        }        
    }
    document.getElementById("dropzone").appendChild(cln);
    event.dataTransfer.clearData();

    // Update draggable elements
    game.levelObj.removeBtn(id)

    if(game.commands.length > 0 && document.getElementById("playTurn").disabled) document.getElementById("playTurn").disabled = false
}

function toggleSound(game){
    game.toggleSound();
}