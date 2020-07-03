let ctx = null;
let canvas = null;
let cBounds = null;
let tools =["brush", "pen", "eraser", "square"]

// Main Functions ********************************************
function _start() {
    //Canvas
    canvas = document.querySelector("#paintCanvas");
    ctx = canvas.getContext("2d");
    cBounds = canvas.getBoundingClientRect();
    // Make the objects
    let program = new Program();
    let tool = new Tool()
    //Events
    drawEvents(tool);
    toolsEvent(tool)
    programEvents(program)
    // Update and Draw
    _update(program,tool);
    _draw(program,tool);
}

function _update(program,tool) {
    requestAnimationFrame(() => _update(program,tool));
    cBounds = canvas.getBoundingClientRect();
    
    program.update(tool);
    tool.update()
}

function _draw(program,tool) {
    requestAnimationFrame(() => _draw(program,tool));
    if(program.clearCanvas){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        program.clearCanvas=false;
    }
    tool.draw();
}

// Objects ********************************************
class Program {
    constructor(){
        this.toolChanged = false;
        this.clearCanvas = false;
        this.selectedTool = "brush"
    }

    update(tool){
        if(this.toolChanged){
            switch (this.selectedTool) {
                case "brush":
                    tool.eraser=false;
                    tool.roundCap = true;
                    break;
                case "pen":
                    tool.eraser=false;
                    tool.roundCap = false;
                    break;
                case "eraser":
                    tool.eraser=true;
                    tool.roundCap = true;
                    break;
                default:
                    break;
            }

            //console.log(tool)
            this.toolChanged = false;
        }
    }

    selectTool(newTool){
        tools.forEach(tool => {
            if(newTool == tool){
                this.selectedTool=newTool;
                this.toolChanged = true;
                return;
            }
        });
    }

    downloadCanvas(imageName) {
        let img = canvas.toDataURL('image/jpg');
        let a = document.createElement('a');
        a.href = img;
        a.download = imageName || 'draw';
        a.click();
    }
}

class Tool{
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
            this.brush();
        }
    }

    brush(){
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
