let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 5000; // ms

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
        (Math.sin(0 * Math.PI / 180)), -1.0, (Math.cos(0 * Math.PI / 180)),    //0
        (Math.sin(72 * Math.PI / 180)), -1.0, (Math.cos(72 * Math.PI / 180)),  //1
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
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        // Bottom face (A)
        (Math.sin(0 * Math.PI / 180)), -1.0, (Math.cos(0 * Math.PI / 180)),     //0
        (Math.sin(72 * Math.PI / 180)), -1.0, (Math.cos(72 * Math.PI / 180)),   //1
        (Math.sin(144 * Math.PI / 180)), -1.0, (Math.cos(144 * Math.PI / 180)), //2
        (Math.sin(216 * Math.PI / 180)), -1.0, (Math.cos(216 * Math.PI / 180)), //3
        (Math.sin(288 * Math.PI / 180)), -1.0, (Math.cos(288 * Math.PI / 180)), //4

        // Top Face (B)
        (Math.sin(180 * Math.PI / 180)), 1.0, (Math.cos(180 * Math.PI / 180)),  // 5 
        (Math.sin(252 * Math.PI / 180)), 1.0, (Math.cos(252 * Math.PI / 180)),  // 6
        (Math.sin(324 * Math.PI / 180)), 1.0, (Math.cos(324 * Math.PI / 180)),  // 7 
        (Math.sin(36 * Math.PI / 180)), 1.0, (Math.cos(36 * Math.PI / 180)),    // 8 
        (Math.sin(108 * Math.PI / 180)), 1.0, (Math.cos(108 * Math.PI / 180)),  // 9 
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [0.85, 0.0, 0.2, 1.0], // Bottom face
        [0.1, 0.3, 0.9, 1.0], // Top Parent Face
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
        0, 1, 2, 0, 2, 3, 0, 3, 4, // Bottom face
        5, 6, 7, 5, 7, 8, 5, 8, 9,
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
    let width = 0.75;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        // Top Front Face
        -width, 0.0, width,  //0
        width, 0.0, width,   //1
        0.0, 1.0, 0.0,   //2

        // Top Bottom Face
        -width, 0.0, width,  //3 (Repeat 0)
        width, 0.0, width,   //4 (Repeat 1)
        0.0, -1.0, 0.0,  //5

        // Left Top Face
        -width, 0.0, -width,  //6 
        -width, 0.0, width,  //7 (Repeat 0)
        0.0, 1.0, 0.0,   //8 (Repeat 2)

        // Left Bottom Face
        -width, 0.0, -width,  //9  (Repeat 6)
        -width, 0.0, width,   //10 (Repeat 7)
        0.0, -1.0, 0.0,   //11 (Repeat 5)

        // Back Top Face
        -width, 0.0, -width,  //12  (Repeat 7,0)
        width, 0.0, -width,  //13
        0.0, 1.0, 0.0,  //14 (Repeat 2)

        // Back Bottom Face
        -width, 0.0, -width,  //15 (Repeat 12)
        width, 0.0, -width,  //16 (Repeat 13)
        0.0, -1.0, 0.0,  //17 (Repeat 5,1)

        // Rigth Top Face
        width, 0.0,width,  //18  (Repeat 4,1)
        width, 0.0, -width, //19 
        0.0, 1.0, 0.0,  //20 

        // Rigth Bottom Face
        width, 0.0, width,  //21
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