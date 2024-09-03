---
title: "Web Components in Space Episode 1"
date: "2022-05-01"
categories:
  - "blog"
  - "web"
  - "web-components-in-space"
  - "web-components"
---

This is a cross-post of the first episode of my spacelab based Web Components learning video series called "Web Components in Space"!

    <ul class="episode-list">
        <li>
            <strong>Episode 1:</strong> <a target="_blank" href="https://www.youtube.com/playlist?list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG">Watch all of Episode 1</a>
            <p>
                Play this playlist for the intro, the run-down on what we'll learn and do in Episode 1, the show and tell,
                the interview, and the seven part lab.
            </p>
        </li>
        <li>
            <strong>Episode 1.1:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=q9nyYYS9jhA&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=3">Run-down</a>
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
            </ul>
        </li>
        <li>
            <strong>Episode 1.2:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=noFcd6I7yKg&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=4">Show &amp; Tell</a>
            <p>
                Ben shows off our special guest's halftone rendering experiments before sitting down to chat.
            </p>
        </li>
        <li>
            <strong>Episode 1.3:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=V-AxY5izeIU&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=5&t=3s">Interview with Dmitry Baranovskiy</a>
            <p>
                Ben chats with special guest Dmitry Baranovskiy. Dmitry talks a bit about his life and early career
                immigrating to Australia. But mostly we nerd out on math and making generative art/visualizations that led
                to halftones.
            </p>
            <p>
                So. Much. Nerding out. And then we throw in a little chess visualization just in case it wasn't nerdy enough
            </p>
            <p>
                Links:
            </p>
            <ul>
                <li><a href="https://observablehq.com/@dmitrybaranovskiy">Dmitry @ Observable</a></li>
                <li><a href="https://observablehq.com/@dmitrybaranovskiy/chess-statistics">Dmitry's Chess Visualizations</a></li>
                <li><a href="https://observablehq.com/@dmitrybaranovskiy/halftone/3">Dmitry's Halftone Experimentation</a></li>
                <li>Dmitry's twitter handle: @DmitryBaranovsk</li>
            </ul>
        </li>
        <li>
            <strong>Episode 1.4:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=g0SN824BZeY&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=6&t=6s">Lab Step 1 - Setup</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E01-Halftones/tree/step1">Step 1 Code</a></p>
            <p>
                Since this is the first episode and the first time we're setting up a lit application,
                lets focus on the first steps of laying out our application.
            </p>

            <p>
                In this first step, we cover
            </p>

            <ul>
                <li>- Creating our gitignore and putting our assets into place</li>
                <li>- Creating a package.json and installing our dependencies</li>
                <li>- Creating our application source folder with a single component folder</li>
                <li>- Creating our index.html and pointing to our app component source</li>
                <li>- Creating our first component file (app.js) with an index.js entry point</li>
                <li>- Filling in our component with Lit functionality and render some HTML</li>
                <li>- Importing Spectrum Web Components and add a theme container</li>
                <li>- Building out our layout using HTML and CSS</li>
                <li>- Getting the halftone component working</li>
                <li>- Adding a background slot</li>
            </ul>
        </li>
        <li>
            <strong>Episode 1.5:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=NyfF25u7Hq0&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=7">Lab Step 2 - Organizing and creating our first child component</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E01-Halftones/tree/step2">Step 2 Code</a></p>
            <p>
                In this second step, we're going to do some custom organization of our main app component,
                but also build out our first child component that allows us to select an image to use for our halftone
            </p>
            <p>
                Step 2 covers:
            </p>
            <ul>
                <li>- Separating out our HTML/CSS into different files</li>
                <li>- Creating the "floatingheader" component</li>
                <li>- Mapping an array of image URLs to thumbnails</li>
                <li>- Adding our first Spectrum Web Component with icon</li>
            </ul>
        </li>
        <li>
            <strong>Episode 1.6:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=j0nDMjnLmiM&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=8">Lab Step 3 - Completing the UI</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E01-Halftones/tree/step3">Step 3 Code</a></p>
            <p>
                In step 3, we're continuing our Spectrum Web Components journey. First we'll
                fill in the "floatingfooter" component with some download buttons.
                Next, we'll go crazy with the side panel and employ several different
                Spectrum Web Components
            </p>
            <p>
                Step 3 covers:
            </p>

            <ul>
                <li>- Creating our 2 remaining application components</li>
                <li>- Using Spectrum Web Component's "action button", "field-label", "picker", "color-area" and "color-slider" components</li>
                <li>- Finishing our application's UI layout and design</li>
            </ul>
        </li>
        <li>
            <strong>Episode 1.7:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=by_1JxbUOao&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=9">Lab Step 4 - Creating a naive data model</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E01-Halftones/tree/step4">Step 4 Code</a></p>
            <p>
                In step 4, we're going to stop hard-coding all of our attributes/properties and let
                them flow through to our child components using Lit's "Reactive Properties".
                The end result is that we can control all of our settings from the main component.
            </p>
            <p>
                In step 4 we:
            </p>
            <ul>
                <li>- Create an object in our main component with all of our application properties</li>
                <li>- Replace hard-coded attributes with Reactive Properties</li>
                <li>- Populate our child components with Reactive Properties and use them in their HTML instead of hard-coded values</li>
                <li>- Make Side panel UI reflect data model</li>
                <li>- Give selected image a border based on current selection</li>
            </ul>
        </li>
        <li>
            <strong>Episode 1.8:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=wXh6OLXAG4I&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=10">Lab Step 5 - Listening and responding to change events</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E01-Halftones/tree/step5">Step 5 Code</a></p>
            <p>
                In step 5 we get our application working by finally applying values changed from our
                various UI pieces to our data model, which updates every piece of our application.
            </p>
            <p>
                Step 5 covers:
            </p>
            <ul>
                <li>- Using Lit-HTML syntax to add event listeners right on our tags</li>
                <li>- Decide how to listen to these changes (is it @change or JS coded event listeners?)</li>
            </ul>
        </li>
        <li>
            <strong>Episode 1.9:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=0Xj_u3WqXTY&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=11">Lab Step 6 - Finishing Steps</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E01-Halftones/tree/step6">Step 6 Code</a></p>
            <p>
                Step 6 finishes up the application. We add a few final touches to make our application really
                sing.
            </p>
            <p>
                Step 6 adds:
            </p>
            <ul>
                <li>- Resizing of the halftone-component</li>
                <li>- SVG/JPG/PNG saving</li>
                <li>- Local image uploading</li>
                <li>- Wire up color tab to allow switching between background color and halftone color</li>
                <li>- An SVG logo to the app that we created with the tool</li>
            </ul>
        </li>
        <li>
            <strong>Episode 1.10:</strong> <a target="_blank" href="https://www.youtube.com/watch?v=T6PLxZCAFbI&list=PLtQN1dImn5UWmvs6fjveoo-ow0wXjvSkG&index=12">Lab Step 7 - Extra fun</a>
            <p>
                This last step doesn't have a Git branch associated with it. We're just having a bit of extra
                fun as we play with our webcam, create an SVG logo for our application using what we've built,
                and then just recap what we've learned a bit.
            </p>
        </li>
    </ul>
