function gameEvents() {
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
    document.getElementById("dropzone").addEventListener("drop", event => onDrop(event));
}

function buttonEvents(game) {
    document.getElementById("soundBtn").addEventListener("click", () => {
        let sound = game.togglePlaySound();
        console.log(sound)
        if (sound) document.getElementById("soundBtn").innerHTML = "Sound off"
        else document.getElementById("soundBtn").innerHTML = "Sound on"

    });

    document.getElementById("infoBtn").addEventListener("click", () => {
        console.log("info");
    });

    document.getElementById("shareBtn").addEventListener("click", () => {
        console.log("share");
    });

    document.getElementById("startGame").addEventListener("click", () => {
        document.getElementById("startGame").style.display = "none";
        game.play();
    });
}

function onDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    event.currentTarget.style.backgroundColor = 'black';
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function onDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text');
    const draggableElement = document.getElementById(id);
    let cln = draggableElement.cloneNode(true);
    cln.removeEventListener('dragstart', ()=>{})
    //const dropzone = event.target;
    document.getElementById("dropzone").appendChild(cln);
    event.dataTransfer.clearData();
}