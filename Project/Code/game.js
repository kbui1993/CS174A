// game functions

// keyboard controls
document.addEventListener('keydown', function(event) {
	if(enableKeyControls) {
	    switch(event.keyCode) {
	        case 32: // space - shoot bubble
	        	if (sound) {
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
	        case 80: // p - pause game
	            pause = !pause;
	            if (pause) {
	                music.pause();
	                $("canvas").css("opacity", "0.7");
	            }
	            else {
	                music.play();
	                $("canvas").css("opacity", "1");
	            }
	            break;
	        case 81: // q - quit
	        	quit();
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

	clearInterval(timer);
	enableKeyControls = false;
    music.pause();
	music = dora;
	music.currentTime = 0;
	music.play();
}

function quit() {
	$("canvas").css("opacity", "0.7");
	$(".begin").show();
	$(".end").hide();
	$("#stats").hide();

	// clear playing field
	for (var j = 0; j < numRows; j++) {
        for (var k = 0; k < playingField[j].length; k++) {
            playingField[j][k].draw = false;
        }
    }

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
}

function restart() {
	enableKeyControls = true;
	for (var i = 0; i < maxRows; i++) {
        playingField[i] = undefined;
	}

    clearInterval(timer);
    timer = setInterval(addRow, initialInterval);

    currBubble.x = 0;
    currBubble.y = 0;
    currBubble.dx = 0;
    currBubble.dy = 0;
    cannonAngle = 0;
    numRows = 0;
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
}

function updateScore() {
    score += pointsPerBubble;

    if (score > level*pointsPerLevel*pointsPerBubble) {
        level++;
        clearInterval(timer);
        timer = setInterval(addRow, initialInterval-2000*level)
    }
}
