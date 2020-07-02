function movePlayer(player) {
    if (game.inGamePlayers >= 2) return; //Allow max 2 players
    game.inGamePlayers++;
    player.bot = false;

    if (game.inGamePlayers == 1) {
        //Player 1
        // Up
        document.addEventListener("keydown", event => {
            if (event.key == "w") {
                player.dy = -player.speed;
            }
        });

        document.addEventListener("keyup", event => {
            if (event.key == "w") {
                player.dy = 0;
            }
        });

        // Down
        document.addEventListener("keydown", event => {
            if (event.key == "s") {
                player.dy = player.speed;
            }
        });

        document.addEventListener("keyup", event => {
            if (event.key == "s") {
                player.dy = 0;
            }
        });
    } else {
        //Player 2
        // Up
        document.addEventListener("keydown", event => {
            if (event.keyCode == '38') {
                player.dy = -player.speed;
            }
        });

        document.addEventListener("keyup", event => {
            if (event.keyCode == '38') {
                player.dy = 0;
            }
        });

        // Down
        document.addEventListener("keydown", event => {
            if (event.keyCode == '40') {
                player.dy = player.speed;
            }
        });

        document.addEventListener("keyup", event => {
            if (event.keyCode == '40') {
                player.dy = 0;
            }
        });
    }

}

function ballState(ball) {
    // Start Game
    document.addEventListener("keydown", event => {
        if ((event.key == "Spacebar" || event.key === ' ') && ball.stiky && game.state=="game") {
            game.audioManager.src = "audio/startMatch.wav";
            game.audioManager.volume = 1;
            game.audioManager.play();
            game.startMatch()
        }
    });
}

function menuEvents(menu){
    document.addEventListener("mousemove", event =>{
        game.mousePos.x=event.clientX;
        game.mousePos.y=event.clientY;
    });

    document.addEventListener("click", event =>{
        if(game.state!="menu" || menu.activeButton==null)return; //Only click in menu
        game.audioManager.src = "audio/select.wav";
        game.audioManager.volume = 1;
        game.audioManager.play();
        document.documentElement.style.cursor = "default";
        game.startGame(menu.activeButton);
    })
}