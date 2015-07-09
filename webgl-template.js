// globals
var gTriangleVertexBuffer;
var gTriangleIndexBuffer;
var gShaderProgram;

function onload () {
    // initialize GL
    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // do one-time initialization of graphics resources
    init(gl);

    // call draw() approx. 60 times per second. (60fps)
    setInterval(function () { draw(gl); }, 1000/60);
}

function init (gl) {
    var triangleVertexData = new Float32Array([
    //  position (x,y)  color (r,g,b)
        -0.5, -0.5,     1.0, 0.0, 0.0,
         0.5, -0.5,     0.0, 1.0, 0.0,
         0.0,  0.5,     0.0, 0.0, 1.0
    ]);

    var triangleIndexData = new Uint16Array([
        0, 1, 2
    ]);

    var vertexShaderSource = "uniform lowp vec4 tint;\n" +
                             "\n" +
                             "attribute highp vec4 vertexPosition;\n" +
                             "attribute lowp vec4 vertexColor;\n" +
                             "\n" +
                             "varying lowp vec4 fragmentColor;\n" +
                             "\n" +
                             "void main() {\n" +
                             "    fragmentColor = vertexColor * tint;\n" +
                             "    gl_Position = vertexPosition;\n" +
                             "}\n";

    var fragmentShaderSource = "varying lowp vec4 fragmentColor;\n" +
                               "\n" +
                               "void main() {\n" +
                               "    gl_FragColor = fragmentColor;\n" +
                               "}\n";

    // allocate and upload vertex data
    gTriangleVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gTriangleVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertexData, gl.STATIC_DRAW);

    // allocate and upload index data
    gTriangleIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gTriangleIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndexData, gl.STATIC_DRAW);

    // upload and compile the vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // upload and compile the fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // link the vertex shader and fragment shader together into a shader program
    gShaderProgram = gl.createProgram();
    gl.attachShader(gShaderProgram, vertexShader);
    gl.attachShader(gShaderProgram, fragmentShader);
    gl.linkProgram(gShaderProgram);
}

function draw (gl) {
    // clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT);

    // set the shader program to use to draw
    gl.useProgram(gShaderProgram);

    // update the uniform tint
    var currentTimeInSeconds = Date.now() / 1000.0;
    var strobePeriodInSeconds = 3;
    var tint = Math.abs(Math.sin(Math.PI / strobePeriodInSeconds * currentTimeInSeconds));
    var tintLocation = gl.getUniformLocation(gShaderProgram, "tint");
    gl.uniform4f(tintLocation, tint, tint, tint, 1.0);

    // explain to GL how to read the raw position data that was uploaded, then enable it.
    var positionLocation = gl.getAttribLocation(gShaderProgram, "vertexPosition");
    var positionSize = 2;
    var positionType = gl.FLOAT;
    var positionNormalized = false;
    var positionStrideInBytes = 20;
    var firstPositionOffsetInBytes = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, gTriangleVertexBuffer);
    gl.vertexAttribPointer(
        positionLocation,
        positionSize,
        positionType,
        positionNormalized,
        positionStrideInBytes,
        firstPositionOffsetInBytes);
    gl.enableVertexAttribArray(positionLocation);

    // explain to GL how to read the raw color data that was uploaded, then enable it.
    var colorLocation = gl.getAttribLocation(gShaderProgram, "vertexColor");
    var colorSize = 3;
    var colorType = gl.FLOAT;
    var colorNormalized = false;
    var colorStrideInBytes = 20;
    var firstColorOffsetInBytes = 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, gTriangleVertexBuffer);
    gl.vertexAttribPointer(
        colorLocation,
        colorSize,
        colorType,
        colorNormalized,
        colorStrideInBytes,
        firstColorOffsetInBytes);
    gl.enableVertexAttribArray(colorLocation);

    // draw the triangle using the previously set up program and vertex/index data.
    var indexCount = 3;
    var indexType = gl.UNSIGNED_SHORT;
    var firstIndexOffsetInBytes = 0;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gTriangleIndexBuffer);
    gl.drawElements(gl.TRIANGLES, indexCount, indexType, firstIndexOffsetInBytes);
}