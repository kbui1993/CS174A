var gl;
 
var index = 0;

var bubblePts = [];

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var ctm;
var modelViewMatrix;
var projectionMatrix;
    
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

window.onload = function init() {
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    tetrahedron(va, vb, vc, vd, 5);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrix = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrix = gl.getUniformLocation( program, "projectionMatrix" );

    render();
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pMatrix = ortho(-10, 10, 0, 20, -10, 10);
    gl.uniformMatrix4fv(projectionMatrix, false, flatten(pMatrix) );

    ctm = mat4();

    // Render sphere.
    translation = vec3(0, 10, 0);
    ctm = mult(ctm, translate(translation));

    gl.bufferData(gl.ARRAY_BUFFER, flatten(bubblePts), gl.STATIC_DRAW);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm) );
    
        
    for( var i=0; i<index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}