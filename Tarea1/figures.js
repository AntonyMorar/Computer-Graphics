let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 5000; // ms
let availableColors = [

]

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas) {
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try {
        gl = canvas.getContext("experimental-webgl");
    } catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
}

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

function createPiramid(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        // Bottom face
        (Math.sin(0 * Math.PI / 180)), -1.0, (Math.cos(0 * Math.PI / 180)), //0
        (Math.sin(72 * Math.PI / 180)), -1.0, (Math.cos(72 * Math.PI / 180)), //1
        (Math.sin(144 * Math.PI / 180)), -1.0, (Math.cos(144 * Math.PI / 180)), //2
        (Math.sin(216 * Math.PI / 180)), -1.0, (Math.cos(216 * Math.PI / 180)), //3
        (Math.sin(288 * Math.PI / 180)), -1.0, (Math.cos(288 * Math.PI / 180)), //4
        //Faces, start with face 0 to 1, then clockwise
        (Math.sin(0 * Math.PI / 180)), -1.0, (Math.cos(0 * Math.PI / 180)), //5 (Mirror 0)
        (Math.sin(72 * Math.PI / 180)), -1.0, (Math.cos(72 * Math.PI / 180)), //6 (Mirror 1)
        0.0, 1.0, 0.0, //7

        (Math.sin(72 * Math.PI / 180)), -1.0, (Math.cos(72 * Math.PI / 180)), //8 (Mirror 1)
        (Math.sin(144 * Math.PI / 180)), -1.0, (Math.cos(144 * Math.PI / 180)), //9 (Mirror 2)
        0.0, 1.0, 0.0, //10

        (Math.sin(144 * Math.PI / 180)), -1.0, (Math.cos(144 * Math.PI / 180)), //11 (Mirror 2)
        (Math.sin(216 * Math.PI / 180)), -1.0, (Math.cos(216 * Math.PI / 180)), //12 (Mirror 3)
        0.0, 1.0, 0.0, //13

        (Math.sin(216 * Math.PI / 180)), -1.0, (Math.cos(216 * Math.PI / 180)), //14 (Mirror 3)
        (Math.sin(288 * Math.PI / 180)), -1.0, (Math.cos(288 * Math.PI / 180)), //15 (Mirror 4)
        0.0, 1.0, 0.0, //16

        (Math.sin(288 * Math.PI / 180)), -1.0, (Math.cos(288 * Math.PI / 180)), //17 (Mirror 4)
        (Math.sin(0 * Math.PI / 180)), -1.0, (Math.cos(0 * Math.PI / 180)), //18 (Mirror 0)
        0.0, 1.0, 0.0, //19
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [0.6, 0.0, 0.3, 1.0], // L1
        [0.0, 0.9, 0.3, 1.0], // L2
        [0.2, 0.9, 1, 1.0], // L3
        [1, 0.2, 0.76, 1.0], // L4
        [0.3, 0.3, 0.8, 1.0], // L5
    ];

    let vertexColors = [];
    let index = 0;
    faceColors.forEach(color => {
        if (index == 0) {
            for (let j = 0; j < 5; j++) vertexColors.push(...color);
        } else {
            for (let j = 0; j < 3; j++) vertexColors.push(...color);
        }
        index++;
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [
        0, 1, 2, 0, 2, 3, 0, 3, 4, // Bottom face
        5, 6, 7,
        8, 9, 10,
        11, 12, 13,
        14, 15, 16,
        17, 18, 19
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    let pyramid = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: pyramidIndexBuffer,
        vertSize: 3,
        nVerts: verts.length,
        colorSize: 4,
        nColors: verts.length,
        nIndices: pyramidIndices.length,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
}

function createDodecahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    let goldR = (1 + Math.sqrt(5)) / 2; //Golden Ratio
    let radius=0.6;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let points = {
        //(±1, ±1, ±1)
        'A': [1, 1, 1],
        'B': [1, 1, -1],
        'C': [1, -1, 1],
        'D': [1, -1, -1],
        'E': [-1, 1, 1],
        'F': [-1, 1, -1],
        'G': [-1, -1, 1],
        'H': [-1, -1, -1],
        //(0, ±ϕ, ± 1 / ϕ )
        'I': [0, goldR, 1 / goldR],
        'K': [0, goldR, -1 / goldR],
        'J': [0, -goldR, 1 / goldR],
        'L': [0, -goldR, -1 / goldR],
        //(± 1 / ϕ , 0, ±ϕ)
        'M': [1 / goldR, 0, goldR],
        'N': [1 / goldR, 0, -goldR],
        'P': [-1 / goldR, 0, goldR],
        'O': [-1 / goldR, 0, -goldR],
        //(±ϕ, ± 1 / ϕ , 0)
        'Q': [goldR, 1 / goldR, 0],
        'R': [-goldR, -1 / goldR, 0],
        'S': [goldR, -1 / goldR, 0],
        'T': [-goldR, 1 / goldR, 0]
    }

    let verts = []
    //(O,H,L,D,N) clockwise
    verts.push(...points.O) //0
    verts.push(...points.H) //1
    verts.push(...points.L) //2
    verts.push(...points.D) //3
    verts.push(...points.N) //4
    //(O,N,B,K,F) clockwise
    verts.push(...points.O) //5
    verts.push(...points.N) //6
    verts.push(...points.B) //7
    verts.push(...points.K) //8
    verts.push(...points.F) //9
    //(D,S,Q,B,N) clockwise
    verts.push(...points.D) //10
    verts.push(...points.S) //11
    verts.push(...points.Q) //12
    verts.push(...points.B) //13
    verts.push(...points.N) //14
    //(F,T,R,H,O) clockwise
    verts.push(...points.F) //15
    verts.push(...points.T) //16
    verts.push(...points.R) //17
    verts.push(...points.H) //18
    verts.push(...points.O) //19
    //(K,I,E,T,F) clockwise
    verts.push(...points.K) //20
    verts.push(...points.I) //21
    verts.push(...points.E) //22
    verts.push(...points.T) //23
    verts.push(...points.F) //24
    //(B,Q,A,I,K) clockwise
    verts.push(...points.B) //25
    verts.push(...points.Q) //26
    verts.push(...points.A) //27
    verts.push(...points.I) //28
    verts.push(...points.K) //29
    //(L,J,C,S,D) clockwise
    verts.push(...points.L) //30
    verts.push(...points.J) //31
    verts.push(...points.C) //32
    verts.push(...points.S) //33
    verts.push(...points.D) //34
    //(H,R,G,J,L) clockwise
    verts.push(...points.H) //35
    verts.push(...points.R) //36
    verts.push(...points.G) //37
    verts.push(...points.J) //38
    verts.push(...points.L) //39
    //(T,E,P,G,R) clockwise
    verts.push(...points.T) //40
    verts.push(...points.E) //41
    verts.push(...points.P) //42
    verts.push(...points.G) //43
    verts.push(...points.R) //44
    //(S,C,M,A,Q) clockwise
    verts.push(...points.S) //45
    verts.push(...points.C) //46
    verts.push(...points.M) //47
    verts.push(...points.A) //48
    verts.push(...points.Q) //49
    //(G,P,M,C,J) clockwise
    verts.push(...points.G) //50
    verts.push(...points.P) //51
    verts.push(...points.M) //52
    verts.push(...points.C) //53
    verts.push(...points.J) //54
    //(A,M,P,E,I) clockwise
    verts.push(...points.A) //55
    verts.push(...points.M) //56
    verts.push(...points.P) //57
    verts.push(...points.E) //58
    verts.push(...points.I) //59
    // Scale
    verts=verts.map(function(vert) { return vert * radius; });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [0.2, 0.0, 0.9, 1.0],
        [1.0, 0.0, 0.2, 1.0], 
        [0.2, 0.9, 0.0, 1.0], 
        [0.9, 0.0, 1.0, 1.0], 
        [1.0, 0.9, 0.0, 1.0], 
        [0.0, 0.8, 1.0, 1.0], 
        [0.98, 0.3, 0.3, 1.0], 
        [0.5, 0.5, 1.0, 1.0], 
        [0.6, 1.0, 0.4, 1.0], 
        [1.0, 0.5, 0.5, 1.0], 
        [0.3, 0.8, 0.65, 1.0], 
        [0.4, 0.1, 1.0, 1.0], 
    ];

    let vertexColors = [];
    faceColors.forEach(color => {
        for (let j = 0; j < 5; j++) vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [
        0, 1, 2, 0, 2, 4, 2, 3, 4,
        5, 6, 7, 5, 7, 9, 7, 8, 9,
        10, 11, 12, 10, 12, 14, 12, 13, 14,
        15, 16, 17, 15, 17, 19, 17, 18, 19,
        20, 21, 22, 20, 22, 24, 22, 23, 24,
        25, 26, 27, 25, 27, 29, 27, 28, 29,
        30, 31, 32, 30, 32, 34, 32, 33, 34,
        35, 36, 37, 35, 37, 39, 37, 38, 39,
        40, 41, 42, 40, 42, 44, 42, 43, 44,
        45, 46, 47, 45, 47, 49, 47, 48, 49,
        50, 51, 52, 50, 52, 54, 52, 53, 54,
        55, 56, 57, 55, 57, 59, 57, 58, 59,
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    let pyramid = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: pyramidIndexBuffer,
        vertSize: 3,
        nVerts: verts.length,
        colorSize: 4,
        nColors: verts.length,
        nIndices: pyramidIndices.length,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
}

function createOctahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    let width = 0.6;
    let dy = 0.1;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        // Top Front Face
        -width, 0.0, width, //0
        width, 0.0, width, //1
        0.0, 1.0, 0.0, //2

        // Top Bottom Face
        -width, 0.0, width, //3 (Repeat 0)
        width, 0.0, width, //4 (Repeat 1)
        0.0, -1.0, 0.0, //5

        // Left Top Face
        -width, 0.0, -width, //6 
        -width, 0.0, width, //7 (Repeat 0)
        0.0, 1.0, 0.0, //8 (Repeat 2)

        // Left Bottom Face
        -width, 0.0, -width, //9  (Repeat 6)
        -width, 0.0, width, //10 (Repeat 7)
        0.0, -1.0, 0.0, //11 (Repeat 5)

        // Back Top Face
        -width, 0.0, -width, //12  (Repeat 7,0)
        width, 0.0, -width, //13
        0.0, 1.0, 0.0, //14 (Repeat 2)

        // Back Bottom Face
        -width, 0.0, -width, //15 (Repeat 12)
        width, 0.0, -width, //16 (Repeat 13)
        0.0, -1.0, 0.0, //17 (Repeat 5,1)

        // Rigth Top Face
        width, 0.0, width, //18  (Repeat 4,1)
        width, 0.0, -width, //19 
        0.0, 1.0, 0.0, //20 

        // Rigth Bottom Face
        width, 0.0, width, //21
        width, 0.0, -width, //22 
        0.0, -1.0, 0.0, //23 
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [0.9, 0.4, 0.0, 1.0], // Top Front Face
        [0.4, 0.9, 0.0, 1.0],
        [0.5, 0.1, 0.88, 1.0],
        [0.1, 0.3, 1.0, 1.0],
        [0.9, 0.0, 0.5, 1.0],
        [0.7, 1.0, 1.0, 1.0],
        [0.2, 0.0, 1.0, 1.0],
        [0.0, 0.7, 0.5, 1.0],
    ];

    let vertexColors = [];
    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++) vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
        0, 1, 2, // Top Front Face
        3, 4, 5, // Top Bottom Face
        6, 7, 8, // Left Top Face
        9, 10, 11, // Left Bottom Face
        12, 13, 14, // Back Top Face
        15, 16, 17, // Back Bottom Face
        18, 19, 20, // Rigth Top Face
        21, 22, 23, // Rigth Bottom Face
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

    let octahedron = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: octahedronIndexBuffer,
        vertSize: 3,
        nVerts: verts.length,
        colorSize: 4,
        nColors: verts.length,
        nIndices: octahedronIndices.length,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    };

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    octahedron.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return octahedron;
}

function createShader(gl, str, type) {
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) {
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) {
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function () {
        run(gl, objs);
    });

    draw(gl, objs);

    for (i = 0; i < objs.length; i++)
        objs[i].update();
}