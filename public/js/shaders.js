function initialize(id) {
	const canvas = document.getElementById(id);
	const gl = canvas?.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha:true});

	const startTime = new Date().getTime() / 1000;
	const bounds = canvas.getBoundingClientRect();
	canvas.width = bounds.width;
	canvas.height = bounds.height;
	gl.viewport(0, 0, canvas.width, canvas.height);

	const vertexShaderSource = `
          attribute vec2 position;
          void main() {
              gl_Position = vec4(position, 0.0, 1.0);
            }
          `;

	const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform vec2 resolution;

// Function to create a soft, organic shape
float organicShape(vec2 st, float radius) {
    return smoothstep(radius, radius + 0.01, length(st - vec2(0.5)));
}

void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;
    st.x *= resolution.x / resolution.y; // Correct aspect ratio

    // Create a gradient background
    vec3 color1 = vec3(0.0, 0.7, 1.0); // Sky blue
    vec3 color2 = vec3(1.0, 1.0, 1.0); // White
    vec3 bgcolor = mix(color1, color2, st.y);

    // Add some animated, floating shapes
    float t = time * 1.5;
    vec2 pos1 = vec2(sin(t * 0.7) * 0.7 + 0.5, cos(t * 0.5) * 0.1 + 0.0);
    vec2 pos2 = vec2(cos(t * 0.3) * 0.6 + 0.5, sin(t * 0.4) * 0.2 + 0.0);

    float shape1 = organicShape(st - pos1, 0.1);
    float shape2 = organicShape(st - pos2, 0.15);

    // Combine shapes with the background
    vec3 finalColor = mix(bgcolor, vec3(1.0), 1.0 - shape1 * shape2);

    // Add a subtle pulsing effect
    finalColor += vec3(sin(time * 5.0) * 0.05);

    gl_FragColor = vec4(finalColor, 1.0);
}
  `;

	const vertexShader = createShader(
		gl,
		gl.VERTEX_SHADER,
		vertexShaderSource
	);
	const fragmentShader = createShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentShaderSource
	);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(
			"Unable to initialize the shader program:",
			gl.getProgramInfoLog(program)
		);
	}

	gl.useProgram(program);

	const timeUniformLocation = gl.getUniformLocation(
		program,
		"time"
	);
	const positionAttributeLocation = gl.getAttribLocation(
		program,
		"position"
	);
	const resolutionUniformLocation = gl.getUniformLocation(
		program,
		"resolution"
	);

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
		gl.STATIC_DRAW
	);

	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
	return { canvas, gl, startTime, timeUniformLocation, resolutionUniformLocation, positionAttributeLocation}
}

function animate(shader) {
	const currentTime = new Date().getTime() / 1000 - shader.startTime;
	shader.gl.uniform1f(shader.timeUniformLocation, currentTime);
	shader.gl.drawArrays(shader.gl.TRIANGLE_STRIP, 0, 4);
	requestAnimationFrame(() => animate(shader));
}

function createShader(
	gl,
	type,
	source
) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(
			"An error occurred compiling the shaders:",
			gl.getShaderInfoLog(shader)
		);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

let shader1 = initialize('shader');
let shader2 = initialize('shader2');
animate(shader1);
animate(shader2);

window.addEventListener("resize", () => {
	shader1 = initialize('shader');
	shader2 = initialize('shader2');
	animate(shader1);
	animate(shader2);
});
