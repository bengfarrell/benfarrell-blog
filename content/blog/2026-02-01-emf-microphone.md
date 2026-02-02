---
title: "EMF Microphone"
date: "2026-02-01"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/spectral.jpg"
categories:
- "blog"
- "3d-printing"
- "music"
- "audio"
---

One of the smaller experiments I've been wanting to try lately is listening to electromagnetic fields. Inspiration has come mainly from the Japanese group
[Electronico Fantasticos](https://www.electronicosfantasticos.com/). I've seen some rad experiments come out of folks that are inspired by them as well - mainly inspired
by this CRT TV Guitar project:

<iframe width="560" height="315" src="https://www.youtube.com/embed/zPKxNTt-8A4?si=Pduo0O41lBP1LhSJ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

There are certainly some cool EMF related projects that have been done and could be done, but I don't have much experience with just listening to how EMF sounds when you aren't trying
to manipulate the fields.

So, I wanted to try some EMF field recording! But of course I needed a microphone.

## Making an EMF Microphone
It turns out that EMF microphones are super simple. Basically you just attach some copper wire to some headphone wires. The input needs to go through some
kind of signal amplifier, and then out to some headphones.

I initially started with this [DIY instruction guide](https://www.instructables.com/Electromagnetic-Microphone/), but embarrassingly enough, I ended up
partially melting my battery pack. Sigh. I'm not good with electronics, but I think my sloppy solder job made a bad 6v battery loop...and things just got hot. Oops.

But then I asked myself why I bothered to buy a mini signal amp at all. I have both a mini audio amp, as well as a nice [Zoom H2N](https://zoomcorp.com/en/us/handheld-recorders/handheld-recorders/h2n-handy-recorder/) microphone that amplifies incoming external mics already.

With a cheap camera cage I already had, I assembled this beast!

![EMF Mic](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/rig.jpg)


## 3D Printing the Copper Wire Holder

That blue, purplish thing at the end? That's an entire spool of copper wire! I decided to get a bit fancy with this as an excuse to use my 3D printer again.
So I kit bashed a wire holder from Thingiverse (with a cute little cap you can remove), with a microphone attachment I also found on Thingiverse.

I went through an iteration or two before I had something that my copper wire fit into - but once I finished, it was time for field recording!


## It's not as interesting as I thought

When this microphone was freshly built, I got some interesting results, but it was from electronics I knew would be noisy because they're dealing with
wireless signals.

First I tried my Nest thermostat:
![Nest Thermostat](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/nest.jpg)

<audio controls src="https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/thermostat.mp3"></audio>

And next my Macbook pro:
![Macbook Pro](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/laptop.jpg)

<audio controls src="https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/macbook.mp3"></audio>


That was when I thought i'd take it with me to do some "field recording". This actually wasn't all that interesting. As I passed electric boxes in the park,
or christmas lights hung around, I only got low level buzzing sounds. Yeah, probably the constant stream of unchanging current, or being really well shielded
made things pretty quiet.

Even the CRT TV I found in an arcade with Rampage on it, was just....OK.

![Rampage with CRT TV](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/videogame.jpg)

<audio controls src="https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/videogame.mp3"></audio>

<audio controls src="https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/videogame2.mp3"></audio>

I think the electronic boxes you find outside in parks are the most disappointing. I expected some good noise - but I just got a low hum. I think this
proves I'll need to be more discriminating with my field recording from now on, or even just find stuff around the house. Because well shielded things
that just have electricity pass through just aren't interesting!

![Rampage with CRT TV](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/powerbox.jpg)

<audio controls src="https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2026/02/electricbox.mp3"></audio>

## What's next

I'll probably try some more field recording - but I don't think me just taking a walk around the neighborhood is going to net me anything
interesting. I'll probably even have to setup some noisy scenarios. Either way, I think there's room to get some interesting sounds after a first
venture out!

Also, there's a fancy new design I found on [Github](https://github.com/LOM-instruments/Priezor). I have some spare acrylic and a CNC machine, so I want to
put this together real soon and see if I hear any difference!
