---
title: "Web Components in Space Episode 3"
date: "2022-08-30"
categories:
  - "blog"
  - "web"
  - "web-components-in-space"
  - "web-components"
---

This is a cross-post of the third episode of my spacelab based Web Components learning video series called "Web Components in Space"!

    <ul class="episode-list">
        <li>
            <strong>Episode 3:</strong> <a target="_blank" href="https://www.youtube.com/playlist?list=PLtQN1dImn5UXDJkjgeCkTovJG054y_SWZ">Watch all of Episode 3</a>
            <p>
                Play this playlist for the intro, the run-down on what we'll learn and do in Episode 3, the show and tell,
                the interview, and the eight part lab.
                <ul>
                <li><a href="https://www.npmjs.com/package/pose-capture" target="_blank">Pose Capture on NPM</a></li>
                <li><a href="https://github.com/Web-Components-in-Space/S01E03-PoseTracking" target="_blank">Demo App</a></li>
                </ul>
            </p>
        </li>
        <li>
            <strong>Episode 3.1:</strong> <a target="_blank" href="https://youtu.be/5p4wjxV3vO8">Episode 3 Run-down</a>
            <p>
                Ben gives a quick run-down on what we'll learn and build today, the technologies we'll use, who we'll
                be talking to and what they built.
            </p>
            <p>
                Tools and technology we'll use today:
            </p>
            <ul>
                <li><a href="https://www.tensorflow.org/js" target="_blank">TensorFlow.js</a></li>
                <li><a href="https://lit.dev/" target="_blank">Lit</a></li>
                <li><a href="https://modern-web.dev/docs/dev-server/overview/" target="_blank">Web Dev Server</a></li>
            </ul>
        </li>
        <li>
            <strong>Episode 3.2:</strong> <a target="_blank" href="https://youtu.be/r7gVUjN6ym0">Show &amp; Tell</a>
            <p>
                Ben shows off some Tensorflow.js pose capture demos including bodypose, facemesh, and handpose before sitting down to chat with Google's Developer Evangelist. And then, of course, he gets caught up in animating
                himself as an SVG boy with https://github.com/yemount/pose-animator.
            </p>
        </li>
        <li>
            <strong>Episode 3.3:</strong> <a target="_blank" href="https://youtu.be/AHXLNhDrAhM">Interview with Jason Mayes</a>
            <p>
                Ben chats with Tensorflow.js's lead developer advocate to find out what TFJS can do from an easy but incredibly useful hello world application, all the way to the cutting edge of what ML can do today.
                Jason Mayes talks all about his early days on the WebML creating superpowers on the web as well as his lifelong goals of taking to the skies in every way possible.
            </p>
            <p>
                Links:
            </p>

            <ul>
                <li><a href="https://www.tensorflow.org/js" target="_blank">TensorFlow.js</a></li>
                <li><a href="https://huggingface.co" target="_blank">Hugging Face</a></li>
                <li><a href="https://teachablemachine.withgoogle.com" target="_blank">Teachable Machine</a></li>
                <li><a href="https://magenta.tensorflow.org" target="_blank">Magenta</a></li>
                <li><a href="https://mubert.com" target="_blank">Mubert</a></li>
                <li><a href="https://goo.gle/learn-tfjs" target="_blank">Jason's EdX Course</a></li>
            </ul>
        </li>
        <li>
            <strong>Episode 3.4:</strong> <a target="_blank" href="https://youtu.be/ROips386H-M">Lab Step 1 - Project Templates</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/pose-capture/tree/step1">Step 1 Code</a></p>
            <p>
                This time we're using a template/starter project and not starting from an empty project. We try out both OpenWC's generator (https://open-wc.org/docs/development/generator/) and Lit's
                Typescript project template (https://github.com/lit/lit-element-starter-ts).
            </p>
            <p>
                Each starter kit comes with a way to create docs, and so we go through a quick review of how either Storybook or 11ty docs are generated.
            </p>
        </li>
        <li>
            <strong>Episode 3.5:</strong> <a target="_blank" href="https://youtu.be/yZSFfIeaAKM">Lab Step 2 - Making a video player</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/pose-capture/tree/step2">Step 2 Code</a></p>
            <p>
                It's time to start building out our first component to simply play video, and we do this by building off of and changing what the Lit template provides.
                We also discuss building this component with Web Standard APIs only - specifically, not using Lit here because it doesn't make sense in the context of not
                that much DOM or UI controls. But with that comes a little extra work that Lit would typically smooth over for us.
            </p>
            <p>
                After taking the first stab at a video player, we tweak the Lit provided dev demo page to show our component off during development!
                Next, we organize some of our transpiled source. It gets sent to the root of the project and isn't intended to be published, so we edit our
                .gitignore file a bit to reflect that.
            </p>
        </li>
        <li>
            <strong>Episode 3.6:</strong> <a target="_blank" href="https://youtu.be/JoRljmIq7mg">Lab Step 3 - Adding the player controls</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/pose-capture/tree/step3">Step 3 Code</a></p>
            <p>
                In this step we create some playback controls. This is the one piece that we DO use Google's Lit for. It's helpful in terms of several
                stateful UI controls we have here. But, it's the only place we do use Lit, and these playback controls are actually optional for the larger
                video player component. These controls are enabled by the developer putting them into the video component tag as a child (or not). This is enabled
                by using "slots" in our video component.
            </p>
            <p>
                As we wire up events on these UI controls, the concept of subclassed events are introduced. These are much better than the old way of creating
                custom events, in that the subclassed Event can contain custom logic and functionality right inside of the event, rather than logic spread all over
                the place as we did before.
            </p>
        </li>
        <li>
            <strong>Episode 3.7:</strong> <a target="_blank" href="https://youtu.be/VUvnCC4efMk">Lab Step 4 - Fixing timeline scrubbing</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/pose-capture/tree/step4">Step 4 Code</a></p>
            <p>
                It turns out that our video player can't scrub properly because of the lack of partial range requests on web-dev-server. This is fairly unique to our dev
                environment. And it turns out that we can install some middleware to handle this. We can grab this from a number of Koa.js packages listed on Koa's github page,
                and this is because web-dev-server is actually based on Koa.js
            </p>
        </li>
        <li>
            <strong>Episode 3.8:</strong> <a target="_blank" href="https://youtu.be/HfomwLL_9sI">Lab Step 5 - Working with TFJS as an ES Module</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/pose-capture/tree/step5">Step 5 Code</a></p>
            <p>
                Here's the part that broke the Web Compon-o-tron! Tensorflow.js has some difficulties being imported as an ES Module, so we're going to try a Rollup bundling step of just those TFJS libraries
                to get it working in our project, and we'll have these bundled imports as source files that we can import easily.
            </p>
        </li>
        <li>
            <strong>Episode 3.9:</strong> <a target="_blank" href="https://youtu.be/oRG5NmNsKuI">Lab Step 6 - Realtime Pose detection</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/pose-capture/tree/step6">Step 6 Code</a></p>
            <p>
                In this step we extend our object oriented hierarchy further. We build on top of video-element to create a videopose-element, and extend THAT out to create our specific pose solutions for hands, face, and body.
                We get all of these Tensorflow models working with a live HTML5 video element as the source. This means realtime pose detection! We also normalize the points that are coming from these TFJS models
                such that they all follow a similar format. This will be important in the final steps!
            </p>
        </li>
        <li>
            <strong>Episode 3.10:</strong> <a target="_blank" href="https://youtu.be/W1ZMXCTcceQ">Lab Step 7 - Visualization and Pose Playback</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/pose-capture/tree/step7">Step 7 Code</a></p>
            <p>
                In this (almost) final step, we begin with all of our TFJS pose models working, but they only appear in the console. So now, we build out a visualization canvas to overlay over
                our video. This is another optional layer we can choose (or choose not) to add as a child element which occupies the slot of our component.
            </p>
            <p>
                We also try out the record function of our component and can download a full recording, with audio if preferred, of the pose we capture. Like where we started this step, just
                seeing data in the console, this download is just points. So we finish up by build another video-like player, but this player plays back just the captured points with an audio track
                if captured.
            </p>
             <p>
                With everything fully working, we could almost end here, but there are some final steps to make this ready to publish on NPM and consume in an application.
             </p>
        </li>
        <li>
            <strong>Episode 3.11:</strong> <a target="_blank" href="https://youtu.be/SKwqo9Zb6gc">Lab Step 8 - Prepping for Publishing</a>
            <p>
                This final step is basically just the main branch of this project, so, no github link for this specific step. There were only a couple of things to wrap up this set of
                TFJS pose detection components. First, we needed to make sure our Rollup bundled Tensorflow modules can be consumed from both the "src" folder for dev, and from the root of the project
                when using the component.
            </p>
            <p>
                And then finally to close things out, we dive into creating documentation with the 11ty static site generator (https://www.11ty.dev), and I show off a simple demo app that
                consumes our new set of motion capture components.
            </p>

                <ul>
                <li><a href="https://www.npmjs.com/package/pose-capture" target="_blank">Pose Capture on NPM</a></li>
                <li><a href="https://github.com/Web-Components-in-Space/S01E03-PoseTracking" target="_blank">Demo App</a></li>
                </ul>

        </li>
    </ul>
