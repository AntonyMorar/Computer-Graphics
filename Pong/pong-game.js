let ctx = null;
let canvas = null;

let game = null;
let hud = null;
let ball = null;
let player = null;
let player2 = null;

// Mai Functions ********************************************
function main(){
    //Canvas
    canvas = document.querySelector("#ballCanvas");
    ctx = canvas.getContext("2d");  
    ctx.font = "25px Helvetica";
    // Make the objects
    game = new Game()
    hud = new Hud()
    ball = new Sphere('salmon',canvas.width/2,canvas.height/2);
    player = new Paddle(20,canvas.height/2,15,80);
    player2 = new Paddle(canvas.width-35,canvas.height/2,15,80);
    //Events
    movePlayer(player);
    ballState(ball)
    // Update and Draw
    _update();
    _draw();
}

function _update(){
    requestAnimationFrame(() => _update()) ;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ball.update(canvas.width,canvas.height);
    player.update(canvas.width,canvas.height);
    player2.update(canvas.width,canvas.height);
    if(game.changeHud) hud.update()
}

function _draw(){
    requestAnimationFrame(() => _draw()) ;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ball.draw();
    player.draw();
    player2.draw();
    hud.draw();
}

// Objects ********************************************
class Game{
    constructor(){
        this.state="menu";
        this.p1Score=0;
        this.p2Score=0;
        this.changeHud=false;
    }

    setBall(){
        this.changeHud=true
        ball.x=canvas.width/2;
        ball.y=canvas.height/2;
        ball.stiky=true;
    }

    startMatch(){
        ball.stiky = false;
        ball.dx = randomRange(0,1)==0 ? ball.speed : -ball.speed
        ball.dy = randomRange(0,1)==0 ? ball.speed : -ball.speed
    }
}

class Sphere{
    constructor(color,x,y){
        this.color = color;
        this.x=x;
        this.y=y;
        this.dx=-3;
        this.dy=3;
        this.radius=10;
        this.stiky=true; //ball can't move
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
        //Canvas bounce
        if(/*this.x < this.radius || */this.x + this.radius > xLimit) this.dx = -this.dx;
        if(this.y + this.radius > yLimit || this.y < this.radius) this.dy = -this.dy;
        // Paddle colission
        if(onCollideBall(this, player)) this.dx = -this.dx;
        if(onCollideBall(this, player2)) this.dx = -this.dx;

        //Game points
        if(this.x+this.radius < 0){
            game.p2Score++;
            game.setBall();
        }

        //stick the ball
        if (this.stiky){
            this.dx = 0;
            this.dy = 0;
        }
        //Update ball position
        this.x +=this.dx;
        this.y +=this.dy;
    }

}

class Paddle{
    constructor(x,y,w,h){
        this.x=x;
        this.y=y-(h/2);
        this.w=w;
        this.h=h;
        this.dx=0;
        this.dy=0;
        this.speed=3;
        this.color = "white";
        this.bot=true
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

        if(this.bot) this.botMovement();
    }

    botMovement(){
        this.dy = ball.dy;
    }
}

class Hud{
    constructor(){
        this.p1 = game.p1Score;
        this.p2 =  game.p2Score;
    }

    update(){
        console.log(game.p2Score)
        this.p1=game.p1Score;
        this.p2=game.p2Score;
        game.changeHud=false
    }

    draw(){
        ctx.fillText(this.p1, (canvas.width/2)-80, 30);
        ctx.fillText(this.p2, (canvas.width/2)+80, 30);
    }
}