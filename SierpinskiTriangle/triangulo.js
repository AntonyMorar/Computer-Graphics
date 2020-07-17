let canvasElement;

function main(){
    canvasElement = document.querySelector("#trianC");
    let context = canvasElement.getContext("2d");
    let iterations = 0;   
    sliderEvent(context);

    sierpinski(context, iterations,canvasElement.width/2,0,0,canvasElement.height,canvasElement.width,canvasElement.height)
}

function sierpinski(con, i,ax,ay,bx,by,cx,cy){
    if(i>0){
        sierpinski(con,i-1,(ax+bx)/2,(ay+cy)/2,bx,by,(bx+cx)/2,by)
        sierpinski(con,i-1,ax,ay,(ax+bx)/2,(ay+cy)/2,(cx+ax)/2,(ay+by)/2)
        sierpinski(con,i-1,(cx+ax)/2,(ay+by)/2,(bx+cx)/2,by,cx,cy)
    }else{
        draw_triangle(con,ax,ay,bx,by,cx,cy);
    }
}

function draw_triangle(con,ax,ay,bx,by,cx,cy){
    // Triangle
    con.beginPath();
    con.moveTo(ax, ay);
    con.lineTo(bx, by);
    con.lineTo(cx, cy);
    con.closePath();
    // Color
    con.fillStyle = getColor();
    con.fill();
    con.stroke();
}

function getColor(){
    let r = Math.floor(Math.random() * 255);
    let g = r + 80;
    g = Math.min(g, 255);
    return 'rgb(' + r + ',' + g + ',255)'
}

function sliderEvent(context)
{
    document.getElementById("slider").oninput = function(event) {
        document.getElementById("sliderValue").innerHTML = event.target.value;
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        sierpinski(context, event.target.value,canvasElement.width/2,0,0,canvasElement.height,canvasElement.width,canvasElement.height)
    };
}