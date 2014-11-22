function Bubble() {
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.popped = false;
}

function addRow() {
	if (numRows == maxRows) {
		// TO DO: game over
		return;
	}

	// generate new row
	var newRow;
	if(numRows % 2)
		newRow = Array(numCols-1);
	else
		newRow = Array(numCols);

	for (var i = 0; i < newRow.length; i++) {
		newRow[i] = new Bubble();
	}

	// add new row to top of playing field
	playingField[numRows] = newRow.slice(0);
	numRows++;
}

function newBubble() {
	currBubble.color = nextBubble.color;
	nextBubble.color = colors[Math.floor(Math.random() * colors.length)];
}

function drawBubble(color, translation) {
	ctm = mult(mat4(), translate(translation));
	ctm = mult(ctm, scale(size));
	gl.uniform4fv(vColor, color);
	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));

	for( var i=0; i<index; i+=3) {
		gl.drawArrays( gl.TRIANGLES, i, 3 );
	}
}
