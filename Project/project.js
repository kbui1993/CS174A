//initializing webgl variable
var gl;

//initializing point and color variables
var points = [];
var numVertices = 36;
var colors = []
var vColor;

//initializing matrix transformation variables
var modelViewMatrix;
var projectionMatrix;

//initializing variables to change directions of camera
var radius = 1.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = Math.PI/180.0;

//initializing scaling of cube variable
var scale_cube;

//initializing translation of cube
var translation;

//initializing camera variables
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

//initializing variable to spin cannon
var spin = 0;

//initialzing variable for keyboard input
var currentlyPressedKeys = {};

function cannon()
{
	quad(1, 0, 3, 2);
	quad(2, 3, 7, 6);
	quad(3, 0, 4, 7);
	quad(6, 5, 1, 2);
	quad(4, 5, 6, 7);
	quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{

	 var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

	var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        
    }
}


window.onload = function init()
{
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){alert("WebGL isn't available");}

	cannon();

	gl.viewport(0,0, canvas.width, canvas.height);
	gl.clearColor(1.00, 1.00, 1.00, 1);

	//enabling 3d depth
	gl.enable(gl.DEPTH_TEST);

	//setting up shaders
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	//linking vColor on javascript to html
	vColor = gl.getUniformLocation(program, "vColor");

	//creating buffer for points
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	//linking vPosition on javascript to html
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	//linking transformation matrices on javascript to html
	modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrix = gl.getUniformLocation(program, "projectionMatrix");

	render();

}

function render()
{
	gl.uniform4f(vColor, .10, .70, .50, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	translation = vec3(0, -9.5, 0);

	pMatrix = ortho(-10, 10, -10, 10, -10, 10);
	gl.uniformMatrix4fv(projectionMatrix, false, flatten(pMatrix));


	eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta), radius*Math.cos(phi));
	var ctm = lookAt(eye, at, up);
	ctm = mult(ctm, translate(translation));
	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);

	window.requestAnimFrame(render);
}