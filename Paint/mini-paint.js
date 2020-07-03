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
    program = new Program();
    brush = new Brush()
    //Events
    drawEvents(brush);
    toolsEvent(brush)
    // Update and Draw
    _update();
    _draw();
}

function _update() {
    requestAnimationFrame(() => _update());

    program.update();
    brush.update()
}

function _draw() {
    requestAnimationFrame(() => _draw());
    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    brush.draw();
}

// Objects ********************************************
class Program {
    constructor(){

    }

    update(){

    }

    clearCanvas(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        this.color = "#000000";
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
            ctx.strokeStyle = !this.erraser ? this.color : ctx.fillStyle; // Green path
            if(this.brushType=="circle") ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);

            this.startDraw = false;
        }
        ctx.lineTo(this.x, this.y);
        ctx.stroke(); // Draw it
    }
}