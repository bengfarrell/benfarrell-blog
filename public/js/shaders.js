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

// Simulated frequency function with more variation
float frequencyValue(float x) {
    return 0.5 + 0.5 * (
        sin(x * 15.0 + time * 2.0) *
        sin(x * 7.0 + time) *
        cos(x * 3.0)
    );
}

void main() {
    vec2 st = gl_FragCoord.xy / resolution.xy;
    st.x *= resolution.x / resolution.y; // Correct aspect ratio

    // Increase number of frequency bands to fill entire width
    float bands = 32.0;
    float bandWidth = bands / resolution.xy[1];

    // Base dark background
    vec3 backgroundColor = vec3(0.02, 0.02, 0.05);
    vec3 finalColor = backgroundColor;

    // Iterate through frequency bands
    for (int i = 0; i < 64; i++) {
        // Calculate band position and frequency
        float bandPos = float(i) * bandWidth;
        float freq = frequencyValue(float(i));

        // Check if current pixel is in this frequency band
        if (st.x >= bandPos && st.x < bandPos + bandWidth) {
            // Create more complex color gradient
            vec3 barColor = mix(
                vec3(0.1, 0.0, 0.5),   // Deep purple (low frequencies)
                vec3(0.1, 1.0, 0.9),   // Bright cyan (high frequencies)
                pow(float(i) / 63.0, 1.5)
            );

            // Create vertical bar with frequency-based height
            float barHeight = freq * 0.9;

            // Check if pixel is within bar height
            if (st.y < barHeight) {
                // More complex vertical gradient
                float gradient = pow(st.y / barHeight, 0.7);
                finalColor = mix(
                    barColor * 0.5,
                    barColor * 1.5,
                    gradient
                );

                // Add subtle horizontal noise
                float noise = fract(sin(st.y * 50.0 + time) * 10.0) * 0.1;
                finalColor += noise * barColor;
            }
        }
    }

    // Add more dynamic animation
    finalColor *= 1.0 + sin(time * 4.0) * 0.15;

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

let shader = initialize('shader');
animate(shader);

window.addEventListener("resize", () => {
	shader = initialize('shader');
	animate(shader);
});
