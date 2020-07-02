let ctx = null;
let canvas = null;

let game = null;
let hud = null;
let menu = null;
let ball = null;
let player = null;
let player2 = null;
//let particles = []

// Mai Functions ********************************************
function main() {
    //Canvas
    canvas = document.querySelector("#ballCanvas");
    ctx = canvas.getContext("2d");
    ctx.font = "25px Helvetica";
    // Make the objects
    game = new Game();
    hud = new Hud();
    menu = new Menu();
    ball = new Sphere(canvas.width / 2, canvas.height / 2); //x,y
    player = new Paddle(20, canvas.height / 2, 15, 80); //x,y,w,h
    player2 = new Paddle(canvas.width - 35, canvas.height / 2, 15, 80); //x,y,w,h
    //Events
    menuEvents(menu);
    ballState(ball)
    // Update and Draw
    _update();
    _draw();
}

function _update() {
    requestAnimationFrame(() => _update());
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.update();
    // Game States
    if (game.state == "menu") {
        menu.update();
    } else if (game.state == "game") {
        ball.update(canvas.width, canvas.height);
        player.update(canvas.width, canvas.height);
        player2.update(canvas.width, canvas.height);
        hud.update()
        //if (game.changeHud) hud.update()
    }
}

function _draw() {
    requestAnimationFrame(() => _draw());
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Game States
    if (game.state == "menu") {
        menu.draw();
    } else if (game.state == "game") {
        ball.draw();
        player.draw();
        player2.draw();
        hud.draw();
    }
}

// Objects ********************************************
// Game manager singleton
class Game {
    constructor() {
        if (!!Game.instance) return Game.instance;
        Game.instance = this;

        this.state = "menu";
        this.inMatch = false;
        this.p1Score = 0;
        this.p2Score = 0;
        this.inGamePlayers = 0; //How much payers in the game (0 means 2 bots)
        this.autoStartTime = 3; //If only bots in the game
        this.autoStartTimeActual = new Date(); //If only bots in the game
        this.mousePos = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        } // w & h to make it compatible with overlap function(helpers.js) 
        this.audioManager = document.createElement("audio");
        return this;
    }

    update(){
        if(this.state=="game" && !this.inMatch && this.inGamePlayers <= 0){
            // Auto start match counter (only if all players are bots)
            if ((new Date() - this.autoStartTimeActual) / 1000 > this.autoStartTime) {
                this.startMatch()
            }
        }
    }

    setMatch() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.stiky = true;
        player.y = (canvas.height / 2) - (player.h / 2)
        player.dy = 0
        player2.y = (canvas.height / 2) - (player.h / 2)
        player2.dy = 0
        this.inMatch = false;
        this.autoStartTimeActual = new Date()
    }

    startGame(gameType) {
        switch (gameType) {
            case 0:
                movePlayer(player);
                this.inGamePlayers = 1;
                break;
            case 1:
                movePlayer(player);
                movePlayer(player2);
                this.inGamePlayers = 2;
                break;
            case 2:
                this.autoStartTimeActual = new Date();
                break;
            default: //Error default case 1 player
                movePlayer(player);
                this.inGamePlayers = 1;
                break;
        }
        this.state = "game";
    }

    startMatch() {
        ball.stiky = false;
        this.inMatch = true;
        ball.dx = randomRange(0, 1) == 0 ? ball.speed : -ball.speed;
        ball.dy = randomRange(0, 1) == 0 ? ball.speed : -ball.speed;
        //Audio sound
        game.audioManager.src = "audio/startMatch.wav";
        game.audioManager.volume = 1;
        game.audioManager.play();
    }

    gameOver() {
        this.state = "gameOver";
    }
}

class Sphere {
    constructor(x, y) {
        this.color = 'salmon';
        this.x = x;
        this.y = y;
        this.dx = -3;
        this.dy = 3;
        this.radius = 10;
        this.stiky = true; //ball can't move
        this.speed = 3.5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update(xLimit, yLimit) {
        //Canvas bounce
        /*if ( this.x < this.radius || this.x + this.radius > xLimit) this.dx = -this.dx;*/
        if (this.y + this.radius > yLimit || this.y < this.radius) {
            this.dy = -this.dy;
            game.audioManager.src = "audio/hit.wav";
            game.audioManager.volume = 0.2;
            game.audioManager.play();
        }
        // Paddle colission
        if (onCollideBall(this, player) || onCollideBall(this, player2)) {
            game.audioManager.src = "audio/hitpaddle.wav";
            game.audioManager.volume = 0.2;
            game.audioManager.play();

            if (onCollideBall(this, player)) {
                //Colide with X paddle position
                if (!deflectY(this, player)) {
                    this.dx = -this.dx;
                } //Colide with X paddle position
                else {
                    this.dy = -this.dy
                }
            } else {
                //Colide with X paddle1 position
                if (!deflectY(this, player2)) {
                    this.dx = -this.dx;
                } //Colide with X paddle position
                else {
                    this.dy = -this.dy
                }
            }

        }

        //Game points
        if (this.x + this.radius < 0) {
            game.p2Score++;
            game.audioManager.src = "audio/point.wav";
            game.audioManager.volume = 0.3;
            game.audioManager.play();
            game.setMatch();
        }
        if (this.x - this.radius > xLimit) {
            game.p1Score++;
            game.audioManager.src = "audio/point.wav";
            game.audioManager.volume = 0.3;
            game.audioManager.play();
            game.setMatch();
        }

        // Stick the ball
        if (this.stiky) {
            this.dx = 0;
            this.dy = 0;
        }
        // Update ball position
        this.x += this.dx;
        this.y += this.dy;
    }

}

class Paddle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y - (h / 2);
        this.w = w;
        this.h = h;
        this.dx = 0;
        this.dy = 0;
        this.speed = 3;
        this.color = "white";
        this.bot = true
        this.botMultiplierSpeed = 0.9 // Diferent than player speed 
    }

    update(xLimit, yLimit) {
        //Update Paddle position
        this.x += this.dx;
        this.y += this.dy;
        this.y = clamp(this.y, 0, yLimit - this.h)

        if (this.bot) this.botMovement();
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }

    // NPC Logic
    botMovement() {
        // If the ball is in his half then can move
        if (Math.abs((this.x + (this.w / 2)) - ball.x) < canvas.height - 35) {
            //Detect the y psosition of the ball
            if (ball.y < this.y + (this.h / 2)) {
                this.dy = -this.speed * (this.botMultiplierSpeed);
            } else if (ball.y > this.y + (this.h / 2)) {
                this.dy = this.speed * (this.botMultiplierSpeed);
            } else {
                this.dy = 0
            }
        } else {
            this.dy = 0
        }
    }
}

class Hud {
    constructor() {
        this.p1 = game.p1Score;
        this.p2 = game.p2Score;
        this.instructions = true;
        this.instructionsColor = "#898989";
        this.blinkCounter = new Date(); //Time in seconds
    }

    update() {
        this.p1 = game.p1Score;
        this.p2 = game.p2Score;

        this.instructions = game.inMatch ? false : true;

        //player can  see instructions 
        if (this.instructions) {
            // Blink counter
            if ((new Date() - this.blinkCounter) / 1000 > 0.5) {
                if (this.instructionsColor == "#898989") {
                    this.instructionsColor = "white"
                } else {
                    this.instructionsColor = "#898989"
                }
                this.blinkCounter = new Date()
            }
        }
    }

    draw() {
        ctx.font = "25px Helvetica";
        ctx.fillText(this.p1, (canvas.width / 2) - 80, 30);
        ctx.fillText(this.p2, (canvas.width / 2) + 80, 30);

        //player can  see instructions 
        if (this.instructions) {
            if(game.inGamePlayers <= 0){
                let lt = 3-(Math.round((new Date() - game.autoStartTimeActual) / 1000))
                ctx.fillStyle = this.instructionsColor;
                ctx.font = "16px Helvetica";
                ctx.fillText("Match start in " + lt, canvas.width / 2, canvas.height-90);
            }

            // One player in game
            if(game.inGamePlayers > 0){
                ctx.fillStyle = this.instructionsColor;
                ctx.font = "16px Helvetica";
                ctx.fillText("Space key to start", canvas.width / 2, canvas.height-90);
                ctx.fillText("W - Up", 50, canvas.height-90);
                ctx.fillText("S - Down", 50, canvas.height-65);
            }
            // Two player in game
            if(game.inGamePlayers > 1){
                ctx.fillStyle = this.instructionsColor;
                ctx.font = "16px Helvetica";
                ctx.fillText("↑ - Up", canvas.width-50, canvas.height-90);
                ctx.fillText("↓ - Down", canvas.width-50, canvas.height-65);
            }
        }
    }
}

class Menu {
    constructor() {
        this.mainText = "PONG"
        this.activeButton = null;
        this.buttonsPos = {
            x: (canvas.width / 2) - 85,
            y: (canvas.height/2) -50
        }
        this.margin = {
            x: 0,
            y: 60
        }
        this.buttons = [{
                id: 0,
                text: "Player vs NPC",
                x: this.buttonsPos.x,
                y: this.buttonsPos.y,
                w: ctx.measureText("Player vs NPC").width,
                h: 30,
                color: "#e0e0e0"
            },
            {
                id: 1,
                text: "Player vs Player",
                x: this.buttonsPos.x + (this.margin.x * 1),
                y: this.buttonsPos.y + (this.margin.y * 1),
                w: ctx.measureText("Player vs Player").width,
                h: 30,
                color: "#e0e0e0"
            },
            {
                id: 2,
                text: "NPC vs NPC",
                x: this.buttonsPos.x + (this.margin.x * 2),
                y: this.buttonsPos.y + (this.margin.y * 2),
                w: ctx.measureText("Player vs Player").width,
                h: 30,
                color: "#e0e0e0"
            }
        ]
    }

    update() {
        let a = overlap(game.mousePos, this.buttons[0])
        let b = overlap(game.mousePos, this.buttons[1])
        let c = overlap(game.mousePos, this.buttons[2])

        if (a || b || c) {
            if (a) this.activeButton = 0;
            else if (b) this.activeButton = 1;
            else if (c) this.activeButton = 2;
            document.documentElement.style.cursor = "pointer";
        } else {
            document.documentElement.style.cursor = "default";
            this.activeButton = null;
        }

        this.buttons.forEach(btn => {
            if(btn.id==this.activeButton) btn.color= "white"
            else  btn.color= "#e0e0e0"
        });
    }

    draw() {
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "70px Helvetica";
        ctx.fillText(this.mainText, canvas.width / 2, 100);

        ctx.textAlign = "left";
        ctx.textBaseline = 'top';
        ctx.font = "100 25px Helvetica";
        this.buttons.forEach(btn => {
            ctx.fillStyle = btn.color;
            ctx.fillText(btn.text, btn.x, btn.y);
            //ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        });
        ctx.textBaseline = 'alphabetic';

        ctx.textAlign = "center";
        ctx.font = "10px Helvetica";
        ctx.fillStyle = "#e0e0e0";
        ctx.fillText("antony999k", canvas.width / 2, canvas.height - 18);
    }
}