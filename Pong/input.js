function movePlayer(player)
{
    player.bot=false
    // Up
    document.addEventListener("keydown", event=>
    {
        if(event.key == "w"){
            player.dy = -player.speed;
        }
    });

    document.addEventListener("keyup", event=>
    {
        if(event.key == "w"){
            player.dy = 0;
        }
    });

    // Down
    document.addEventListener("keydown", event=>
    {
        if(event.key == "s"){
            player.dy = player.speed;
        }
    });

    document.addEventListener("keyup", event=>
    {
        if(event.key == "s"){
            player.dy = 0;
        }
    });
}

function ballState(ball){
    // Start Game
    document.addEventListener("keydown", event=>
    {
        if((event.key == "Spacebar" || event.key === ' ') && ball.stiky){
            game.startMatch()
        }
    });
}