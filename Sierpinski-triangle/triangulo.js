function main(){
    let canvasElement = document.querySelector("#trianC");
    let context = canvasElement.getContext("2d");
    let iterations = 0;   
    sliderEvent(context);

    sierpinski(context, iterations,200,0,0,400,400,400)
}

function sierpinski(con, i,ax,ay,bx,by,cx,cy){
    //con.clearRect(0, 0, 400, 400);
    if(i>0){
        i--;
        tax = (bx+cx)/2
        tay = (by+cy)/2
        tbx = (ax+cx)/2
        tby = (ay+cy)/2
        tcx = (ax+bx)/2
        tcy = (ay+by)/2

        //tbx = (ax-bx)/2
        //tby = (by-ay)/2
        //tbc = (cx-ax)/2
        //tbc = (by-ay)/2
        sierpinski(con, i,tbx,tby,tax,tay,cx,cy)
        sierpinski(con, i,tax,tay,bx,by,tcx,tcy)
        sierpinski(con, i,ax,ay,tbx,tby,tcx,tcy)
    }else{
        draw_triangle(con,ax,ay,bx,by,cx,cy)
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
    con.fillStyle = "#FFCC00";
    con.fill();
    con.stroke();
}

function sliderEvent(context)
{
    document.getElementById("slider").oninput = function(event) {
        document.getElementById("sliderValue").innerHTML = event.target.value;
        context.clearRect(0, 0, 400, 400);
        sierpinski(context, event.target.value,200,0,0,400,400,400)
    };
}