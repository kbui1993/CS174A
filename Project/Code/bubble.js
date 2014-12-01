function Bubble(x,y) {
	this.x = x;
	this.y = y;
	this.dx = 0;
	this.dy = 0;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.detect = false; // used to color if detection bubble
    this.draw = true;
    this.match = false;
    this.connected = false;
}

function copy(j, k, b) {
	playingField[j][k].color = b.color;
	playingField[j][k].draw = true;

	var matches = numMatches(j, k, b.color);

	if (matches > 2) {
		pop.play();
		removeBubbles();
	}
}

function numMatches(j, k, color) {
	var count = 1;
	playingField[j][k].match = true;

	var neighbors = getAdjacentBubbles(j, k);

	for (var i = 0; i < neighbors.length; i++)
		count += numMatchesHelper(neighbors[i][0], neighbors[i][1], color);

	return count;
}

function numMatchesHelper(j, k, color) {
	var count = 0;

	if (!playingField[j][k].match && playingField[j][k].color == color) {
		playingField[j][k].match = true;
		count++;

		var neighbors = getAdjacentBubbles(j, k);

		for (var i = 0; i < neighbors.length; i++)
			count += numMatchesHelper(neighbors[i][0], neighbors[i][1], color);
	}
	return count;
}

function getAdjacentBubbles(j, k) {
	var result = [];	
	var cols = playingField[j].length;

	if (j > 0) { // get bubbles above
		if (k < 9)
			result = getAdjacentHelper(j-1, k, result);
		if (cols%2 == 0 && k > 0) // even row
			result = getAdjacentHelper(j-1, k-1, result);
		else if (k < cols) // odd row
			result = getAdjacentHelper(j-1, k+1, result);
	}
	if (j < numRows-1 ) { // get bubbles below
		if (k < 9)
			result = getAdjacentHelper(j+1, k, result);
		if (cols%2 == 0 && k > 0) // even row
			result = getAdjacentHelper(j+1, k-1, result);
		else if (k < cols) // odd row
			result = getAdjacentHelper(j+1, k+1, result);
	}
	if (k > 0) // get left and right bubbles
		result = getAdjacentHelper(j, k-1, result);
	if (k < cols-1)
		result = getAdjacentHelper(j, k+1, result);

	return result;
}

// add bubble if visible
function getAdjacentHelper(j, k, result) {
	if(playingField[j][k].draw)
		result.push([j, k]);

	return result;
}

// TO DO: add 3d effects when removing
function removeBubbles() {
	// remove matched bubbles
	for (var j = 0; j < numRows; j++) {
		for (var k = 0; k < playingField[j].length; k++) {
			if(playingField[j][k].match) {
            	playingField[j][k].draw = false;
            	updateScore();
			}
		}
	}

	// remove any empty rows
	var rows = numRows;
	var emptyRowFound = false;

	for (var j = 0; j < rows; j++) {
		var assumeEmpty = true;

		if (!emptyRowFound) {
			for (var k = 0; k < playingField[j].length; k++) {
				if (playingField[j][k].draw) {
	            	assumeEmpty = false;
	            	break;
				}
			}
			// empty row found if assumption still true
			if (assumeEmpty)
				emptyRowFound = true;
		}
		// remove row and all rows underneath
		if (emptyRowFound) {
			playingField[j] = undefined;
			numRows--;
		}
	}

	// trace all reachable bubbles from top row
	for (var k = 0; k < playingField[0].length; k++) {
		if (playingField[0][k].draw) {
			playingField[0][k].connected = true;
			var neighbors = getAdjacentBubbles(0, k);

			for (var i = 0; i < neighbors.length; i++) {
				checkConnected(neighbors[i][0],neighbors[i][1]);
			}
		}
	}

	// remove unconnected bubbles
	for (var j = 0; j < numRows; j++) {
		for (var k = 0; k < playingField[j].length; k++) {
			if (playingField[j][k].draw && !playingField[j][k].connected) {
				playingField[j][k].draw = false;
				updateScore();
			}
		}
	}

	// TO DO: handle end game if no bubbles left
}

function checkConnected(j, k) {
	playingField[j][k].connected = true;

	var neighbors = getAdjacentBubbles(j, k);

	for (var i = 0; i < neighbors.length; i++) {
		var nj = neighbors[i][0];
		var nk = neighbors[i][1];

		if (!playingField[nj][nk].connected) {
			playingField[nj][nk].connected = true;
			checkConnected(nj, nk);
		}
	}
}

function addRow() {
	if (!pause) {
		if (numRows == maxRows) {
			gameOver();
			return;
		}

		// generate new row
		var newRow;
		if(playingField[0] == null || playingField[0].length % 2)
			newRow = Array(numCols);
		else
			newRow = Array(numCols-1);

		for (var i = 0; i < newRow.length; i++) {
			// newRow[i] = new Bubble(2*i+upperLeft[0], upperLeft[1]);
			newRow[i] = new Bubble(2 * i + upperLeft[0] + numCols - newRow.length, upperLeft[1]);
		}

		// move current rows down
		for (var i = numRows; i > 0; i--) {
			for (var j = 0; j < playingField[i-1].length; j++) {
				playingField[i-1][j].y -= 1.7;
			}
			playingField[i] = playingField[i-1];
		}

		// add new row to top of playing field
		playingField[0] = newRow;
		numRows++;
	}
}

function addRowBottom() {
	if (numRows == maxRows) {
		gameOver();
		return;
	}

	// generate new row
	var newRow;
	if(playingField[numRows-1].length % 2)
		newRow = Array(numCols);
	else
		newRow = Array(numCols-1);

	for (var i = 0; i < newRow.length; i++) {
		// newRow[i] = new Bubble(2*i+upperLeft[0], upperLeft[1]);
		newRow[i] = new Bubble(2 * i + upperLeft[0] + numCols - newRow.length, upperLeft[1] - numRows * 1.7);
		newRow[i].draw = false;
	}

	// add new row to bottom of playing field
	playingField[numRows] = newRow;
	numRows++;
}

function fire() {
	if (currBubble.dx == 0 && currBubble.dy == 0) {
		currBubble.dx = Math.sin(radians(-cannonAngle))/2;
		currBubble.dy = Math.cos(radians(-cannonAngle))/2;
	}
}

function drawBubble(bubble) {
	if (!bubble.draw)
		return;
	var translation = vec3(bubble.x, bubble.y, 0);
	var color = bubble.color;
	if (bubble.detect) {
		color = [0, 0, 0, 1];
	}
	ctm = mult(mat4(), translate(translation));
	ctm = mult(ctm, scale(size));
	gl.uniform4fv(vColor, color);
	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));

	for( var i=0; i<index; i+=3) {
		gl.drawArrays( gl.TRIANGLES, i, 3 );
	}
}