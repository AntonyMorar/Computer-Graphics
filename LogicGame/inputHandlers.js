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
        game.toggleInstructions();
    });

    document.getElementById("shareBtn").addEventListener("click", () => {
        game.playBtnSound();
        console.log("share");
    });

    document.getElementById("startGame").addEventListener("click", () => {
        game.playBtnSound();
        game.playGame();
        game.toggleInstructions();
    });

    document.getElementById("playTurn").addEventListener("click", () => {
        game.playBtnSound();
        game.playTurn();
    });
    /*
        document.getElementById("resetLvl").addEventListener("click", () => {
            game.resetLevel();
        });

            document.getElementById("tryAgain").addEventListener("click", () => {
            game.playBtnSound();
            game.tryLevelAgain();
        });
    */
    document.getElementById("nextLevel").addEventListener("click", () => {
        game.playBtnSound();
        game.playNextLevel();
    });

    document.getElementById("debug").addEventListener("click", () => {
        game.playBtnSound();
        game.toggleDebug();
    });


    document.getElementById("instructionsModal").addEventListener("click", () => {
        game.toggleInstructions();
    });
    document.getElementById("closeModal").addEventListener("click", () => {
        game.playBtnSound();
        game.toggleInstructions();
    });
    document.getElementById('modal').addEventListener('click', e => e.stopPropagation());
}

function onDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
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
    if (draggableElement == null) return;
    game.commands.push(id)
    // Clone and modify the element
    let cln = draggableElement.cloneNode(true);
    cln.removeEventListener('dragstart', () => {})
    cln.draggable = false;
    cln.classList.add("inStack");
    cln.removeAttribute('id');
    for (var i = 0; i < cln.childNodes.length; i++) {
        if (cln.childNodes[i].className == "number") {
            cln.removeChild(cln.childNodes[i])
            break;
        }
    }
    // Add delete btn
    let deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "x";
    deleteBtn.classList.add("delete");
    deleteBtn.addEventListener("click", () => {
        game.deleteDropItem(cln, id);
    });
    cln.appendChild(deleteBtn);
    document.getElementById("dropzone").appendChild(cln);
    event.dataTransfer.clearData();

    // Update draggable elements
    game.levelObj.removeBtn(id)

    if (game.commands.length > 0 && document.getElementById("playTurn").disabled) document.getElementById("playTurn").disabled = false
}

function toggleSound(game) {
    game.toggleSound();
}

function findRow3(node) {
    var i = 1;
    while (node = node.previousSibling) {
        if (node.nodeType === 1) {
            ++i
        }
    }
    return i;
}