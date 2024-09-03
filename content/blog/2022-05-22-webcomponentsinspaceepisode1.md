---
title: "Web Components in Space Episode 2"
date: "2022-05-22"
categories:
  - "blog"
  - "web"
  - "web-components-in-space"
  - "web-components"
---

This is a cross-post of the second episode of my spacelab based Web Components learning video series called "Web Components in Space"!

      <ul class="episode-list">
        <li>
            <strong>Episode 2:</strong> <a target="_blank" href="https://www.youtube.com/playlist?list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU">Watch all of Episode 2</a>
            <p>
                Play this playlist for the intro, the run-down on what we'll learn and do in Episode 2, the show and tell,
                the interview, and the seven part lab.
            </p>
        </li>
        <li>
            <strong>Episode 2.1:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=BiOCZyk9RBs&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=2">Episode 2 Run-down</a>
            <p>
                Ben gives a quick run-down on what we'll learn and build today, the technologies we'll use, who we'll
                be talking to and what they built.
            </p>
            <p>
                Tools and technology we'll use today:
            </p>
            <ul>
                <li><a href="https://opensource.adobe.com/spectrum-web-components/" target="_blank">Adobe's Spectrum Web Components</a></li>
                <li><a href="https://lit.dev/" target="_blank">Lit</a></li>
                <li><a href="https://modern-web.dev/docs/dev-server/overview/" target="_blank">Web Dev Server</a></li>
                <li><a href="https://github.com/halvves/shader-doodle" target="_blank">Shader Doodle</a></li>
                <li><a href="https://www.npmjs.com/package/lit-code" target="_blank">Lit Code</a></li>
                <li><a href="https://prismjs.com/" target="_blank">Prism.js</a></li>
                <li><a href="https://jnordberg.github.io/gif.js/" target="_blank">Gif.js</a></li>
                <li><a href="https://www.shadertoy.com/" target="_blank">Shaders from ShaderToy</a></li>
            </ul>
        </li>
        <li>
            <strong>Episode 2.2:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=fuq4eHR67bI&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=3">Show &amp; Tell</a>
            <p>
                Ben shows off our special guest's component they built and maintain called "Shader Doodle" before sitting down to chat.
            </p>
        </li>
        <li>
            <strong>Episode 2.3:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=gJ122qmTgqc&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=4">Interview with Merl</a>
            <p>
                Ben chats with special guest Merl. We talk about creative coding on the web,
                motivations and inspiration behind Shader Doodle, how and if being a musician influences creating coding, and more.
            </p>
            <p>
                Links:
            </p>

            <ul>
                <li><a href="https://github.com/halvves/shader-doodle">Shader Doodle</a></li>
                <li><a href="http://regl.party">Regl</a></li>
                <li><a href="http://www.shadertoy.com">ShaderToy</a></li>
                <li><a href="http://jeen-yuhs.com">Jeen-Yuhs</a></li>
                <li><a href="https://gl-react-cookbook.surge.sh">GL React Cookbook</a></li>
                <li><a href="https://thebookofshaders.com">Book of Shaders</a></li>
                <li>Merl's twitter handle: @halvves</li>
            </ul>
        </li>
        <li>
            <strong>Episode 2.4:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=a0XLwdv9BRA&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=5">Lab Step 1 - Setup</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E02-ShaderDoodle/tree/step1">Step 1 Code</a></p>
            <p>
                We start our "Space Doodle" app with a bit of front-end tooling setup. For this project, we'll
                be using Typescript and delve into using some web-dev server plugins.
            </p>

            <p>
                To begin, we start with installing 3 packages
            </p>
            <ul>
                <li>- Lit - we used this in Episode 1 and we'll be using it again to help with Web Component dev</li>
                <li>- @web-dev/server - Also used in Episode 1 and we'll be using it again to serve our dev environment</li>
                <li>- Typescript - Adds types to our JS variables and functions, but also is one way to use decorators in Lit</li>
            </ul>
            <p>
                Next, we'll set up some tasks in our package.json. New to us will be the Typescript compilation task, and
                the task to transpile and watch our TS files. The serve task that launches our page for development has
                been covered in Episode 1 and adds TS transpilation to the mix. TS and serving are done with an ampersand
                (&) so they both execute in parallel. TS files will be watched and when changes happen will be transpiled to JS.
                And these JS files that were transpiled will force the page to be reloaded. We'll also need a simple <code>tsconfig.json</code>
                file to kick us off with some light and relaxed settings for Typescript.
            </p>
            <p>
                Now we're ready to create our app. We'll be creating our index.html file which, like Episode 1 will be styled and
                sized to the full page and doesn't scroll.
            </p>
            <p>
                We'll also add the <code>doodle-app</code> component/tag/element to our page body, and include a script link to our
                "Space Doodle" app entry point found at <code>src/doodle.js</code>
            </p>
            <p>
                In our application entrypoint, doodle.ts (which is Typescript), we'll create a mostly empty class. This class
                will be our <code>doodle-app</code> web component which uses Lit by extending it. Inside this class will be the
                Lit <code>render</code> call which renders nothing yet (by way of an empty html tagged template).
            </p>
            <p>
                To define the Web Component, we'll be using our first "decorator".
            </p>
            <p>
                Next up, we'll demonstrate adding style to our component. Unlike Episode 1, we won't be using CSS in JS,
                or rather we won't LOOK like we are. We'll start by creating a <code>doodle.css</code> file and adding a simple <code>:host</code>
                rule to make our page red.
            </p>
            <p>
                We'll import this CSS in the same way, however it won't quite work yet. We'll need to create a <code>web-dev-server.config.js</code>
                file to start editing our web-dev server config. Here we'll allow the CSS MIME type to be treated as JS, as well
                as using the <code>rollup-plugin-lit-css</code> Rollup plugin to wrap our CSS inside of Lit-ready JS, so we can import
                it into our component.
            </p>
            <p>
                Lastly, to make Typescript happy, we need to create a global rule to give any CSS we import a proper type definition.
            </p>
            <p>
                With all that, we have a full page application with simply a red background.
            </p>
        </li>
        <li>
            <strong>Episode 2.5:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=-Kgq2lk7-kI&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=6">Lab Step 2 - Add the UI</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E02-ShaderDoodle/tree/step2">Step 2 Code</a></p>
            <p>
                It's time to add our UI. We'll be adding (mostly) non-functional UI as a first step of building our
                application. We will NOT be paying attention to organization, so we'll be overloading our one single component
                with all of our markup. For a real application this would be less than ideal - it's better to split things
                up more granularly as smaller and less complicated components, but thats not what we'll be focusing on today,
                so I'm allowing this project to get a bit messy.
            </p>
            <p>
                We start by adding Spectrum Web Components to our package.json. For Episode 2, I'm using dark mode in Spectrum
                just because in Episode 1 we used light mode.
            </p>
            <p>
                The application will be divided into two sections on the left and right. On the left,
                there will be a canvas area where editable text overlays the <code>shader-doodle</code> component.
                Below that there will be some controls for setting the text color and recording a GIF
                of the canvas.
            </p>
            <p>
                On the right, we have some dropdowns to allow us to load different sample shaders, and different textures (if applicable).
                Also, one nuance of <code>shader-doodle</code> is additional configuration to run "ShaderToy" shaders, so there is a switch
                to turn that off and on.
            </p>
            <p>
                Below that is an accordion menu that will contain text editing capabilities for the vertex and fragment shaders
                for the shader set. And lastly, a simple button to reload/refresh the shader after a user has made edits.
            </p>
            <p>
                But of course, none of this is wired up!
            </p>
        </li>
        <li>
            <strong>Episode 2.6:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=sbbAlbGrNbs&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=7">Lab Step 3 - Add Shader Doodle (and code editor)</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E02-ShaderDoodle/tree/step3">Step 3 Code</a></p>
            <p>
                Now it's time to pop in our remaining components. Of COURSE we need Shader Doodle but, we'll need a code
                editor as well. I found something called <code>lit-code</code> which is a PrismJS + Lit based code editor.
            </p>
            <p>
                We'll add those packages to our package.json. Note that for Shader Doodle we're pulling the experimental alpha.
                We should also import PrismJS so it's default languages like JS can have some nice syntax coloring in <code>lit-code</code>.
                It might make more sense to set the language to HLSL (shader language), but it's a bit of a hassle to get
                working, and I've found that it looks virtually identical to JS in practice (at least as far as the color styling goes).
            </p>
            <p>
                Starting slowly by experimenting and adding shaders manually to our Shader Doodle HTML markup, we'll get a bit more
                organized and use the separate <code>shaders.ts</code> file to hold and export a set of sample shaders. We'll do the same with
                the <code>lit-code</code> component. As a middle step, however, we'll store the entire shader script tag in a variable and use
                Lit's <code>unsafeHTML</code> to render it, just to show this particular escape hatch exists when we need it.
            </p>
            <p>
                Lastly, we can add some dark style CSS vars to our 'lit-code' element to match the dark mode we already have for
                the overall web app with Spectrum Web Component.
            </p>
        </li>
        <li>
            <strong>Episode 2.7:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=_iT251jW_O0&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=8">Lab Step 4 - Wire up the UI</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E02-ShaderDoodle/tree/step4">Step 4 Code</a></p>
            <p>
                The code editors and Shader Doodle will be a bit more difficult to hook up, but we can at least get
                the easy stuff out of the way.
            </p>
            <p>
                Starting with the color picker, we'll add a <code>@property</code> decorator. This is a reactive property, and is something
                we explored in Episode #1. This time however, we can use a simple decorator instead of the wordy syntax in a
                pure JS project.
            </p>
            <p>
                By hooking up the input event to the color picker, setting the current <code>color</code> attribute on each to this new <code>textColor</code>
                property, the color slider and area are now affected by user input. To finish up, we can add this CSS property as an
                inline style on the editable text element.
            </p>
            <p>
                We can do similar with the actual editable text content. For our purposes, however, a reactive property isn't needed
                here. The only place this editable text will appear is here on this <code>div</code>. And then in a later step, we'll use this
                text to render a GIF of our shader + text overlay. We just need to update this <code>text</code> property when our field updates.
            </p>
            <p>
                So after creating the property (non-reactive), we'll add an input event on this <code>contenteditable</code> <code>div</code> to simply
                keep the property updated as the user edits it.
            </p>
            <p>
                Also easy, we can wire up our sliders that control how many frames we'd like to record for our GIF and time between snapshots.
                For this, however, we won't use the <code>@property</code> decorator for these properties. Instead, lets use the more appropriate <code>@state</code>
                decorator. This is new in Lit 2 and meant for internal properties that we don't care to expose outside of the component.
                Incidentally, it would have been more correct to use them for the colors and text. These reactive properties will now update
                the label below the sliders to indicate what the timing of the recording will be.
            </p>
            <p>
                To finish up this left side, let's just fire off an alert as a placeholder for the function to record our GIF. So we'll
                create this placeholder function that uses the <code>@click</code> listener on the "Record and Save GIF" button.
            </p>
            <p>
                Lastly, we'll get the pickers/comboboxes working on the right side. These control the "shader" and optional
                texture used for the shader. The menu items for the shader picker will be driven from the list of shaders found in <code>shaders.ts</code>
                while the textures will just be an array of images in our assets folder with the addition of a web cam and the option
                to not have a texture at all.
            </p>
            <p>
                Given that Shader Doodle is a bit abnormal of a component (I'll discuss why in the next step), we won't actually take action
                on loading the shader quite yet.
            </p>
            <p>
                But wait! Even after we've wired this up, the picker menu is having some issues displaying when clicking to open it up.
                We're back to the issue in Episode #1, where we get a <code>process not defined</code> error. Again, this is due to an overlay
                management library trying to query if we're using Node.js or in a browser. We fixed this with a hack before, but now let's
                fix it properly.
            </p>
            <p>
                In our <code>web-dev-server.config.js</code>, we'll remove <code>true</code> from the <code>nodeResolve</code> object. This object is much like the <code>lit-css</code>
                plugin we're using, but <code>nodeResolve</code> is so important and central to how <code>@web/dev-server</code> works, it's a top level
                configuration option. Typically, you'll just want it turned on, so <code>true</code> is what you'd set this to. However, to give
                it more of a configuration, we can set this to an object. We'll do that, and use the <code>exportConditions</code> property to set this
                in production mode. Doing this injects the <code>process</code> object and allows the internal 3rd party library to know
                that what we're doing is inside the browser.
            </p>
        </li>
        <li>
            <strong>Episode 2.8:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=td7Xeagd3FE&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=9">Lab Step 5 - Editing the Shader</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E02-ShaderDoodle/tree/step5">Step 5 Code</a></p>
            <p>
                So here's the thing with Shader Doodle. It's pretty awesome, but doesn't seem designed to keep switching
                shaders on the same component instance. It seems designed to be setup once in code and then run. Our SpaceDoodle
                app probably falls outside the normal usecase!
            </p>
            <p>
                That's OK, we can work with this! Lit is designed to make minimal changes and not tear things down. This
                means that when an attribute or your component's slot changes, that's all that's going to change.
                Your component as a DOM element will not get torn down and re-rendered. Your constructor won't get called again
                and it won't get removed and re-added to the DOM.
            </p>
            <p>
                But in this case, this is actually the behavior we want! At least for this tiny section of our UI. We want to
                remove Shader Doodle from the DOM so that it gets torn down, and then add it back with a new shader such that
                it gets a fresh start. To do this, we'll fall back to the very behavior we use Lit to escape from: appending directly
                to the DOM.
            </p>
            <p>
                So, we're going to manually add Shader Doodle to <code>&lt;div id="shader-doodle-container"&gt;&lt;/div&gt;</code>. To do this, in our <code>shaders.ts</code>
                file we'll be adding a <code>createShaderHTML</code> function which constructs a tag containing the correct vertex and fragment
                script tags, as well as the appropriate texture custom element for the shader. But, we're going admittedly low-tech here.
                We're creating this tag through string concatenation and then with the <code>shaderUpdate</code> method, we set the <code>innerHTML</code>
                of the Shader Doodle container to this string. But just prior tohat we set the <code>innerHTML</code> to an empty string.
                This effectively removes the element from the DOM, and forces it to recreate itself in its entirety with the new
                HTML string.
            </p>
            <p>
                In this same <code>shaderUpdate</code> method, we'll update the code editors as well by using the <code>setCode</code> method of these <code>lit-code</code>
                components. We'll also want the code editor components to update the shader. To do this we'll want to listen for the <code>lit-code</code>
                <code>@update</code> event. We'll create a brand new custom shader object with the new code by cloning the current shader object.
            </p>
            <p>
                Of course to update all of these elements, we need references to them. And for this, we can use the <code>query</code> decorator.
            </p>
            <p>
                Lastly we'll use Lit's <code>firstUpdated</code> method to call this new <code>shaderUpdate</code> method against the first shader
                in the shader list.
            </p>
        </li>
        <li>
            <strong>Episode 2.9:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=X-_k54GmxI0&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=10">Lab Step 6 - Rendering the GIF</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E02-ShaderDoodle/tree/step6">Step 6 Code</a></p>
            <p>
                Let's finally render a GIF from Shader Doodle. There are some technical challenges here, but first, let's
                start with the UI.
            </p>
            <p>
                We're going to add another reactive property called <code>recording</code>. Even though it will be used internally
                in practice and can be decorated as <code>@state</code>, we're going to fall back to <code>@property</code>. The reason is that
                we'd like to hide our recording settings when recording, but also show a progress bar when we do.
            </p>
            <p>
                So, first, we'll import the Spectrum Web Components <code>sp-progress-bar</code> and add it to our component markup.
                A <code>@state</code> decorated reactive property called <code>frameRecording</code> will also be added to our class. This property
                will indicate which frame we are currently recording, and we'll use <code>frameRecording</code> vs <code>framesToRecord</code> to calculate
                progress.
            </p>
            <p>
                Because recording happens for a limited time, and so will this state of our UI, we can set this new <code>recording</code> property
                to true or false manually to show either state. We also set it up to reflect so we can use the attribute in
                our dev tools to flip this property on or off and test the transition of the UI back and forth before we actually wire
                up the record function.
            </p>
            <p>
                The outcome here is that we'll be adding some CSS rules to show or hide elements depending on this <code>recording</code> property value.
            </p>
            <p>
                And now the fun part, getting our GIF recorder to work. This is going to be a bit tricky, but we can show off some
                more <code>@web/dev-server</code> plugins. Which, again, are actually Rollup plugins - so we have a huge library to choose from.
            </p>
            <p>
                As we install and import <code>GIF.js</code>, we quickly see that it won't work as is. First off, it's a Coffeescript based library, which even
                the bundled version doesn't quite work as an import. So we'll reach into it's source folder, skip the Coffeescript and go straight
                to the JS files that originated as a Flash/Actionscript 3 library and was converted to JS over time.
            </p>
            <p>
                Unfortunately even THESE JS files use CommonJS which don't work as an ES Import. So we'll fix this problem by installing
                and using a Rollup CommonJS plugin. This plugin will transform the <code>require</code> calls to be compatible with ES modules and allow us
                to use the library.
            </p>
            <p>
                After this gets added to <code>@web/dev-server</code>, we find that there is an additional problem. Our browser starts erroring out because
                some variables aren't defined before use. This problem is the result of this older library not conforming to strict-mode JS.
                ES module imports actually do enforce strict mode, so there's no way around this problem.....or is there?
            </p>
            <p>
                We can use the Rollup Prepend plugin to insert Javascript code into this one problematic file as its served. We'll simply insert some
                variable declarations at the beginning.
            </p>
            <p>
                And with that, we can import our GIF encoder and set up the function and timer to capture frames, saving them
                as a GIF at the end of the recording period.
            </p>
        </li>
        <li>
            <strong>Episode 2.10:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=XV6mqQjFeH8&list=PLtQN1dImn5UXPjZtpsFJhCtbB2jFiBtiU&index=11">Lab Step 7 - Bundle and Build with Rollup</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E02-ShaderDoodle/tree/step7">Step 7 Code</a></p>
            <p>
                In Episode #1, we never really finished our project to package it up for deployment somewhere. Rollup
                is a great choice for us, especially because we're already using Rollup in <code>@web/dev-server</code> for node module
                resolution and our various plugins.
            </p>
            <p>
                So, in this last step, we'll install Rollup and create a build task in our <code>package.json</code>.
            </p>
            <p>
                We'll start by <code>npm install</code>-ing a few packages. First, Rollup, and then some more plugins like <code>@rollup/plugin-node-resolve</code>
                to do the same module resolving work as our server, <code>@web/rollup-plugin-html</code> to manage our HTML page and linked script, as well as
                <code>rollup-plugin-sourcemaps</code> and <code>rollup-plugin-clean</code> to include sourcemaps and clean our build folder before builds.
            </p>
            <p>
                Once installed, we can create a Rollup config file and set it up in much the same way, using largely the same plugins
                and options as our <code>web-dev-server.config.js</code>.
            </p>
            <p>
                Lastly is adding our build task and running it. We can now run our bundled file with associate HTML file right in
                a browser on any server, ready to be put online!
            </p>
        </li>
    </ul>
