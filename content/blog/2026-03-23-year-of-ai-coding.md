---
title: "A Year of AI Coding"
date: "2026-03-23"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/12/claude.jpg"
categories:
- "blog"
- "ai"
- "development"
---

It wasn't until fall of 2025 that I seriously used AI coding tools.

### At first, AI seemed kinda useless

Prior to that, I dabbled, but really never had great results. I was really using AI for the
stuff I was terrible at like RegEx or shader code - you know the obscure stuff we only do once in a blue moon.

Shaders were difficult to get right, but a fun thing to try. I'd turn to assorted AI
tools (mostly free) for RegEx and the like, and it mostly helped, but it was also unusual
I'd have the problems that annoyed me so much that I'd turn to AI in the first place.

In March of last year my job granted a subscription to [Cursor](https://cursor.so/) to experiment with.
I'm not one to shy away from experimenting with new tech, but it was a challenge to integrate into my
workflow.

Realistically, I've spent 25+ years of my career learning and getting really
good at stuff. In my early AI coding explorations, I struggled to see where AI was being competitive to
what I was already doing well.

The easy stuff, writing HTML/CSS/Javascript, I could already do pretty fast. So I tried to use it for the more complex stuff, but it
often fell into these circular logic traps where it would keep doing the same bad thing over and over again.

It was pretty clear in how I was using it at the time, that Cursor was being more disruptive to my work than actually helping it.

It wasn't until the fall of 2025 that things really fell into place.


### Needing to do Things I'm Bad At

I'm guessing I started exploring Cursor properly in September of 2025. I had an idea to turn
a drawing tablet into a MIDI controller that emulates playing a guitar. I've just released an
early version of this in the past week called [Sketchatone](https://sketchatone.com).

For this, I needed to explore HID devices and read raw bytes from the drawing tablet. It's something that was completely new to me,
and I'm not entirely sure where I'd look because I wasn't entirely sure what I was looking for. Cursor, for example, helped me with certain strategies around byte reading
that I just wasn't familiar with. Perfectly normal things like big/little endian byte ordering, I hadn't encountered
previously (or at least remembered).

I was exploring this in Node.js at the time. Javascript and Node.js I'm quite comfortable writing. However, for the sake
of the project running on various devices like the Raspberry Pi, having a Python version made more sense.
I've clumsily powered through writing Python before, but it takes me 10x longer than other things because I have
to second guess and look up virtually everything I do.

This project is where I started heavily playing with Cursor - and it was because it was giving me an opportunity
to make something with tools I was terrible with.


### If You're Not Careful, You'll Still Be Bad At Things

I didn't expect to get good at Python by having AI write code for me. I'm happy to be super good at web tech and have
a number of other languages and platforms that I can reasonably stumble through when I need to.

I'm sure I'm marginally better at Python from this experience - but if I truly wanted to be better, I'd have struggled
through it on my own and suffered the failures and rode it through to turn those failures into successes.

This is something that was obvious to me for an entire programming language - but it did sneak up on me in relation to learning
how HID (Human interface devices) work.

I had gotten into a nice groove of directing Cursor to add a feature, and then I would review the code, and do the commit.
Yes I was being careful with code logic here by reviewing what went in to my project, but I was still letting AI do the thinking
for me of integrating these new-to-me concepts around HID devices.

What happened as a result was that, I learned nothing. I had working code but no knowledge of how it worked on a larger level.
I could eyeball functions and for loops and see what they were doing on a smaller scale, but HID concepts like "report ID" or "usage page", I had no idea.
Ultimately, I went back much later using AI to summarize all of these things to actually learn what was going on.

This turned problematic. I was still in the stage with Cursor that for higher level complex reasoning I'd often get into circular failures:

"Hey cursor, can you add a feature to do X?"

"Sure! Here's the code."

"But you didn't account for Y. Can you fix that?"

"Sure! Here's the code."

"But you still didn't account for Y. Can you fix that?"

"Sure! Here's the code."

And repeat....infinitely.

I ended up having some harder problems to work through, and no real understanding of how everything worked, while AI wasn't up to the task.


### It's the Model Not the Tool

What I didn't mention was how I used Cursor. I'm a WEBSTORM4LIFE kind of person. I've been subscribing to this Intellij IDE for over a decade, and
don't want to let it go. As a result I never got into using VSCode, so as a result Cursor was super awkward for me.

My ACTUAL workflow during all of this was to have Cursor open and just ask it to do stuff for me. I'd ignore the rest of its UI completely, while
reviewing code and making small edits in Webstorm, which of course flagged all the files that were different from what was committed to git.

In winter of 2025, I was able to get an Augment subscription that I tried out. The ability to have a panel right in Webstorm was REALLY nice and made
my workflow feel more connected.

Something was still off though. The big selling point of Augment was the ability to have more context for large codebases. I took advantage of this for my Python/HID
side projects as well as a C++ project for work (I'm worse with C++ than Python).

For not very complex tasks it was fine, and possibly a tiny bit better than Cursor depending on what I was doing. But it was hard to say until
I found the other models.

Yes, I stumble through life without reading the documentation - and hadn't actually tried changing models before. Until now, I just used whatever
the default was. But changing to a more advanced model changed the entire game.

Suddenly, I wasn't getting the runaround for complex tasks - things were working remarkably well provided I gave the right context in my prompts.

Augment was my jam until about a month ago.


### Choosing the Right Model

On second thought, I might have been switching models back in Cursor after a while. You can only go so long with seeing "auto" in the model
menu before you click the dropdown.

I remember this because I started using complex models that cost like twice the tokens for using them. I just did this for everything because I
was supposed to be "exploring" anyway and my company was footing the bill.

So, a month ago, the worst thing happened: our corporate subscription to Augment lost one of the more advanced models (I think it was Opus 4.6). By this time, these tools were so ingrained into my workflow,
I was barely actually writing code anymore. Losing this model meant AI was only medium smart now, and I was back to circular arguments again
to get the more complex stuff done.

The day it went away felt like one of those days that the internet is out, and why bother do work?

This was around the time I started using a shared API key for Claude and Claude Code, which eventually turned into a proper license.

After all the churn, I have a good handle on what I should use for what. The normal stuff I'm using Augment for. If I'm feeling like I'm getting
into an exhausting argument with it or it feels like I probably will, I switch to Claude Code and use the better models.

### What I'm Actually Doing

So that's where I am right now tool wise. As I mentioned before, I was working in Python and C++ as a way to suss out how well AI coding tools
could work without me actually coding. This gave me confidence and a good feel on how to be hands off and not code anything myself anymore.

Eventually this led to me doing all the stuff I'm actually good at with AI too, and it's really made things go pretty quickly. I'm having Augment
or Claude do a feature for me, and if I have an opinion up front on how to tackle it, I'll give it. That said, I usually just let it do its thing
and then review code afterwards.

It's led me to be a lot more opinionated than I'm used to. Typically, as a prototyper, I may or may not work with another person on a project.
But, if I do, I respect their opinions and don't nag about little things. After all, they know what they are doing and it's just a prototype at
the end of the day with a limited shelf life.

With AI tools on the other hand, I'm an absolutely annoying micromanager. I don't actually write the code, but I will complain about every little
thing it does differently than I would have.

So in that, my role kind of feels like an engineering manager now. With AI coding tools doing the coding, there are some other roles I can resurrect
with AI help as well.

As a prototyper, it's not often that I had time for the little things before that made a difference. One of those things is documentation.
Documentation is one of those things nobody has time for until you need it, but by then it's a massive undertaking to add it all.
It's also one of those things that is standard practice for AI to use as guidelines.

Last fall my co-worker introduced me to good markdown AI docs. And by "introduced", I mean had such good results when I was ignorant to it all, that
I had to pay attention.

But all of these markdown files are really meant to be read by AI. Human readable documentation is such a good thing. I've since leaned heavily into
11ty static site generators for a few big projects. Not only can AI read the markdown files used here in the source of the static site, but
it can easily be built as a static site ready for human reading once you publish it. So documentation can really go far if you let it. I originally
started one of my projects with an 11ty docs site just because I thought it could be cool, but it turned into one of those things that I've passed to
a few teams to share my work, went back to understand something I did but forgot how, and even summarized into a context window so an LLM could build what I was building in some experimental calls!

So in terms of engineering practices, documentation is huge. But there's another big one that I'm seeing even bigger value in: automated testing.


### Testing is BACK

Should we have been doing automated testing before AI? Yes. Did I do it? No. Do I believe you did it even though it's so important? Probably not.
Testing is one of those things that engineers are supposed to do, but I struggle to believe most of us practiced what we preached. As a prototyper, it just never made much sense. We slap together code, re-architect constantly,
and more often than not, throw the project away after a short time.

So, I was always cool with going without tests. It's too much overhead for not enough payoff. But that was before AI coding tools could do it for free.

I started in again on unit testing an animation system I was creating. Despite being coded by hand, it kept getting bigger and more complex.
I had hundreds of tests created, and I didn't write any of them. It paid off big time. This was part of a larger project and was getting too big
to properly test as a human. I could add features and have a huge safety net that (albeit with some unpredictable holes) without the overhead of
writing the tests myself.

Since then, I've been leaning into tests everywhere. Not so much for UI, because UI is constantly changing for me, but for the underlying systems
underneath the UI. If it's complicated and especially if I keep getting burned by regressions when I manually test it - I just ask for automated tests.

One of the more interesting use cases was for a WebGPU rendering engine I was working with. I used automated testing to verify things visually looked
how I needed them to look. It ended up being basically like a 15 minute thing I'd need to watch, but when I was changing the guts of this rendering engine, I'll take
the 15 minutes to watch this thing rather than remembering and manually testing everything.

The rendering engine case was a bit harder to setup. But for normal headless testing, it seems super easy to get Playwright tests going.
I've been more hands off than I probably should be with direction for writing these tests. I've adopted a "pray and spray" approach.

"Pray and spray" is coined from first person shooter gaming I think. Basically you just load your machine gun and fire away whether you see your target or not.
But if you're familiar with your movie tropes, using AI for testing in this way is kinda like giving a Starwars Stormtrooper a gun.

Or going after Predator...so much shooting, and they barely graze it.

<iframe width="560" height="315" src="https://www.youtube.com/embed/dK1B9b_0Z2Y?si=6JpxKRNrmgiMuQqI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Yup, if you don't put in the effort, AI made automated tests can miss pretty badly. I've seen some tests made by AI that just pass without
testing anything at all with some complicated code to compensate for it in the assertions.

At that point, the pray and spray approach starts feeling absurd like....

<iframe width="560" height="315" src="https://www.youtube.com/embed/CSoBlRxg5-k?si=FKm2kOJahKdkmNfu" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

However, this is why it's "pray and spray". I'll have AI make TONS of tests. If I hit a regression that it missed, I'll go back and add more.
I'll ask why the tests didn't catch something. Overall it seems like a net positive for my minimal effort.


### Feelings

I went into AI coding not really excited because it couldn't do much. Now it's a little nerve-wracking because it CAN do too much.
At the end of the day, the real bottleneck for my work is going to be human testing. My prototypes are getting more and more complicated
with more and more features. Automated testing is only going to save me so much. Features can now be coded fast and not by me.

With AI tooling, I'm more invested in testing what was made after the feature is supposedly done. And that's great.
But before when I was coding by hand, I'd test more at every stage of implementing a feature. So the deeper edge case stuff was more battle-ready
but the end implementation that held everything together was only marginally tested because I was so bored and ready to move onto the next thing.

I think one way to think about this is that you're forced to look at the bigger picture now rather than sweating (or even being aware of) the small details.
This can be good and bad. Like I said before, you're not trying/failing/fixing and really cementing those low level details in your head. As a result,
you're less likely to innovate solutions to problems with your fuzzy mental model of everything.

Someone mentioned to me that they don't see themselves using AI coding tools because they actually enjoy coding. I thought the same too,
but what I think I enjoy more is this bigger picture. The larger systems that can come together for a bigger application. It wasn't
often I'd get to enjoy this aspect before because those moments were too few and far between because I was slogging through the underlying
code before (as much as I do enjoy that too).

And I think in this way, what we lose with coding by hand, we train ourselves to see the birds eye view more and more.


### Future

LOL, I'm still not going to read the manual. There's no point. I can't imagine what we're doing today will be anything like what we're doing in 1 year or 2 years.
I'm going to play with whatever tools I can get my hands on. Honestly, though, the idea we've injected a paid token model as a bottle-neck for work that
we've always done with free/open source tools would be a bit dystopian.

It WOULD be dystopian if it weren't for the fact that we already have LLM models that run locally without the internet and it's only going to
get better. We just have to be a bit careful that we're not inviting these AI companies to become locked into our workflows. Keep exploring, and keep shaking things up
until these tools are our own.


