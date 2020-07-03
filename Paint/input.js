function drawEvents(tool) {
    document.addEventListener("mousemove", event => {
        tool.x = event.clientX - cBounds.x;
        tool.y = event.clientY - cBounds.y;
    });

    document.addEventListener("mousedown", event => {
        tool.startDraw = true;
        tool.isDrawing = true;
    });

    document.addEventListener("mousemove", event => {

    });

    document.addEventListener("mouseup", event => {
        tool.isDrawing = false;
    });
}

// Tools handler
function toolsEvent(tool) {
    document.getElementById("brushSize").oninput = function (event) {
        tool.stroke = event.target.value;
        document.getElementById("brushSizeValue").innerHTML = event.target.value;
    };

    document.getElementById("brushColor").oninput = function (event) {
        tool.color = event.target.value
    };
}

function programEvents(program){
    document.getElementById("clear").addEventListener("click", function () {
        program.clearCanvas = true;
    });

    document.getElementById("save").addEventListener("click", function () {
        console.log("save")
        program.downloadCanvas();
    });

    document.getElementById("brush").addEventListener("click", function () {
        program.selectTool("brush");
        selectToolUI("brush");
    });

    document.getElementById("pen").addEventListener("click", function () {
        program.selectTool("pen");
        selectToolUI("pen");
    });

    document.getElementById("eraser").addEventListener("click", function () {
        program.selectTool("eraser");
        selectToolUI("eraser");
    });
}

function selectToolUI(newTool){
    tools.forEach(tool => {
        document.getElementById(tool).classList.remove("selected");
    });
    document.getElementById(newTool).classList.add("selected");
}