function drawEvents(brush){
    document.addEventListener("mousemove", event =>{
        brush.x=event.clientX - cBounds.x;
        brush.y=event.clientY - cBounds.y;
    });

    document.addEventListener("mousedown", event =>{
        brush.startDraw = true;
        brush.isDrawing = true;
    });

    document.addEventListener("mousemove", event =>{
        
    });

    document.addEventListener("mouseup", event =>{
        brush.isDrawing = false;
    });
}

// Tools handler
function toolsEvent(brush)
{
    document.getElementById("brushSize").oninput = function(event) {
        brush.stroke = event.target.value;
        document.getElementById("brushSizeValue").innerHTML = event.target.value;
    };

    document.getElementById("brushColor").oninput = function(event) {
        brush.color = event.target.value
    };

    document.getElementById("erraser").oninput = function(event) {
        brush.erraser = event.target.checked
    };
}