---
title: "Playing a Note Sequence with Tone.js"
date: "2024-12-01"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/12/synth.jpg"
categories:
- "blog"
- "audio"
- "midi"
- "web"
---

I've had a long-standing hobby that I haven't really leaned into since the mid 2000's. But all the same, it's inspired
some of my prototypes and experiments. And that's playing music. I played classical piano in grade school, then
played in a few rock bands in high school and then after college.

Just these past couple years, I really got back into playing keys again, but also taking some vocal lessons. I think I'm decent
enough that I need to start actually playing some songs. As I figure out what I want to play and what my sound is, I don't actually have a band...
so how do I get a full sound? Since I'm huge nerd that writes software, now's the time to bring in some tech!

I won't get into what I'm trying just yet (and I'll note that the featured image is a new MIDI synth I'm trying) - but I AM finding that I need to work with MIDI a bit in kind of a niche way. So I'm building a small web app
to work with short, one-track sequences of notes.

I spent lots of time building out the interactive timeline, which I'll talk about at a later date, but as I started wiring things up,
playback turned out unexpectedly hard!

## Tone.js
Tone.js is such a great project, and seemingly everyone's goto library for music experimentation since...well, since the Web Audio API first popped up
around a decade ago!

I too have used it on more projects than I can remember, and it works well every time!

So. What's the problem?

## Playing a Sequence of Notes
Every time I've used Tone.js in the past, I'm playing notes live. They always get triggered in realtime by some aspect of an interactive
experience I'm making.

This time, however, I'm importing MIDI and trying to play an entire sequence back. So, that should be easy! Let's just look over the
Tone.js documentation and see what we should use.

## Parts, Sequences, Patterns, Loops
So, even though the [API docs](https://tonejs.github.io/docs/15.0.4/index.html) are all there for Tone, suggested usage of these concepts for playing back a series of notes just don't seem to be found anywhere
in the docs. Most of the how-to's seem geared towards simple playback of notes triggered in realtime, which is how I usually use Tone. And the rest
is really just normal auto-generated API docs.

Not to docu-shame Tone.js, of course! It's a long-running project, and I'm come across messages from the maintainer saying they are
only one person with another full-time job, and they try their best! I'm sure over this project, there's been all sorts of features implemented for
specific use cases and I can certainly empathize with getting to write-ups for these "tomorrow" :)

Or you know - maybe I'm just not looking in the right place.

But I did do a little trial, error, and experimentation to learn that I should probably just pretend I'm playing in realtime and manage my own sequence, which is NOT what I expected.

## Patterns
For the use case of playing back a sequence of notes, it looks like I can count the `Pattern` object out right away. It seems good at what it does,
which is to play a pattern of notes in a loop, but the API really looks like it's not meant for being more than a something like a simple
arpeggiator where you can't really alter the time or velocity or sustain....or really anything between notes!

Does that mean it's bad? No, of course not! Arpeggiators are super cool, but they just aren't the right construct to play MIDI notes
with all that nuance and subtlety.

However, when the Tone.js `Pattern` becomes part of your musical repertoire, you can do some cool things! For example, [guitarland.com](https://www.guitarland.com/MusicTheoryWithToneJS/PlayRhythms.html) has
a great example of using a Pattern to play dual arpeggiators that, by using global delays, can be used to craft some interesting melodies that
play off of each other.

## Sequences
Sequences are another neat concept which ALSO doesn't quite cover my use case!
The [Tone docs](https://tonejs.github.io/docs/14.7.28/Sequence) says that a `Sequence` is a series or array of events that happen at a regular interval, but with
the extra ability to have an inner array that subdivides the interval by the number of items in the inner array.
This seems perfect for arranging a melody with code and experimenting with timing without worrying about actual numbers, but with MIDI playback
I want to allow explicit timing, allowing slightly off-beat notes and the like - and this `Sequence` pattern would make that hard, if not impossible
to pull off!

## Loops
I completely overlooked the `Loop` object until I did this post. Really, it seems to be something similar to `setInterval` where you run that `Loop` at a
interval you specify and do stuff in the callback. What's nifty here, is that you're using Tone.js so you can tell it to run at a timing relative to your beats per minute.
The following example from the Tone.js docs triggers every 8th note.

```js
var loop = new Tone.Loop(function(time){
	//triggered every eighth note.
	console.log(time);
}, "8n").start(0);
Tone.Transport.start();
```

Given that this uses Tone.js and the browser's `AudioContext` to manage timing, it should be super accurate and reliable, unlike `setInterval` for example.
However, that's all this really does! So any note sequences I'll need to manage myself. And to be fair, I do end up managing it all myself,
but I was REALLY looking for something in Tone.js to play a sequence!

## Parts
After all my experimenting, I landed on the `Part` object...until I found out that it didn't work so amazingly for my edge cases.
Was I right? Let me tell you what I found.

I used [midi-json-parser](https://github.com/chrisguttandin/midi-json-parser) to convert MIDI into JSON. There's not too much to say about that project, except
it worked great! Ultimately, my MIDI events looked like this once I parsed and processed them:

```ts
export interface NoteEvent {
    note: number;
    velocity: number;
    duration: number;
    time: number;
}
```

And then to play them back, I created a `Part` object like this:

```ts
	PlaybackToneSeq.synth = new Tone.PolySynth(Tone.Synth).toDestination();
	PlaybackToneSeq.part = new Tone.Part((time, value) => {
		PlaybackToneSeq.synth?.triggerAttackRelease(
			value.note,
			value.duration, time,
			value.velocity / 127);
	}, events);
```

So the above code is pretty easy to read, right? We're creating a `PolySynth` (or a synth that can play multiple notes at once) and a `Part` object
with our JSON parsed MIDI events.

And then when we want to start playback, we can just call `start` on the `Part` object and the Tone.js transport object:

```ts
	Tone.getTransport().start();
	PlaybackToneSeq.part.start();
```

Once I got playback that seemed in time and what I expected, I was pretty happy after my confusing journey through the Tone.js API!

## Working with Parts
So playback seems great, but I do want a fully interactive MIDI timeline. I'm going to be honest: initially I thought Tone.js was being
buggy and not so well thought out. But after revisiting to write this post and slowing down to think through the API, I think `Part` just
doesn't fit my use-case as well as I'd like.

The main problem is that there's no great way to query the current time of my playback session. Remember, my "playback session" is against
a timeline, so as a user I can scrub around, pause, play, and even define a range to loop over.

The `Part` object DOES have a `progress` property, but it consistently returns `0` unless I enable looping and set the start and end times of the loop.
However, when I do that, I can get query progress and get back a normalized time between 0 and 1 (or rather 0-100% of the loop).

Tone.js documentation tells me that I don't have to set the `loop` property to `true`. Instead I can set it to a number to indicate
how many times it loops. But in practice, I found that even if I set it to 1 to play a single time, that doesn't affect the main timing
mechanism that I haven't mentioned yet, which is `Tone.Transport`.

The playback state of the `Part` will still tell me that playback has started, and there's nothing in the `Part` object that tells me it's finished,
so I'd have to write my own logic to watch for that and take action. If I do nothing, the `progress` property will continue reporting time as though
it's an indefinite loop, but no notes will be played once my loop count is over!

## Tone.Transport
I say `Tone.Transport`, but the proper (non-deprecated) way to access it now is `Tone.getTransport()`. This transport object is the main timing mechanism
behind all of Tone.js. And it's global. So having a separate `Part` object when you have to ALSO go through the transport when you want to play, pause, seek, etc
feels a bit messy.

Given the above situation with `Part` and trying to get playback progress, then it seems best to perhaps just get timing info from the transport.
But like I said, when working with the transport, it's completely separate from the `Part` object, so it's on you to calculate time
in relation to your sequence. For example, if you range select a portion to loop over, you'll need to adjust the global playback time
you get from the transport to the time in your sequence. Or if you leave the transport running while pausing your sequence (if you can), then
you'll need to subtract that time as well. Or, lastly, if you're on your third loop of a sequence, you'll need to adjust the time (as it's been counting up since the first loop started)
to the relative time in your sequence.

## DIY
To be honest, I gave up when I kept getting JS runtime errors thrown when I was
scrubbing around. On my second pass with this code as I was writing this post, everything seemed to work fine. Maybe it was just
me doing something wrong that first time around.

Beyond that, though, all of these problems are manageable assuming you're willing to write a bit of code to manage all of this.
But at that point, what is the use of the `Part` object? As I eluded to before, it's likely useful in other situations - I can
imagine lots of use for `Parts`, `Patterns`, and `Sequences` in something like a music coding environment where you're creating a
composition and want to experiment easily with different coding patterns.

That's not what we're doing here, though! So, ultimately, I think the best way to manage a MIDI timeline is to handle the sequence
playback yourself. I've had lots of past success with playing notes in Tone.js live, or triggered by code live, so that's exactly what
I'll do.

But how? Managing an array or note events is easy enough, but music is all about perfect timing!
The usual suspects are `setInterval` and `requestAnimationFrame` in Javascript, but I've been around the block long enough
to know that these aren't great when timing is important. Both can easily fall behind when your UI thread is busy, and in fact that's
what `requestAnimationFrame` is designed to do - to fire off when things aren't so busy.

And then the question is, even if these were perfect, what timing resolution do I plan to check for notes to play? If I was playing
a sequence where things aligned perfectly with a beat (quantized), then I could fire off notes according to 16th notes, 32 notes, or whatever
the needs are. But for MIDI, I want to allow for off-beat notes, and even imperfections in timing that make music sound more human.

## Zyklus
Ignoring the resolution issue for a moment and focusing on accurate timing, I explored, or rather my co-worker found me, a small but nifty library called [Zyklus](https://github.com/felixroos/zyklus).
Zyklus uses the Web Audio API to create a dead accurate clock to fire off events at EXACTLY the interval you specify.

I pulled this in locally and started playing around with it. It definitely delivers! I won't share much here because the [demo page](https://loophole-letters.vercel.app/web-audio-scheduling)
goes into a lot of detail about how Zyklus works and lets you play with it.

Initially I was thrilled to see that it was a tiny ES6 package that could be simply imported into my project. Basically, I was just
relieved to see it wasn't commonjs, no need for front-end tooling, just a simple import!

Unfortunately, it was a little tricky getting it to work in Typescript. Zyklus uses the prototype object on `AudioContext` to extend out the
native audio functionality to include this new clock. I'm pretty sure we're still not cool with extending native objects like this (it was bad practice last I checked).
And I was having a terrible time trying to get Typescript to play nice with it - so I just copied this small library locally into my project and added a big ol `@ts-ignore` to the top of the file.

```ts
// @ts-ignore
AudioContext.prototype['createClock'] = function (...
```

## Off-Beat Notes
It seemed to work pretty well scheduling events! But then I realized something...I don't need to solve my off-beat notes. I don't need events to fire exactly when I need the notes to play.
The reason is that I can schedule Tone.js notes in the future!

```ts
const now = Tone.now();
this.synth?.triggerAttackRelease(
	event.note,
	event.duration, now,
	event.velocity / 127);
```
In the above snippet, I'm telling the note to trigger at the exact current time of the timing event that's being triggered.

I changed this approach to instead schedule a note to play "now" plus the delta of the current time and the time of the next note in the sequence.
If it happens to be in the past, for whatever reason, then I just play it immediately (which is why I'm using `Math.max`).

```ts
const now = Tone.now();
this.synth?.triggerAttackRelease(
	getNotation(event.note),
	event.duration, now + Math.max(0, nextnote.time - this._currentTime),
	event.velocity / 127);
```

Going even further - since I'm measuring that delta as something that could be inconsistent, I really don't need to use Zyklus at all.
Back to `requestAnimationFrame` for me! Assuming I plan the look-ahead time to be something big enough that RAF can keep up with, but small enough that I can stop playback on a dime, then I shouldn't
notice any playback issues.

## The Timeline
When all is said and done, I have a Web Component and [Lit](https://lit.dev) based MIDI timeline player.
Obviously it's just a first pass, and I'll probably run into issues when I use this in a larger project, but for now it seems solid!

You can find it on NPM [here](https://www.npmjs.com/package/midi-sequence-timeline) and the github [here](https://github.com/bengfarrell/midi-sequence-timeline).

I thought this playback piece would be so easy, but there's obviously more nuance to Tone.js than I assumed. It'll be super interesting
to see where my explorations go once I experiment more! Tone will be part of that, but [Sonic PI](https://sonic-pi.net) should be another big part of it.
Either way, I'll be making some music!

![My synth I want to play with](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/12/synth.jpg)
