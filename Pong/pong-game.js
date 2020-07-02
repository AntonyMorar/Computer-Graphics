let ctx = null;
let canvas = null;

let game = null;
let ball = null;
let player = null;
let enemy = null;

// Mai Functions ********************************************
function main(){
    //Canvas
    canvas = document.querySelector("#ballCanvas");
    ctx = canvas.getContext("2d");  
    // Make the objects
    game = new Game()
    ball = new Sphere('salmon',canvas.width/2,canvas.height/2,10);
    player = new Paddle(20,canvas.height/2,15,80);
    enemy = new Paddle(canvas.width-35,canvas.height/2,15,80);
    //Events
    movePlayer(player);
    // Update and Draw
    _update();
    _draw();
}

function _update(){
    requestAnimationFrame(() => _update()) ;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ball.update(canvas.width,canvas.height);
    player.update(canvas.width,canvas.height);
    enemy.update(canvas.width,canvas.height);
}

function _draw(){
    requestAnimationFrame(() => _draw()) ;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ball.draw();
    player.draw();
    enemy.draw();
}

// Objects ********************************************
class Game{
    constructor(){
        this.state="menu";
    }
}

class Sphere{
    constructor(color,x,y,radius){
        this.color = color;
        this.x=x;
        this.y=y;
        this.dx=-3;
        this.dy=3;
        this.radius=radius;
        this.stiky=false; //ball can't move
        this.speed=3;
    }

    draw(){
        ctx.fillStyle=this.color;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }

    update(xLimit, yLimit)
    {
        // Check if the ball can moves
        if(this.stiky){
            this.dx=0;
            this.dy=0;
        }else{
            //Canvas bounce
            if(this.x < this.radius || this.x + this.radius > xLimit) this.dx = -this.dx;
            if(this.y + this.radius > yLimit || this.y < this.radius) this.dy = -this.dy;
            // Paddle colission
            if(onCollideBall(this, player)) this.dx = -this.dx;
            if(onCollideBall(this, enemy)) this.dx = -this.dx;

            //Game points
        }

        //Update ball position
        this.x +=this.dx;
        this.y +=this.dy;
    }

}

class Paddle{
    constructor(x,y,w,h){
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.dx=0;
        this.dy=0;
        this.speed=3;
        this.color = "white";
    }

    draw(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }

    update(xLimit, yLimit){
        //Update Paddle position
        this.x +=this.dx;
        this.y +=this.dy;
        this.y = clamp(this.y,0,yLimit-this.h)
    }
}