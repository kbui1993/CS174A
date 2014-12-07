// game functions

// keyboard controls
document.addEventListener('keydown', function(event) {
	if(enableKeyCtrls)
    switch(event.keyCode) {
        case 32: // space - shoot bubble
            fireSound.play();
            fireSound.currentTime = 0;
            fire();
            break;
        case 39: // right arrow
            if (cannonAngle > -85)
                cannonAngle -= 3;
            break;
        case 37: // left arrow
            if (cannonAngle < 85)
                cannonAngle += 3;
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
        case 83: // s - sound on/off
        	sound = !sound;
        	/* TO DO: move skip color to another key control? is it even necessary?
        	// skip color
            currBubble.color = nextBubble.color;
            nextBubble.color = colors[Math.floor(Math.random() * colors.length)]; */
            break;
        case 82: // r - restart game
            restart(); 
            break;
    }
});

function gameOver() {
	enableKeyCtrls = false;

	$("h2").html("Score: " + score);
	$("canvas").css("opacity", "0.5");
	$("#stats").hide();
	$(".end").show();

	clearInterval(timer);

	music.pause();
	dora.currentTime = 0;
	dora.play();
}

function quit() {
	$("canvas").css("opacity", "1");
	$(".begin").show();
	$(".end").hide();

	enableKeyCtrls = false;
	// TO DO: clear canvas
	// y u no work:
	//gl.clearColor(0.8, 0.9, 1.0, 1);
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function restart() {
	enableKeyCtrls = true;
	for (var i = 0; i < maxRows; i++)
        playingField[i] = undefined;

    clearInterval(timer);
    timer = setInterval(addRow, initialInterval);

    cannonAngle = 0;
    numRows = 0;
    score = 0;
    level = 1;
    addRow();

    $("canvas").css("opacity", "1");
    $(".end").hide();
    $("#stats").show();

    dora.pause();
    startSound.play();
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
