---
title: "Web Components in Space Episode 4"
date: "2023-01-25"
categories:
  - "blog"
  - "web"
  - "web-components-in-space"
  - "web-components"
---

This is a cross-post of the fourth episode of my spacelab based Web Components learning video series called "Web Components in Space"!

    <ul class="episode-list">
        <li>
            <strong>Episode 4:</strong> <a target="_blank" href="https://www.youtube.com/playlist?list=PLtQN1dImn5UWuvaGYFdxMDrD2vDn9quEJ">Watch all of Episode 4</a>
            <p>
                Play this playlist for the intro, the run-down on what we'll learn and do in Episode 4, the show and tell,
                the interview, and the five part lab.
                <ul>
                <li><a href="https://github.com/Web-Components-in-Space/S01E04-AudioDemos" target="_blank">Audio Demos</a></li>
                <li><a href="https://github.com/Web-Components-in-Space/S01E04-BeSharp" target="_blank">Music Practice App</a></li>
                </ul>
            </p>
        </li>
        <li>
            <strong>Episode 4.1:</strong> <a target="_blank" href="https://youtu.be/92jLAcYtcOU">Episode 4 Run-down</a>
            <p>
                Ben gives a quick run-down on what we'll learn and build today, the technologies we'll use, who we'll
                be talking to, and what they built.
            </p>
            <p>
                Tools and technology we'll use today:
            </p>
            <ul>
                <li><a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API">Web MIDI</a></li>
                <li><a target="_blank" href="https://tonejs.github.io">Tone.js</a></li>
                <li><a target="_blank" href="https://alexanderell.is/posts/tuner">Pitch Detection</a></li>
                <li><a target="_blank" href="https://www.npmjs.com/package/piano-keys-webcomponent-v0">Piano Keys Web Component</a></li>
                <li><a target="_blank" href="https://lit.dev/" target="_blank">Lit</a></li>
                <li><a target="_blank" href="https://modern-web.dev/docs/dev-server/overview/" target="_blank">Web Dev Server</a></li>
            </ul>
        </li>
        <li>
            <strong>Episode 4.2:</strong> <a target="_blank" href="https://youtu.be/5jpJ0h54Sb0">Show &amp; Tell</a>
            <p>
                Ben shows off his already built music practice app called "BeSharp", available at <a target="_blank" href="https://besharp.app">besharp.app</a>. More importantly, though,
                he shows the audio technology that goes into it. Ben shows demos with Web MIDI, Tone.js, Pitch Detection with the Web Audio API, and a pretty great
                piano keys component. On the Lit side, he then teases how all of these technologies can come into a project using Lit's new Reactive Controllers
            </p>
        </li>
        <li>
            <strong>Episode 4.3:</strong> <a target="_blank" href="https://youtu.be/7n3PHEx_xvg">Interview with Cassondra Roberts</a>
            <p>
                Ben chats with Cassondra Roberts who is an all around amazing developer working at Adobe. However, you might have seen her around in the <a target="_blank" href="https://www.w3.org/community/webcomponents/">Web Component spec community</a>, on the CSS working group, as well
                as helping maintain some prominent Web Component libraries. Cassondra came on to talk about her book in progress on Web Component CSS and styling. She also gives Ben some pointers for styling
                the music app we're diving into today.
            </p>
        </li>
        <li>
            <strong>Episode 4.4:</strong> <a target="_blank" href="https://youtu.be/_OMaIIdz9Gg">Lab Step 1 - Web MIDI</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E04-AudioDemos">Demo Code</a></p>
            <p>
                In this video we explore Web MIDI. We'll build a quick MIDI keyboard connected demo and watch out for what note gets hit, whether its a press or release, and even how hard (or the velocity) of the press.
            </p>
        </li>
        <li>
            <strong>Episode 4.5:</strong> <a target="_blank" href="https://youtu.be/jkfTvACeCuU">Lab Step 2 - Pitch Detection</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E04-AudioDemos">Demo Code</a></p>

            <p>
                Now, we explore pitch detection using your normal browser connected microphone using the Web Audio API. We're heavily borrowing/stealing from Alex Ellis (https://alexanderell.is) here
                as his blog post <a target="_blank" href="https://alexanderell.is/posts/tuner/">"Detecting pitch with the Web Audio API and autocorrelation"</a> does a fantastic job of accomplishing this
            </p>
        </li>
        <li>
            <strong>Episode 4.6:</strong> <a target="_blank" href="https://youtu.be/eRZ_Sp4PRPU">Lab Step 3 - Playing sounds with Tone.js</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E04-AudioDemos">Demo Code</a></p>
            <p>
                Next we try out <a target="_blank" href="https://tonejs.github.io/">Tone.js</a> to make some noise. And how better to make some noise (if you don't have a MIDI keyboard) than
                a nice little <a target="_blank" href="https://www.npmjs.com/package/piano-keys-webcomponent-v0">Piano Key Web Component</a>?
            </p>
        </li>
        <li>
            <strong>Episode 4.7:</strong> <a target="_blank" href="https://youtu.be/sPL5as_ckqc">Lab Step 4 - Lit Reactive Controllers</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E04-AudioDemos">Demo Code</a><p>
            <p>
                Now we get to take all of our audio demos and code, and make them into Lit Reactive Controllers to make them super easy to use from a Web Component app without
                lots of messy code intruding on your HTML markup!
            </p>
        </li>
        <li>
            <strong>Episode 4.8:</strong> <a target="_blank" href="https://youtu.be/EH5PjMHIEfY">Lab Step 5 - Styling Web Components and a Mini Design System</a>
            <p><a target="_blank" href="https://github.com/Web-Components-in-Space/S01E04-BeSharp/tree/pre-integration">BeSharp Music App</a></p>
            <p>
                We're going to fast forward to having our demo work all functioning in an un-styled app. We'll explore some Web Component styling, especially exploring some of the advice
                of our guest Cassondra Roberts. We'll also talk a bit about using a mini design system to style the app.
            </p>
        </li>
    </ul>
