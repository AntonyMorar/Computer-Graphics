let ctx = null;
let canvas = null;
let cBounds = null;

// Main Functions ********************************************
function _start() {
    //Canvas
    canvas = document.querySelector("#paintCanvas");
    ctx = canvas.getContext("2d");
    cBounds = canvas.getBoundingClientRect();
    // Make the objects
    let program = new Program();
    let brush = new Brush()
    //Events
    drawEvents(brush);
    toolsEvent(brush)
    programEvents(program)
    // Update and Draw
    _update(program,brush);
    _draw(program,brush);
}

function _update(program,brush) {
    requestAnimationFrame(() => _update(program,brush));

    program.update();
    brush.update()
}

function _draw(program,brush) {
    requestAnimationFrame(() => _draw(program,brush));
    if(program.clearCanvas){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        program.clearCanvas=false;
    }
    brush.draw();
}

// Objects ********************************************
class Program {
    constructor(){
        this.clearCanvas = false;
    }

    update(){

    }

    downloadCanvas(link, filename) {
        link.href = document.getElementById('paintCanvas').toDataURL();
        link.download = filename;
    }
}

class Brush{
    constructor(){
        this.x = -99; //Out of canvas
        this.y = -99; //Out of canvas
        this.startDraw=false;
        this.isDrawing = false;
        this.color = "rgba(0,0,0,1)";
        this.stroke = 5;
        this.brushType = "circle";
        this.erraser = false;
    }

    update(){
       
    }

    draw(){
        if(this.isDrawing) this.freeDraw()
    }

    freeDraw(){
        if(this.startDraw){
            ctx.lineWidth = this.stroke;
            ctx.strokeStyle = !this.erraser ? this.color : 'rgba(255, 255, 255, 1)'; // Green path
            if(this.brushType=="circle") ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);

            this.startDraw = false;
        }
        ctx.lineTo(this.x, this.y);
        ctx.stroke(); // Draw it
    }
}