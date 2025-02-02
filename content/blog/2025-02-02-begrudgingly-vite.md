---
title: "Begrudgingly Moving to Vite"
date: "2025-02-02"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2025/02/vite-begrudgingly.jpg"
categories:
- "blog"
- "front-end-tooling"
- "web"
---

Sigh.

Double sigh.

It was over a decade ago when I just wanted to give up on all the Javascript framework churn.
I was decently happy with Angular (first version!), and having just become comfortable there after blowing
through what feels like a dozen others, I wasn't eager to switch to the latest craze (at the time): React.

I never did, and have only used React a few times in favor of Web Components.

As much as I like to say I'm not a React fan, a major factor in me continually snubbing it was the front-end
tooling.

React and Webpack seemed joined at the hip most of React's early days. Even though I stayed clear of React, Webpack
was pretty inevitable for a lot of projects on my various teams.

I've been through my share of tooling over my years...whether it's ANT, Make, Gulp, Closure, Grunt, whatever...it
was all fairly interesting to me. Webpack was just another more modern one, and I was eager to dig in.

Unfortunately, I realllllly started hating it.

### What's wrong with Webpack?
What I hate about Webpack is all the complexity.

Ultimately though, this complexity really can't be blamed squarely on Webpack. It was the state of the JS ecosystem we found ourselves in at the time.
Webpack is an everything bundler. It'll handle your JS, Typescript, CSS, JSX, image assets, workers....really, whatever you
throw at it.

And it really needed to. To be a tool that hopes to provide value in the new JS ecosystem, it needed
to do it all. Whatever your source code is and whatever needed to happen to it to make it to your
browser.

Maybe you want to use Typescript, or Coffeescript, or new JS features that may not be in the browser you're
targeting, your code needs to be transpiled.

ESM imports as a standard weren't a thing yet either, so even just concatenation of a bunch of source files to keep organized and sane was a need.
Let alone all the different ways of importing popping up: CommonJS, ESM, IIFE...

And then your images need to be copied over to where your Javascript got bundled and dumped to (with the right paths of course).

There's more. I'm sure I could go on all day, but the point is: Webpack needed to handle a lot. And it did!
I could be incorrectly remembering, but I feel like at first it did an
amazing job. It just worked well with few, if any, changes to the configuration.

As time went on, however, we demanded more and more of it. It delivered, but it was increasingly harder to
have everything configured correctly for everyone.

The result was that if you needed to do anything that deviated from the norm in your project, you'd spend
hours figuring out why something wasn't working. My projects deviate from the norm...like a lot!
I ended up becoming the go-to person to fix other people's Webpack issues not only because I had patience to solve
it, but also because I'd been through so many other front-end tools, I understood what it was doing under the hood.

### Switching to Web Dev Server
Me knowing how things worked under the hood was a major reason I was excited about [Modern Web's "Web dev server"](https://modern-web.dev/docs/dev-server/overview/).
It didn't do 99% of the things that Webpack did, but that was OK!

[ESM imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) have been available in browsers for quite some time now. [TSC](https://www.typescriptlang.org/) (the Typescript compiler from Microsoft) transpiled to Javascript
fantastically. And this is really all you need from a tool to do development on your local machine.
For production, bundling can be done as a separate concern with a tool like [Rollup](https://rollupjs.org/), which itself is a fairly easy and no-frills bundler (though it comes
with plenty of plugins to cater to any needs you have).

All Web Dev Server needs to do is:
- serve your files
- resolve where your ESM imports are coming from

As a result, during development, there's no bundling! Just run this and your transpiler (TSC probably), set them
both to watch for changes and you're golden!

If you have any hiccups along the way - the Modern Web team made Web Dev Server work with Rollup plugins (within reason)!

For example, if you NPM installed a package that ONLY offers CommonJS (those `require('myimport.js)` statements), you could inject
the CommonJS Rollup plugin into Web Dev Server. It would package as ESM on the fly, hot off the Node.js server, to consume in your
web app.

But, in 2025, this should be rare....right? Right?

### Is Web Dev Server too minimal for the real world?

In 2020, Microsoft Edge was the last one to adopt `import { mything } from 'mymodule.js`, but we're still
flooded with dependencies that use CommonJS, or worse, some weird mishmash of whatever.

Over the past few years, I've seen the Google Polymer/Web Components team really try to push for ESM consumable packages.
And I think to some degree it's helped, just not enough.

We're left with the occasional package that just doesn't work. Or more infuriatingly, ALMOST works, but
some piece is left broken for browser importing.

Case in point Tensorflow.js! I opened an [issue](https://github.com/tensorflow/tfjs/issues/3875) in 2020, and there's been
some movement, but I think we're left with some Node.js code in there from a low-level dependency that breaks
in the browser.

In more robust (and magical) front-end tooling, this can usually be automatically polyfilled, or at least
configured to be polfilled. But with the minimal tooling that Web Dev Server provides, this situation
is very much in your face and requires you to use a Rollup plugin.

At first (and for the last several years), I've been very much in favor of this. It's as if you are a chef,
and you want to be in control of exactly what ingredients you're putting in your cooking. If something is making your process
worse off, you can easily identify it and make it right because you're working with basic ingredients and know every detail
of what goes into your cooking and how.

Alternatively, complex front-tooling means that the chef just dumps ingredients into the skillet and hopes for the
best. Full admission: I am this chef, for actual literal cooking anyway. And like the front-end tooling
environment, it usually works out. But, also like front-end tooling it can make figuring out what went wrong
really hard if you want to improve or tweak your recipes. Additionally, if you are making something complicated,
you're at the whims of figuring out through the abstraction layer of your front-end tooling, which may or may not
have any resemblance to the reality of what's happening under the hood.

I suppose to complete my cooking metaphor for my last statement: Let's compare complex front-end tooling
to dishes made from pre-packaged mixes. If there's an ingredient you don't like or isn't sitting well in your
full meal, then you're probably filtering it out of the mix by hand, or you're reading the instructions on the box
to reason out how to change that mix to your liking.

If you used fresh whole ingredients from the get-go, it might be a bit more work at times to figure out
how to make them work together, but you're learning and aware of how things work and come together all the while
making the next time easier.

This is all good. And it FEELS good when you solve your problems and your project suddenly lights up
in your browser. But like I said, I've been doing this for five years. I've seen weird issue after weird issue
come up. And knowing how to fix a problem can usually mean diving into a dependencies code to figure
out what solution you actually need to use. I feel like it's only easy for me 50% of the time, and the other
times I have to be a detective.

I guess what it comes down to is the fact that I'm tired of dealing with it. I'm currently working on a project
I'm excited about using a library. Unfortunately this library isn't browser importable
(embeddable via a script tag, yes, but not ESM importable).

So here I am just trying to get a  fun part of my project working against my larger app and
I hit this import roadblock. The idea of me spending the next 4 hours debugging how to use these libraries vs ignoring what's
wrong and making it *just work*...well let's just say the fun part won out.

With Vite gaining in popularity and being used by my colleagues at work, I was already using it.
I know it handles these situations very well, and is also not a complex beast like Webpack.

And with that I switched my application to Vite!

But... I immediately started having problems. It turns out you actually do need to learn a few things about
Vite before just going for it.

### Transpiling
The first issue I had was around transpiling my Typescript to Javascript, and really where those files live.
Modern Web's Web Dev server does not handle transpilation. I think that's great! In my mind, it should be
a separate concern.

Up until now, I've been just using the Typescript Compiler (tsc). Its run both for just building, but also during
dev serving. It watches my Typescript files and when changed, I get Javascript files wherever I want them.

For an actual end-user application (not a consumable library), my `.js` and `.js.map` files live side by
side with my Typescript in my file structure.

The above scenario is _probably_ possible in Vite, but it doesn't seem to be the default. Some experimentation leads
me to think that you import a JS file in your code, since it's already there, Vite won't bother transpiling it.
And then your on your own with the Typescript compiler as a separate step.

That's *fiiiiine*, but given that Vite includes ESBuild for handling Typescript, we should probably not overcomplicate things
by making it a separate step outside of Vite.

So, first step to get this project "Vitified" was to delete all my transpiled `.js` and `.js.map` files.

### Import Extensions

One "rule" that's stuck with me for the past few years is to always import the `.js` file instead of the `.ts`, or even
instead of not using extension at all. This is how Web Dev Server works, as it's a server first and only handles
other stuff *if you need it*. Since your browser only supports `.js` files and not `.ts`, that's what you need to do!

Of course with tooling, like Vite and others, it should handle whatever you throw at it and it *should* magically work!

The down-side is that if your code imports `.ts` files or leaves it vague and extensionless, then you're locked into using some sort of
front-end tooling for your code. It'll never work with just a server. Now for an application that needs
to be bundled for production, this is probably fine...unless of course you copy and paste your code somewhere else.

For a consumable package you publish to NPM, however, if you import `.ts` or extensionless files, you're
forcing your consumers to use more complex front-end tooling just as you're doing to handle these imports.

All that said, as a rule, I try to adhere to the standard of using the `.js` extension when I'm importing regardless of
what kind of project I'm on.

And this is where I run into the second part of my Vite import mystery. Despite deleting all of my transpiled
`.js` files, nothing was working. Trying all sorts of `vite.config.json` options, what it came down to is my entry point.

Like many front-end tools geared for making web apps, your application entry point is really your HTML file. Inside, you'd
need to have a `<script>` tag where your src is the javascript entry point of your app.

```html
<html>
<head>
    <meta charset="utf-8" />
    <title>My app</title>
    <script src="/src/index.ts" type="module"></script>
</head>
<body>
<my-app></my-app>
</body>
</html>

```

Here, however, even if the rest of your imports are `.js` files, this one (if you're using Typescript) needs to be a `.ts`
file. If referencing Javascript here and not Typescript, it would appear that nothing in your project
is made to be Vite's responsibility. It *does* make sense. I imagine that behind the scenes Vite takes this
entry point, checks all imports downstream and if Typescript, does the job of transpiling. On the other hand, if your entry point
was `.js`, then nothing downstream is Typescript and Vite assumes it doesn't need handling.


### Vite Cache

I did get a bit of a warning from a work colleague about the Vite cache. When using Vite, there's a
`.vite` folder inside your `node_modules` folder.

![Vite Cache folder](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2025/02/vite-cache.png)

Basically Vite caches what goes through it's internal
bundler and transpiler. My colleague claimed that, while he wasn't sure, there was some weirdness on his
team involving stale dependencies.

His suggestion was to clear the cache every time the dev environment is fired up. So basically add a clean
task to your `package.json` scripts and run that before starting Vite, like this:

```js
  "scripts": {
    "dev": "npm run clean:cache && vite --open",
    "clean:cache": "rimraf node_modules/.vite",
  }
```

I wanted to be a bit more optimistic, so I didn't take this advice at first, but I did start having
some weirdness with two of my packages I was working on when I used `npm link` so that I could
work on them in context of my application without publishing them yet.

I noticed that sometimes things weren't updating in my project when I made changes to my NPM linked local package.

This could easily be a mistake on my part, but I can totally see Vite not noticing and updating
it's cache correctly when an NPM installed package changes without running install again.


### Server behavior

I had one last Vite mystery when I switched my project over. I didn't even know it was Vite for
awhile, my application was just failing on some assets.

I was using Facebook's [Demucs audio separation tool](https://github.com/facebookresearch/demucs).
I'll write about *how* I was using it later - but like any other AI solution that works locally in your
browser, you need to download and load models.

As they tend to be rather large files, it seems standard practice to compress them. When I was using
Web Dev Server previously, I was using `fetch` to grab them and feed these `.gzip` files to my worker code just fine.

When I switched to Vite, suddenly, the Demucs code acted like these models weren't loading correctly or even corrupted.
I took a look at the size of the network request for these `.gzip` model files, and something was off.

They were much bigger (around double the size) of the files on my filesystem.

And there it is...the Vite server was uncompressing the files for me before they hit my app! My code, of course, expected
to do that task itself, so the data just became unusable.

According to this [github issue](https://github.com/vitejs/vite/issues/12266), it's not even something that can
really be fixed. Instead the workaround is just to rename your files to not use that `.gzip` extension so Vite
doesn't know what they are! I named all my files `whatever.gzipped`.


### Is it worth it?

So, once I got my issues worked out and my project up and running under Vite, it was time to ask myself
if it's worth it.

There were a few hiccups and mysteries to solve along the way. I tried leaning on the docs pretty heavily, but
nothing was coming up for my situations when I had these problems.

However, it seems that my real issue was that I just needed to make a couple small concessions when using
front-end tooling like Vite that I didn't have to worry about with minimal or no-tool scenarios such as what Web Dev server
provides.

Once I accepted that there's a tiny bit of a learning curve and Vite does introduce a bit of an abstraction layer with it's own reasonable rules, I
appreciated the fact that I don't have to worry about importing non-standard dependencies anymore while *also*
not working with the over-the-top complexity of other front-end tools.

At the end of the day, it sure *feels* like a complicated tool like Webpack offers similar capabilities
to Vite. Maybe I should try Webpack again after I've been gone all this time. Maybe I'll run into more
mysteries down the road that make Vite feel like Webpack. But for now, Vite is pretty nice and a good compromise
at the very least!

That said, I think I'll still continue using Web Dev Server for the packages I publish to NPM.
I want to make sure these are consumable anywhere and by coding for the browser instead of a front-end tool,
I can mostly be sure I am.










