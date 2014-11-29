var canvas;
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
var maxRows = 10;
var playingField = Array(maxRows);
var upperLeft = [-9, 19];
var lowerRight = [9, 1];
var currBubble = new Bubble(0,0);
var nextBubble = new Bubble(lowerRight[0],lowerRight[1]);

// game variables
var pause = false;
var score = 0;
var scoreLength = 5;
var level = 1;
var pointsPerLevel = 30;
var timer;
var initialInterval = 12000;
var pointsPerBubble = 10;

// sound variables
var snd = new Audio("Ding.wav");
var music = new Audio("GrapeGarden.mp3");
var pop = new Audio("pop.wav");

// keyboard controls
document.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
        case 32: // space - shoot bubble
            snd.play();
            fire();
            snd.currentTime = 0;
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
            if (pause)
                music.pause();
            else
                music.play();
            break;
        case 83: // skip color
            currBubble.color = nextBubble.color;
            nextBubble.color = colors[Math.floor(Math.random() * colors.length)];
            break;
        case 82: // r - restart game
            for(var i = 0; i < maxRows; i++) {
                playingField[i] = undefined;
            }
            numRows = 0;
            score = 0;
            level = 1;
            addRow();
            break;
    }
});

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){alert("WebGL isn't available");}

	gl.viewport(0,0, canvas.width, canvas.height);
	gl.clearColor(0.8, 0.9, 1.0, 1);
	gl.enable(gl.DEPTH_TEST);

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

    music.play();

	// generate vertices
	cannon();
	tetrahedron(va, vb, vc, vd, 3);

	// add new row every time interval
	addRow();
    timer = window.setInterval(addRow, initialInterval);
	
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

    // music looping
    if (typeof music.loop == 'boolean') {
        music.loop = true;
    }
    else {
        music.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        music.play();
    }

	// set up camera view
	pMatrix = ortho(-10, 10, 0, 20, -10, 10);
	gl.uniformMatrix4fv(projectionMatrix, false, flatten(pMatrix));

	ctm = mat4();
    ctm = mult(ctm, rotate(cannonAngle,[0,0,1]));
	// render cannon
	gl.uniform4fv(vColor, cannonColor);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cannonPts), gl.STATIC_DRAW);
	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);

    //render line
    var dx = 0, dy = 0;
    gl.uniform4fv(vColor, vec4(0.5, 0.5, 0.5, 1));
    for (var i = 0; i < 15; i++) {
        dx += 2 * Math.sin(radians(-cannonAngle));
        dy += 2 * Math.cos(radians(-cannonAngle));
        if (dx > 9) {
            ctm = mat4();
            ctm = mult(ctm, rotate(-cannonAngle,[0,0,1]));
            ctm = mult(ctm, scale(vec3(0.1, 0.5, 0.1)));
            ctm = mult(translate(18-dx, dy, 0), ctm);
        }
        else if (dx < -9) {
            ctm = mat4();
            ctm = mult(ctm, rotate(-cannonAngle,[0,0,1]));
            ctm = mult(ctm, scale(vec3(0.1, 0.5, 0.1)));
            ctm = mult(translate(-18-dx, dy, 0), ctm);
        }
        else {
            ctm = mat4();
            ctm = mult(ctm, rotate(cannonAngle,[0,0,1]));
            ctm = mult(ctm, scale(vec3(0.1, 0.5, 0.1)));
            ctm = mult(translate(dx, dy, 0), ctm);
        }
        gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);
    }

	// render playing field
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bubblePts), gl.STATIC_DRAW);
	for (var j = 0; j < numRows; j++) {
		for (var k = 0; k < playingField[j].length; k++) {
			drawBubble(playingField[j][k]);
            playingField[j][k].match = false;
		}
	}

    // increment ball slowly so it is drawn when it hits the side
    for (var i = 0; i < 10; i++) {
        currBubble.x += currBubble.dx/10;
        currBubble.y += currBubble.dy/10;
        if (currBubble.x > 9 || currBubble.x < -9) {
            currBubble.dx *= -1;
            drawBubble(currBubble);
        }
    }

    // check for collisions
    collision:
    for (var j = numRows-1; j >= 0; j--) {
        for (var k = 0; k < playingField[j].length; k++) {
            //skip bubbles that do not need to be checked
            playingField[j][k].detect = false;

            //odd row
            if (playingField[j].length%2 && playingField[j+1] != null) {
                if (playingField[j+1][k].draw && playingField[j+1][k+1].draw) {
                    if (k == 0 && playingField[j][k+1].draw)
                        continue;
                    else if (k == playingField[j].length-1 && playingField[j][k-1].draw)
                        continue;
                    else if (playingField[j][k-1].draw && playingField[j][k+1].draw)
                        continue;
                }
            }

            //even row
            if (playingField[j].length%2 == 0 && playingField[j+1] != null) {
                if (k == 0) {
                    if (playingField[j][k+1].draw && playingField[j+1][k].draw)
                        continue;
                }
                else if (k == playingField[j].length-1) {
                    if (playingField[j][k-1].draw && playingField[j+1][k-1].draw)
                        continue;
                }
                else if (playingField[j+1][k-1].draw && playingField[j+1][k].draw) {
                    if (playingField[j][k-1].draw && playingField[j][k+1].draw)
                        continue;
                }
            }

            //collision handling
            // playingField[j][k].detect = true;
            var dx = currBubble.x.toFixed(1) - playingField[j][k].x;
            var dy = currBubble.y.toFixed(1) - playingField[j][k].y;
            if (playingField[j][k].draw && dx * dx + dy * dy <= 3) {
                if (dx > 0) {
                    if (dy > -1 && dy < 1) {
                        copy(j, k+1, currBubble);
                    }
                    else if (dy > 1) {
                        if (playingField[j].length % 2)
                            copy(j-1, k+1, currBubble);
                        else
                            copy(playingField[j-1][k], currBubble);
                    }
                    else {
                        if (playingField[j+1] == null)
                            addRowBottom();
                        if (playingField[j].length % 2)
                            copy(j+1, k+1, currBubble);
                        else
                            copy(j+1, k, currBubble);
                    }
                }
                else {
                    if (dy > -1 && dy < 1) {
                        copy(j, k-1, currBubble);
                    }
                    else if (dy > 1) {
                        if (playingField[j].length % 2)
                            copy(j-1, k, currBubble);
                        else
                            copy(playingField[j-1][k-1], currBubble);
                    }
                    else {
                        if (playingField[j+1] == null)
                            addRowBottom();
                        if (playingField[j].length % 2)
                            copy(j+1, k, currBubble);
                        else
                            copy(j+1, k-1, currBubble);
                    }
                }

                currBubble.x = 0;
                currBubble.y = 0;
                currBubble.dx = 0;
                currBubble.dy = 0;
                currBubble.color = nextBubble.color;
                nextBubble.color = colors[Math.floor(Math.random() * colors.length)];
                break collision;
            }
        }
    }

    drawBubble(currBubble);
    drawBubble(nextBubble);

    // display level and score
    document.getElementById('level').innerHTML = "LEVEL " + level + ": ";
    document.getElementById('score').innerHTML = (Array(scoreLength).join("0") + score).slice(-scoreLength);

	window.requestAnimFrame(render);
}

// Game functions

// TO DO: handle game over - pop remaining bubbles? restart?
function gameOver() {
}

function updateScore() {
    score += pointsPerBubble;

    if(score > level*pointsPerLevel*pointsPerBubble) {
        level++;
        clearInterval(timer);
        timer = setInterval(addRow, initialInterval-2000*level)
    }
}

// Functions for generating sphere vertices

function triangle(a, b, c) {
     bubblePts.push(a);
     bubblePts.push(b);
     bubblePts.push(c);
     index += 3;
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
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
	 var vertices = [vec4(-1, -1, 0, 1),
    				 vec4(-1,  2, 0, 1),
        			 vec4( 1,  2, 0 ,1),
        			 vec4( 1, -1, 0, 1),
        			 vec4(-1, -1, 0, 1),
        			 vec4(-1,  2, 0, 1),
        			 vec4( 1,  2, 0 ,1),
        			 vec4( 1, -1, 0 ,1)];

	var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        cannonPts.push(vertices[indices[i]]);
    }
}