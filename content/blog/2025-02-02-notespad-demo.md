---
title: "Notespad"
date: "2025-02-02"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2025/02/notespad.png"
categories:
- "blog"
- "web components"
- "ai"
- "music"
- "audio"
- "web"
---

I'm forcing myself to show stuff off more. Usually I don't share until things are perfect, but this
time, I have a very imperfect work in progress.

At the same time, however, I'm pretty impressed with how a couple of AI tools I'm using are coming together.

The app I'm building is called "Notespad". I think of it like Windows Notepad where you're
just working with text to jot stuff down, organize your thoughts, and then get it out to another
application...maybe a word processor or an email reply.

In "Notespad", we're not working with text, we're working with music notes.

Same deal: get the notes in, work with them, organize your thoughts, and get them out to wherever
helps you most. Maybe a digital audio workstation like Ableton.

As a starting workflow, I'm taking a song, isolating a section in time, and then extracting the bass part
using [Facebook Demucs](https://github.com/facebookresearch/demucs) running locally in the browser.

And then I use Spotify's [Basic Pitch](https://basicpitch.spotify.com/) to extract MIDI notes from that baseline.

Finally, I just copy and paste the output to a [Sonic PI](https://sonic-pi.net/) live loop!

Again, this is just a workflow I wanted to nail to get the hard stuff out of the way. I do think
this might be the most valuable workflow I want to enable, but we'll see as time goes on.

Here's a video to show it all off!

<video src="https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2025/02/notespad.mp4" controls></video>
