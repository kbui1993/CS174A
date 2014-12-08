// set up web GL variables
var canvas;
var gl;

var debugDetect = 0;
var debugDraw = 0;

// initialize color variable
var vColor;

// initialize buffers
var vBuffer, nBuffer, tBuffer;

// matrix transformation variables
var ctm, modelViewMatrix, projectionMatrix;

// cannon variables
var cannonAngle = 0;
var cannonColor = vec4(1, 1, 1.0, 1.0);
var numVertices = 36;
var cannonPts = [];
var cannonNormals = [];
var vertices = [vec4(-1, -1, 0, 1),
                vec4(-1,  2, 0, 1),
                vec4( 1,  2, 0 ,1),
                vec4( 1, -1, 0, 1),
                vec4(-1, -1, 0, 1),
                vec4(-1,  2, 0, 1),
                vec4( 1,  2, 0 ,1),
                vec4( 1, -1, 0 ,1)];

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
var spin = 0;
var bubbleNormals = [];

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
var scoreLength = 6;
var level = 1;
var pointsPerLevel = 30;
var timer;
var initialInterval = 12000;
var pointsPerBubble = 10;
var enableKeyControls = false;

// sound variables
var sound = true;
var fireSound = new Audio("sound/Ding.wav");
// var gameMusic = new Audio("sound/GrapeGarden.mp3");
var gameMusic = new Audio(null);
var matchSound = new Audio("sound/pop.wav");
var dora = new Audio("sound/dora.mp3");
var startSound = new Audio("sound/start.ogg");
var music;

// intialize texture variables
var texture;
var texCoordsArray = [];
var texSphere = [];
var texCoord = [
    vec2(0,0),
    vec2(0,1),
    vec2(1,1),
    vec2(1,0)
];

// light variables
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var materialAmbient = vec4(1.0, 0.0, 0.0, 1.0);
var ambientProduct = mult(lightAmbient, materialAmbient);

var lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var materialDiffuse = vec4(1.0, 0.0, 0.0, 1.0);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);

var lightSpecular = vec4(0.4, 0.4, 0.4, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var specularProduct = mult(lightSpecular, materialSpecular);

var shininess = 50;
var lightPosition = vec3(5.0, 0.0, 5.0);

function start() {
    $("canvas").css("opacity", "1");
    $(".begin").hide();
    restart();
}

// main function
window.onload = function init() {
    $("canvas").css("opacity", "0.7");
    music = dora;
    music.play();

    // initialize button hover handler
    $("#info-btn").hover(function() {$("#info").fadeIn();},
                         function() {$("#info").fadeOut(300);} 
    );

    // display colored game title
    var title = "Bubble Blasters";
    var html = "";
    var fontColors = new Array("#FF3399", "#9900CC", "#0033CC", "#2EB8B8", "#FF9933");
    
    for (var i = 0; i < title.length; i++) {
        html += ("<span style=\"color:" + fontColors[(i % fontColors.length)] + ";\">" + title[i] + "</span>");
    }
    
    $("h1.begin").html(html);

    // set up canvas
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl){alert("WebGL isn't available");}
    gl.viewport(0,0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.9, 1.0, 1);
    gl.enable(gl.DEPTH_TEST);

    // set up shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // generate vertices
    cannon(vertices, cannonPts, cannonNormals);
    textureCube(texCoordsArray, texCoord);
    textureSphere();
    tetrahedron(va, vb, vc, vd, 3);
    
    // link vColor on js to html
    vColor = gl.getUniformLocation(program, "vColor");

    // link vPosition from js to html
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);

    // create buffer for points
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    // link vNormal from js to html
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(vNormal);

    // create buffer for normals
    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    // link vTexCoord from js to html
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.enableVertexAttribArray(vTexCoord);
   
    // create texture buffer
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    
    // link transformation matrices on js to html
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrix = gl.getUniformLocation(program, "projectionMatrix");

    // link light variables on js to html
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),  flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform3fv(gl.getUniformLocation(program, "lightPosition"),  flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),  shininess);

    setInterval(render,10);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    spin += level*4;

    // loop music
    if (typeof music.loop == 'boolean') {
        music.loop = true;
    } else {
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
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cannonPts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cannonNormals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    configureTexture1(document.getElementById("texImage3"));

    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // render line
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cannonPts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cannonNormals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    configureTexture1(document.getElementById("texImage2"));

    var dx = 0, dy = 0;
    gl.uniform4fv(vColor, vec4(0.5, 0.5, 0.5, 1));
    for (var i = 0; i < 15; i++) {
        dx += 2 * Math.sin(radians(-cannonAngle));
        dy += 2 * Math.cos(radians(-cannonAngle));
        if (dx > 9) {
            ctm = mat4();
            ctm = mult(ctm, rotate(-cannonAngle,[0,0,1]));
            ctm = mult(ctm, scale(vec3(0.06, 0.5, 0.1)));
            ctm = mult(translate(18-dx, dy, 0), ctm);
        }
        else if (dx < -9) {
            ctm = mat4();
            ctm = mult(ctm, rotate(-cannonAngle,[0,0,1]));
            ctm = mult(ctm, scale(vec3(0.06, 0.5, 0.1)));
            ctm = mult(translate(-18-dx, dy, 0), ctm);
        }
        else {
            ctm = mat4();
            ctm = mult(ctm, rotate(cannonAngle,[0,0,1]));
            ctm = mult(ctm, scale(vec3(0.06, 0.5, 0.1)));
            ctm = mult(translate(dx, dy, 0), ctm);
        }
        gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);
    }
    
    // render playing field
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bubblePts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bubbleNormals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texSphere), gl.STATIC_DRAW);
    configureTexture1(document.getElementById("texImage"));

    for (var j = 0; j < numRows; j++) {
        for (var k = 0; k < playingField[j].length; k++) {
            drawBubble(playingField[j][k]);
            playingField[j][k].match = false;
            playingField[j][k].connected = false;
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
            // // skip bubbles that do not need to be checked
            // playingField[j][k].detect = false;

            // // odd row
            // if (playingField[j].length % 2 && playingField[j+1] != null && j!=0) {
            //     if (playingField[j+1][k].draw && playingField[j+1][k+1].draw) {
            //         if (k == 0 && playingField[j][k+1].draw)
            //             continue;
            //         else if (k == playingField[j].length-1 && playingField[j][k-1].draw)
            //             continue;
            //         else if (playingField[j][k-1].draw && playingField[j][k+1].draw)
            //             continue;
            //     }
            // }

            // // even row
            // if (playingField[j].length % 2 == 0 && playingField[j+1] != null && j!=0) {
            //     if (k == 0) {
            //         if (playingField[j][k+1].draw && playingField[j+1][k].draw)
            //             continue;
            //     }
            //     else if (k == playingField[j].length-1) {
            //         if (playingField[j][k-1].draw && playingField[j+1][k-1].draw)
            //             continue;
            //     }
            //     else if (playingField[j+1][k-1].draw && playingField[j+1][k].draw) {
            //         if (playingField[j][k-1].draw && playingField[j][k+1].draw)
            //             continue;
            //     }
            // }

            // // collision handling
            // playingField[j][k].detect = true;
            var dx = currBubble.x.toFixed(1) - playingField[j][k].x;
            var dy = currBubble.y.toFixed(1) - playingField[j][k].y;
            if (playingField[j][k].draw && dx * dx + dy * dy <= 3) {
                if (currBubble.x > 9) {
                    dx *= -1;
                }
                if (currBubble.x < -9) {
                    dx *= -1;
                }
                if (dx > 0) {
                    if (dy > -1 && dy < 1) {
                        copy(j, k+1, currBubble);
                    }
                    else if (dy > 1) {
                        if (playingField[j].length % 2)
                            copy(j-1, k+1, currBubble);
                        else
                            copy(j-1, k, currBubble);
                    }
                    else {
                        if (playingField[j+1] == null) {
                            if(numRows == maxRows) {
                                gameOver();
                                return;
                            }
                            addRowBottom();
                        }
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
                            copy(j-1, k-1, currBubble);
                    }
                    else {
                        if (playingField[j+1] == null) {
                            if(numRows == maxRows) {
                                gameOver();
                                return;
                            }
                            addRowBottom();
                        }
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
            else if (j == 0 && dx * dx + dy * dy <= 2) {
                copy(j, k, currBubble);
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

    // display stats
    $('#level').html("Level " + level + ": ");
    $('#score').html((Array(scoreLength).join("0") + score).slice(-scoreLength));
}

// functions for generating cube vertices
/*function cannon() {
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
        // TO DO: push cannon normals, currently choosing random vec
        cannonNormals.push(vec3(0,0,1));
    }
} */

function cannon(vertices, points, normals){
    quad(vertices, points, normals, 0, 1, 2, 3, vec3(0, 0, 1));
    quad(vertices, points, normals, 4, 0, 6, 2, vec3(0, 1, 0));
    quad(vertices, points, normals, 4, 5, 0, 1, vec3(1, 0, 0));
    quad(vertices, points, normals, 2, 3, 6, 7, vec3(1, 0, 1));
    quad(vertices, points, normals, 6, 7, 4, 5, vec3(0, 1, 1));
    quad(vertices, points, normals, 1, 5, 3, 7, vec3(1, 1, 0 ));
}

function quad(vertices, points, normals, v1, v2, v3, v4, normal){
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}

// functions for generating sphere vertices
function triangle(a, b, c) {
    bubblePts.push(a);
    bubblePts.push(b);
    bubblePts.push(c);

    bubbleNormals.push(a[0],a[1], a[2], 0.0);
    bubbleNormals.push(b[0],b[1], b[2], 0.0);
    bubbleNormals.push(c[0],c[1], c[2], 0.0);

    // texSphere.push(vec2((a[0]+1)/2,(a[1]+1)/2));
    // texSphere.push(vec2((b[0]+1)/2,(b[1]+1)/2));
    // texSphere.push(vec2((c[0]+1)/2,(c[1]+1)/2));

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

// function to configure texture
function configureTexture1( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// function to push vertices for texture cube
function texturequad(texture_array, texture_coord) {
    texture_array.push(texture_coord[0]);
    texture_array.push(texture_coord[1]);
    texture_array.push(texture_coord[2]); 
    texture_array.push(texture_coord[0]); 
    texture_array.push(texture_coord[2]);  
    texture_array.push(texture_coord[3]); 
}

// function to create vertices for texture cube
function textureCube(texture_array, texture_coord) {
    texturequad(texture_array, texture_coord);
    texturequad(texture_array, texture_coord);
    texturequad(texture_array, texture_coord);
    texturequad(texture_array, texture_coord);
    texturequad(texture_array, texture_coord);
    texturequad(texture_array, texture_coord);
}

// function to generate texture coordinates for sphere
function textureSphere() {
    var latitudeBands = 60;
    var longitudeBands = 60;

    for(var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        for(var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var u = 1 - (longNumber/longitudeBands);
            var v = 1 - (latNumber/latitudeBands);
            texSphere.push(u);
            texSphere.push(v);
        }
    }
}