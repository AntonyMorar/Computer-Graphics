function drawEvents(brush) {
    document.addEventListener("mousemove", event => {
        brush.x = event.clientX - cBounds.x;
        brush.y = event.clientY - cBounds.y;
    });

    document.addEventListener("mousedown", event => {
        brush.startDraw = true;
        brush.isDrawing = true;
    });

    document.addEventListener("mousemove", event => {

    });

    document.addEventListener("mouseup", event => {
        brush.isDrawing = false;
    });
}

// Tools handler
function toolsEvent(brush) {
    document.getElementById("brushSize").oninput = function (event) {
        brush.stroke = event.target.value;
        document.getElementById("brushSizeValue").innerHTML = event.target.value;
    };

    document.getElementById("brushColor").oninput = function (event) {
        brush.color = event.target.value
    };
}

function programEvents(program){
    document.getElementById("clear").addEventListener("click", function () {
        program.clearCanvas = true;
    });

    document.getElementById("brush").addEventListener("click", function () {
        program.selectTool("brush")
    });

    document.getElementById("pen").addEventListener("click", function () {
        program.selectTool("pen")
    });

    document.getElementById("eraser").addEventListener("click", function () {
        program.selectTool("eraser")
    });
}

function selectIconUI(){

}