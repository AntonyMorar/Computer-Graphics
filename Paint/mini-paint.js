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

    program.update(brush);
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
        this.toolChanged = false;
        this.clearCanvas = false;
        this.selectedTool = "brush"
        this.tools =["brush", "pen", "eraser"]
    }

    update(_brush){
        if(this.toolChanged){
            switch (this.selectedTool) {
                case "brush":
                    _brush.eraser=false;
                    _brush.roundCap = true;
                    break;
                case "pen":
                    _brush.eraser=false;
                    _brush.roundCap = false;
                    break;
                case "eraser":
                    _brush.eraser=true;
                    _brush.roundCap = true;
                    break;
                default:
                    break;
            }

            //console.log(_brush)
            this.toolChanged = false;
        }
    }

    selectTool(newTool){
        this.tools.forEach(tool => {
            if(newTool == tool){
                this.selectedTool=newTool;
                this.toolChanged = true;
                return;
            }
        });
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
        this.roundCap = true;
        this.eraser = false;
    }

    update(){
       
    }

    draw(){
        if(this.isDrawing){
            if(this.startDraw){
                ctx.lineWidth = this.stroke;
                ctx.strokeStyle = !this.eraser ? this.color : 'rgba(255, 255, 255, 1)'; // Green path
                ctx.lineCap = this.roundCap ? "round" : "square"
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
    
                this.startDraw = false;
            }
            ctx.lineTo(this.x, this.y);
            ctx.stroke(); // Draw it
        }
    }
}