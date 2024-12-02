---
title: "WebGL with Claude.ai"
date: "2024-12-01"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/12/claude.jpg"
categories:
- "blog"
- "ai"
- "generative-shaders"
- "webgl"
- "web"
---

Back when I was making episodes of [Web Components from Space](https://webcomponents.space/), one of my last experiments was using
AI to generate code in languages or environments that are just painful to work with.

WebGL is one of those environments. I'm jealous of my colleague who explored WebGPU and I mean to do the same in the future. It looks much better, although
it STILL is experimental browser tech.

So here I am trying to make stuff in WebGL.

In my video series, I'd have AI write a shader for me when I tell it what kind of vibe I want to evoke. It barely worked, but it was
fun trying to get it to work!

Either way, I'm keeping it up! I put a WebGL canvas in the footer of my website. Every so often when I write a new blog post, I'll
do my best to get the AI to cooperate and make a new shader for me.

I've had super bad luck with Github Copilot and ChatGPT in the past, so now I'm giving [Claude.ai](https://claude.ai/) a go.

My first prompt was:

*"Can you write me a WebGL shader that appears really wide like a banner and evokes feelings of starting fresh?"*

I had a bit of trouble with mismatched variable names across my shader code but ended up with 2 circles orbiting each other on the left side.
Here's what I got:

<canvas id="start-fresh" style="width: 350px; height: 350px"></canvas>

## A New Shader
In my latest post, I wrote about [playing a MIDI sequence with Tone.js](https://benfarrell.com/blog/2024-12-01-playing-a-note-sequence/).
So in my next Claude.ai prompt:

*"please change this shader completely to invoke playing music or playing beats"*

I ended up with a pulsing circle on the left side of my banner. I guess Claude REALLY likes circles. I thought it was too boring though,
so tried again:

*"can we try something that looks like it's visualizing frequency instead?"*

Unfortunately, this time I got back non-working code. Something about arrays not being supported in WebGL

```glsl
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform float[8] frequencies; // Array of frequency amplitudes
```

When I complained it didn't work, and asked it to try again, I got back a something that looked like an EQ with frequency bars bouncing up and down.
It was pretty decent, but it was confined to the left side of the banner.

I did a couple more iterations before changing the code myself to make the bars span all the way across my banner, playing with size and number
of frequency bars a bit.

Ultimately, I'm happy - though it IS a bit ugly. I'll note that I do apply some CSS filters and opacity in my actual footer to make things a bit softer and subtler.
Anyway, maybe I'll try suggesting colors in my next go-around.

<canvas id="music" style="width: 350px; height: 350px"></canvas>

![Claude.ai](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/12/claude.jpg)

<script>
function init(id) {
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

	const fragmentShaderSource2 = `
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

	const vertexShader = create(
		gl,
		gl.VERTEX_SHADER,
		vertexShaderSource
	);
	const fragmentShader = create(
		gl,
		gl.FRAGMENT_SHADER,
		id === 'music' ? fragmentShaderSource2 : fragmentShaderSource
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

function anim(shader) {
	const currentTime = new Date().getTime() / 1000 - shader.startTime;
	shader.gl.uniform1f(shader.timeUniformLocation, currentTime);
	shader.gl.drawArrays(shader.gl.TRIANGLE_STRIP, 0, 4);
	requestAnimationFrame(() => anim(shader));
}

function create(
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

let shdr = init('start-fresh');
let shdr2 = init('music');
anim(shdr);
anim(shdr2);

</script>


