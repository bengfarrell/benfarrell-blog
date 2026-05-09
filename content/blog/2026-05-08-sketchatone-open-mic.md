---
title: "Sketchatone (first) Open Mic"
date: "2026-05-08"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/05/dukejames.webp"
categories:
- "blog"
- "ai"
- "python"
- "midi"
- "node.js"
- "javascript"
- "ai coding"
- "hardware"
- "music"
---
*Pictured is [Duke James](https://www.instagram.com/dukejamesmusic/) playing a set at the Smalltown Society lab before the open mic. This was during
the Smalltown music lab on 5/6/2026. Duke played an amazing and soulful show*

This wasn't just my first open mic using Sketchatone, but my first open mic period.

<iframe width="415" height="739" src="https://www.youtube.com/embed/4Pw_EIBRXHI" title="Sketchatone Cover of &quot;No Excuses&quot; by Alice in Chains" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

*A short clip captured of me at the open mic, see the bottom of the post for a home recording*

I've been taking singing lessons for a few
years now, and been doing the "Band lab" thing with my instructor [Jim Bedford](https://www.castrovalleyforum.com/news/castro-valleys-music-legend-jim-bedford/article_2b62318e-00f1-423b-8daf-2e24836f9eee.html).
I've been working with a great set of musicians - and we're all learning, but doing great and playing a couple times a year as we form several versions
of bands around the songs we're working on. I also did a [Bandworks](https://www.bandworks.com/) stint with some friends last year.

All of it is fun, but inevitably in any of these setups there is the one guitar player who can do some decent
rhythm playing and sing solo. I get jealous, try to do some stuff on keys while singing, and I'm just not vibing with it.

I can play keys decently in a band situation, but just not proficiently enough to fill the same space as a guitar - especially when singing.
Not just that, but most of the music I grew up with is very guitar driven. I've tried jamming on keys
to a guitar oriented song, but again its just not vibing most of the time. And when it does, it's a rather slow (and likely depressing) song.

Nothing wrong with that, but that's not what I want to play right now.

### A short bit about Sketchatone
Anyway, this was all really the motivation behind Sketchatone. I [blogged about it](/blog/2026-02-23-sketchatone) back when I initially released it in February, but the gist is this:

Grab an inexpensive drawing tablet - and assuming its a model that can work with my software, that becomes your MIDI controlled guitar strummer.
Imagine some strings laid out horizontally across the tablet. Unlike a real guitar, we can have as many strings as you want.
I'm typically working with 9 to span a 3 note chord across three octaves.

![Tablet visualization](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/05/tablet-viz.jpg)
*Imaginary strings running across the tablet - shows a G chord*

As you drag your pen across the tablet, it will hit and pluck each string. Drawing tablets can offer so much control in terms
of pen tilt, pressure, etc. Sketchatone can map these to MIDI velocity, pitch bend, note sustain etc. It's
all pretty customizable in the Sketchatone UI, but I've got some good settings dialed in.

### Changing Chords (actually playing a song)
For ultimate control, I've been using a MIDI keyboard to play chords on my right hand and strum with my left.
But I also don't want to go too complicated out of the gate while I'm getting used to playing with this. Also it helps at something
like an open mic night to keep a small profile, and set up quickly. So for now, the keyboard is out.

Luckily, most drawing tablets have some buttons on the side. Using my web based configuration, I can map chords
to those buttons. The first song that I went really deep on with this is "No Excuses" by Alice in Chains. This one only has 4 chords
throughout the song, so really easy to manage.

### Hardware for a first open mic
Like I said before, keeping a minimal hardware profile for an open mic night seems critical. There's no time to setup, no mic check - just
respect everyone's time and get on and off the stage as quickly as you can.

In addition to the drawing tablet, I need a computer to make it act like a MIDI controller.
I've been pushing hard on making this work on a Raspberry Pi. And since it's not doing anything
complicated, just pushing MIDI events, it can be a Raspberry Pi 4 which has a pretty low power draw compared to
the Pi 5. So, connected to the right device, it can be powered from and pass data through the same USB cable.

![Raspberry Pi 4 in a custom 3D printed case](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/05/tabletandpi.jpg)
*The computer that powers the drawing tablet in a custom 3D printed case*

### The Synth (emulator)
I had big DIY plans for this. I actually built a custom [Zynthian](/blog/2025-10-03-cnced-music-factory/) box. Its great, but at the end of the
day, I'm not familiar with decent production workflows in general for portable DAWs, so I eventually threw in the towel and bought an [MPC One Plus](https://www.akaipro.com/products/mpc-one-plus).
Maybe I'll go back to my Zynthian someday, but I'm really loving the MPC.

![MPC One Plus](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/05/mpc.webp)

So this is what I used! What was great about this is that I really only used two pre-programmed tracks. I think if everything was
sequenced ahead of time, I'd really just feel like I'm singing over a robot. I want to push on what I can do live as much as possible.

Obviously drums need to happen. The MPC offers lots of dance/EDM options by default so I haven't explored too much besides the couple
of normal kits plus the two 80's sounding kits. I started laying down drums with the normal acoustic kit - but I didn't like it just due to
the fact that if I want an acoustic drum sound I should just use a real drummer rather than recreate it without any human
nuances.

That's when I struck gold - hidden in the huge list of drum kits is an 808! The real 808 drum machine was released in 1980 and has been an iconic
sound since then. Marvin Gaye's "Sexual Healing" and Whitney Houston's "I Wanna Dance with Somebody" are some prime examples. More importantly, it's
not trying to sound like a human!

<iframe width="560" height="315" src="https://www.youtube.com/embed/9LxPoJ4QoSk?si=ky1q9tlC58USsSAn" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Especially with such a beautifully acoustic sounding song like "No Excuses", I don't want to try copying. Instead lets speed ahead
in exactly the opposite direction. Ultimately, the drum didn't sound as snappy and echoey as I'd like - I wanted to match the original's vibe
with this, so I got some advice from AI and added some MPC specific FX (Transient, KillEQ, Maximizer, and Flavor).

The other sequenced track was the bass - using the TubeSynth "Simple fat bass" preset, though I think I tweaked to make it a bit punchier. Honestly, I got the broad strokes from the original in there, but
didn't go nuts with some of the more articulate playing from the original. It was probably laziness that got me here, but
its probably better that way because, again, this isn't a live bass - probably best to not try to be a human here.

### The "rhythm guitar"

I used a nice synth patch to fill in for the rhythm guitar. It fills the space super well, and has some nice
sharp higher ends that bring out the "plucking" of strings that I wanted to highlight with my Sketchatone MIDI controller.
I used the Jura synth with the "Abandon" preset.

I practiced with this for a while, but I started really getting disappointed that I had
no lead guitar. I was just going to ignore it because sequencing lead guitar parts just feel wrong for this song, missing
that human element, and I sure didn't think I could play rhythm and lead simultaneously.

After spending some time thinking what to do, the guitar solo itself seemed like a lost cause, but the chorus really just needed a bit more volume and
high end, because the singing goes up a register here.

I started experimenting with having my MIDI strumming control a second synth track simultaneously.
This is when I hit exactly what I needed. I tried overlaying an arpeggiator. I found that
just normal strumming with subtle variations can really make the arpeggiation feel like an entirely
separately controlled thing - making it kinda sound like a lead guitarist!

Riding high with this success, I started wondering what I could try with the solo. Obviously, I'd use the
arpeggio again, but wanted some extra noise that I could at least do a noisy grunge discordant thing with.
So I added a bendy overdrive synth. It doesn't sound like I'm adding much with normal strumming, but when I use
Sketchatone to start doing some extreme pitch bending while I strum and also dwelling on the highest string, I can start
getting kinda Sonic Youth vibes going while still strumming the rhythm part.

Its not as interesting as a guitar solo, and is largely just noodling rather than actually
trying to articulate notes, but its a good replacement in a pinch.

There's also some nice short lead guitar transitions when the verse transitions to the chorus
in the original. I did some track automation on the last measure of the verse to let these
extra lead guitar instruments come in (just unmute the instruments during this part of the verse).

### The rig
After some decent practicing (remember, this was the first time I've strummed a song), I thought I sounded
pretty good. I still hadn't solved how I was going to hold the drawing tablet though. Up until two days before
the open mic, I just put the thing on top of my music keyboard I had on a stand. Its too hard to hold the tablet
while strumming and operating the buttons. My friend suggested a normal iPad holder for mic stands.

This was a winner! I mounted it to the MPC stand and it worked really well.

![the rig](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/05/therig.jpg)
*The stand, MPC, and tablet holder in my garage, ready to go!*


### Performing

I'm still a newbie to singing. I'm doing well at home, but really don't have the experience on stage. I've only performed
a handful of times in these past few years.

Lucky for me, my first open mic was at [Smalltown Society](https://smalltownsociety.com/). This is a great arts non-profit in
Castro Valley that really does music well. It is THE absolutely most supportive environment you could ever hope for in an open mic.

Normally, I'm a nervous wreck before I do a show, but for this - it was an experiment, and I felt completely open to failure. Of course, I'd rather
it go well....but I wasn't going to be bummed out if it didn't.

I've had the absolute worst luck with stage sound in my tiny music career so far.
I often can't hear myself and just rely on muscle memory when I sing. My very first time singing
was against a backing CD track. It was at the Alameda County Fair in 105 degree weather, where for some reason, the heat messed up the CD causing it to playback 15% slower (and yes pitch was affected).

Smalltown though - I'll probably never have better sound. The space is amazing, and the sound engineer Miguel is the best you'll ever work with - a true pro.
I went in knowing this and even requested some settings I was getting with my vocal effects processor at home.

What I didn't count on was how much of an absolute diva I guess I am. If I don't sound exactly
like a freaking studio recording on stage, it all goes to hell.

I immediately thought I was bombing the moment I opened my mouth.
As good as the best sound engineers are (Miguel included),
you won't sound like a studio recording. The stage monitors will mix with the room, settings will be dialed in during at the start BECAUSE I'M A LOWLY
OPEN MIC PERFORMER and not doing a stadium with a 30 minute sound check and earpiece.

The "bombing" really threw off my game to the point where I started getting some chords wrong, and made me not want
to put the audience through any more misery. The third verse was when I really threw in the towel after mis-remembering how it started.

It was only afterwards, when I saw a short clip that I realized that I actually did pretty darn well and it was all in my head until
I sabotaged it.

Lesson learned for next time. Stage monitors are to MONITOR - not to be your vocal line out that you can slap on a gold master. Obvious, yes - but I've
had only bad experiences so far, so now I know what a stage is really supposed to feel like!

### Until Next Time
I'm really digging the stuff I tried with the lead guitar as a second layer. I have a song
in mind for next time - maybe it'll work. But I also want to try some more articulated playing
with scales instead of chords, so I have some features to add to Sketchatone.

Overall, it worked really well. Feels ironic that my weird Frankensteinish tech setup
worked flawlessly, while my own performance inexperience was the thing that got me!

Either way, thanks to the folks at [Smalltown Society](https://smalltownsociety.com/) for making
a really great and supportive space to try new things like this!

Oh and also for next time, I've ordered some felt nibs for my pen. I had no idea how much it would wear
down playing music!

![The nib](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/05/nib.jpg)
*Oh no! The nib! This is after just a couple days of practice*

<iframe width="560" height="315" src="https://www.youtube.com/embed/dLFdG2tuu1k?si=RmXj7SU1w90IibNL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

*Full song recorded from the cozy comfort of home*
