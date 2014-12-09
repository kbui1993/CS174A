// game functions

// keyboard controls
document.addEventListener('keydown', function(event) {
	if(gamePlay && event.keyCode == 80) { // p - pause game
        pause = !pause;
        enableKeyControls = !enableKeyControls;
        if (pause) {
            music.pause();
            $("canvas").css("opacity", "0.7");
        }
        else {
            music.play();
            $("canvas").css("opacity", "1");
        }
    }
	if(enableKeyControls) {
	    switch(event.keyCode) {
	        case 32: // space - shoot bubble
	        	if (sound && currBubble.dy == 0) {
	            	fireSound.play();
	            	fireSound.currentTime = 0;
	            }
	            fire();
	            break;
	        case 39: // right arrow
	            if (cannonAngle > -85) {
	                cannonAngle -= 3;
	            }
	            break;
	        case 37: // left arrow
	            if (cannonAngle < 85) {
	                cannonAngle += 3;
	            }
	            break;
	        case 81: // q - quit
	        	gameOver();
	            break;
	        case 83: // s - sound on/off
	        	sound = !sound;
	        	if (sound) {
	        		music.play();
	        	}
	        	else {
	        		music.pause();
	        	}
	            break;
	        case 82: // r - restart game
	            restart(); 
	            break;
	    }
	}
});

function gameOver() {
	$("h2").html("Score: " + score);
	$("canvas").css("opacity", "0.5");
	$("#stats").hide();
	$(".end").show();

	gamePlay = false;
	clearInterval(timer);
	enableKeyControls = false;
    music.pause();
	music = dora;
	music.currentTime = 0;
	music.play();
    pause = false;
}

function quit() {
	$("canvas").css("opacity", "0.7");
	$(".begin").show();
	$(".end").hide();
	$("#stats").hide();

    playingField = Array(maxRows+1);
    numRows = 0;

    currBubble.x = 0;
    currBubble.y = 0;
    currBubble.dx = 0;
    currBubble.dy = 0;
    cannonAngle = 0;

	clearInterval(timer);
	enableKeyControls = false;
    music.pause();
	music = dora;
	music.currentTime = 0;
	music.play();
    pause = false;
}

function restart() {
	gamePlay = true;
	enableKeyControls = true;
    playingField = Array(maxRows+1);
    numRows = 0;

    clearInterval(timer);
    timer = setInterval(addRow, initialInterval);

    currBubble.x = 0;
    currBubble.y = 0;
    currBubble.dx = 0;
    currBubble.dy = 0;
    cannonAngle = 0;
    score = 0;
    level = 1;
    addRow();

    $("canvas").css("opacity", "1");
    $(".end").hide();
    $("#stats").show();

    startSound.play();
    music.pause();
    music = gameMusic;
    music.currentTime = 0;
    music.play();
    pause = false;
}

function updateScore() {
    score += pointsPerBubble;

    if (score > level * pointsPerLevel * pointsPerBubble) {
        level++;
        clearInterval(timer);
        timer = setInterval(addRow, initialInterval - 500 * level)
    }
}
