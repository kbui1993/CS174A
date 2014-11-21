var gl;
var vColor;

// matrix transformation variables
var ctm, modelViewMatrix, projectionMatrix;

// cannon variables
var cannonAngle = 0;
var cannonColor = vec4(0.7, 0.4, 0.0, 1.0);
var numVertices = 36;
var cannonPts = [];

// bubble variables
var bubblePts = [];
var size = vec3(0.9, 0.9, 0.9);
var colors = [[1.0, 0.0, 0.5, 1.0],  // pink
              [0.6, 0.1, 0.8, 1.0],  // purple
              [1.0, 0.5, 0.0, 1.0],  // orange
              [0.0, 0.8, 0.8, 1.0],  // teal
              [0.0, 0.3, 0.8, 1.0],  // blue
              [1.0, 1.0, 1.0, 1.0]]; // white
var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333,1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var index = 0;

// playing field variables
var numRows = 0;
var numCols = 10;
var playingField = Array(maxRows);
var maxRows = 9;
var upperLeft = [-9, 19];
var lowerRight = [9, 1];
var currBubble = new Bubble();
var nextBubble = new Bubble();

// keyboard controls
document.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
        case 32: // space
            // TODO: shoot bubble
            newBubble();
            break;
        case 39: // right arrow
            cannonAngle++;
            break;
        case 37: // left arrow
        	cannonAngle--;
            break;
        // TODO: pause/unpause?
        //		 restart?
        //		 reshuffle if stuck?
    }
});

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){alert("WebGL isn't available");}

	gl.viewport(0,0, canvas.width, canvas.height);
	gl.clearColor(0.8, 0.9, 1.0, 1);
	gl.enable(gl.DEPTH_TEST);

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// generate vertices
	cannon();
	tetrahedron(va, vb, vc, vd, 9);

	// add new row every four seconds
	addRow();
	window.setInterval(addRow, 2000);

	// link vColor on js to html
	vColor = gl.getUniformLocation(program, "vColor");

	// create buffer for points
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	// link vPosition on js to html
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	// link transformation matrices on js to html
	modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrix = gl.getUniformLocation(program, "projectionMatrix");

	render();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// set up camera view
	pMatrix = ortho(-10, 10, 0, 20, -10, 10);
	gl.uniformMatrix4fv(projectionMatrix, false, flatten(pMatrix));

	ctm = mat4();

	// render cannon
	gl.uniform4fv(vColor, cannonColor);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cannonPts), gl.STATIC_DRAW);
	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);

	// render playing field
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bubblePts), gl.STATIC_DRAW);
	y = upperLeft[1];
	for (var j = 0; j < numRows; j++) {
		var x = upperLeft[0];

		// Stagger every other row
		if(playingField[j].length != numCols)
			x += 1;

		for (var k = 0; k < playingField[j].length; k++) {
			drawBubble(playingField[j][k].color, vec3(x, y, 0));
		    x += 2;
		}
	    y -= 1.7;
	}

	// render current and next bubble
	drawBubble(currBubble.color, vec3(0, 0, 0));
	drawBubble(nextBubble.color, vec3(lowerRight[0], lowerRight[1], 0));

	window.requestAnimFrame(render);
}

// Functions for generating sphere vertices

function triangle(a, b, c) {
     bubblePts.push(a);
     bubblePts.push(b);      
     bubblePts.push(c);
     index += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

// Functions for generating cube vertices

function cannon() {
	quad(1, 0, 3, 2);
	quad(2, 3, 7, 6);
	quad(3, 0, 4, 7);
	quad(6, 5, 1, 2);
	quad(4, 5, 6, 7);
	quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
	 var vertices = [vec4(-1, 0, 0, 1),
    				 vec4(-1, 2, 0, 1),
        			 vec4( 1, 2, 0 ,1),
        			 vec4( 1, 0, 0, 1),
        			 vec4(-1, 0, 0, 1),
        			 vec4(-1, 2, 0, 1),
        			 vec4( 1, 2, 0 ,1),
        			 vec4( 1, 0, 0 ,1)];

	var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        cannonPts.push(vertices[indices[i]]);
    }
}