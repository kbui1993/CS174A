function Bubble(x,y) {
	this.x = x;
	this.y = y;
	this.dx = 0;
	this.dy = 0;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.detect = false; // used to color if detection bubble
    this.draw = true;
}

function copy(x, y) {
	x.color = y.color;
	x.draw = true;
}

function addRow() {
	if (numRows == maxRows) {
		// TO DO: game over
		return;
	}

	// generate new row
	var newRow;
	if(playingField[0] == null || playingField[0].length % 2)
		newRow = Array(numCols);
	else
		newRow = Array(numCols-1);

	// Stagger every other row
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

function addRowBottom() {
	if (numRows == maxRows) {
		// TO DO: game over
		return;
	}

	// generate new row
	var newRow;
	if(playingField[numRows-1].length % 2)
		newRow = Array(numCols);
	else
		newRow = Array(numCols-1);

	// Stagger every other row
	for (var i = 0; i < newRow.length; i++) {
		// newRow[i] = new Bubble(2*i+upperLeft[0], upperLeft[1]);
		newRow[i] = new Bubble(2 * i + upperLeft[0] + numCols - newRow.length, upperLeft[1] - numRows * 1.7);
		newRow[i].draw = false;
	}

	// add new row to top of playing field
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