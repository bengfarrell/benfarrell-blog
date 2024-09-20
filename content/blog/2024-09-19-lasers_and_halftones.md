---
title: "Lasers & Halftones"
date: "2024-09-19"
coverImage: "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/cover.jpg"
categories:
- "blog"
- "fabrication"
- "web"
---

Whatever the heck this blog post is about, you can tell it's gonna be cool. Lasers are awesome.
I remember I had a fifth grade field trip somewhere that had lasers, and I did a report on them because
of how awesome they are.

First though, lets talk halftones.

## Project Hello Halftones

Back around 2020, my extremely math-inclined co-worker [Dmitry Baranovskiy](http://dmitry.baranovskiy.com/) had invented some algorithms for drawing halftones, as one does in their spare time :).
His experiments involved taking an image, and converting to a vector based halftone pattern. It worked super well, and he had a variety of programmatic settings to tweak them.

![sample halftone](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/halftone-example.jpg)
*Sample swirly circles halftone pattern alongside original image*

We had different shapes, patterns like a spiral or wave for the halftones to follow, various levels of detail, all that. I don't really need to elaborate, because at the same time we teamed up and made a web app!
We launched "Hello Halftones" on [labs.adobe.com](https://labs.adobe.com).

Anyway, we launched our experiment [Hello Halftones](https://labs.adobe.com/experiments/hello-halftones/) and OF COURSE we all had some fun with importing images and making halftone patterns.
But here's the thing - halftones are a bit of a niche thing. Sure they were super useful back in the day when newspapers relied on halftones to recreate images. But its now (checks watch) 2024
and we can not only print super high res images, but also...things are digital! So halftones are a bit of an antiquated concept that get pulled out to achieve an
aesthetic effect every once in a while.

![Hello Halftones app](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/hello-halftones-app.png)
*[Hello Halftones](https://labs.adobe.com/experiments/hello-halftones/) web app on labs.adobe.com*

At the time, we talked on my team a bit about how it would be neat if we tried using these for laser cutting or engraving. But alas, we didn't have access to a laser cutter at work.


## Sun Gallery Makerspace

So lasers were again calling to me from the recesses of my 5th grade mind in 2021 when we launched this project. But they were unanswered until
I joined the board of directors for the [Sun Gallery](https://sungallery.org) in Hayward, CA. The Sun Gallery is a local non-profit that had just won a grant to build a makerspace. And damn straight
we purchased a laser cutter/engraver for the space. Honestly, how could you not? Lasers are a cornerstone of the makerspace equipment repertoire.

Now, things never go as planned when you finally get to try the thing you said you'd try. Just because you imagined it going 100% to plan doesn't make it so.

## Halftone laser cutting first attempt
At the Sun Gallery, we have a fairly powerful 100W Omtech laser cutter/engraver. Laser cutting or engraving definitely has a bit of a learning curve. And yes, part of that learning curve
is reading the manual, which I never do. However, I made an exception here, BECAUSE. LASERS. ARE. DANGEROUS.

![Laser cutter at the Sun Gallery makerspace](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/lasercutter.png)
*OMTech 100W Laser cutter/engraver at the [Sun Gallery makerspace](https://makerspace.sungallery.org)*

We at the makerspace documented a lot of materials and the settings to use for each but
every project is different, and you just need to get a feel for what you're trying to do and allow mistakes.

Mistakes are certainly what happened my first time cutting a halftone pattern!

Our board president Carla brought her dog Chewbacca (what a wookie) to the gallery on the day I needed a subject for my first attempt.

![Chewbacca the dog](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/chewbacca-the-dog.jpg)

*Carla doing her best to get Chewbacca to sit still for a halftone portrait*

As I brought Chewie into "Hello Halftone", I noticed a couple of things right off the bat.

First, I had to go into Photoshop to both invert the colors of the image and adjust the brightness to make the halftone look good.
This certainly wouldn't be true for all images, but the lighting conditions and the background of the photo called for needing those
adjustments for this to even work.

Again, not all images need these adjustments, but I've found that lots do. And it was a little annoying going to photoshop all the time to do this, especially not
having a live preview of the halftone right there as you do it.

![Chewie in hello halftones](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/chewie-in-halftone.png)
*Notice the dark background which we'd rather wash out, and the dark areas on Chewie's face we might want to raise up or down with brightness*

Anyway, once I had a halftone I deemed good enough, I exported the SVG and brought it into Lightburn. For any of you that aren't familiar
with [Lightburn](https://lightburnsoftware.com/), it's basically THE goto software for laser cutting/engraving. It's a bit pricey, but the alternatives are missing key features to allow you the ease of creating a job and the freedom to move elements around as you need. Plus its cross platform...so me being on a Mac isn't a problem.

The halftone looked good, but the cut became kind of a mess. The problem was that some of the halftone shapes were too close to one another. At best, it created a brittle honeycomb like
pattern in the wood that fell apart when you looked at it wrong. At worst, large sections of the wood, those darkest areas in the image were collapsing into itself and breaking off the image.

![Portrait of Chewbacca the dog](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/laser-chewie.jpg)
*Halftone portrait of Chewbacca the dog, cut on our laser cutter/engraver*

![Close-up cave-in](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/close-up-cavein.jpg)
*Brittle cave-in when halftone shapes are cut too close together due to large dark regions*

I tried more and different pictures - and this problematic...let's call it a "honey-comb cave-in"...issue could be
somewhat mitigated by increasing the brightness of the image and trying to get large dark contiguous areas not to be so
dark anymore, but for a web app that was all about dropping any old image in and getting a working halftone....well, let's just
say it irked me.

## Hello Halftone - Laser Edition

OK, no, I didn't actually call my app update "Laser Edition". But I did quietly add some features 3 plus years after we launched and deployed
Hello Halftones to labs. The first two things I added were, if you know web dev, just canvas filters in our implementation.

The first was a brightness filter. So, in the web app...instead of going out to Photoshop, you can adjust brightness of your imported image.
Typically, I've found you want to increase it - you're washing out all those huge dark areas and preventing them from being atomic
halftone shapes that are too close to one another.

The second was a switch to invert the colors in the image. Again, this wasn't always necessary, but you never really know, given an imported
image, how your subject will mesh with your background. For photos with a discernible subject, you want the background to be non-existent, but sometimes the
background is the most prominent thing there once it gets halftoned. So inverting colors is key!

These features really do help, but sometimes you get a composition that looks really good, but the halftone shapes are STILL too close to one another
and will definitely lead to HONEYCOMB LASER COLLAPSE (I've named this here hoping that I can make a good AI generated image with this prompt).

![Honeycomb laser collapse](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/honeycomb-laser-collapse.jpg)
*Honeycomb laser collapse: a dramatic re-imagining generated with Adobe Firefly text to image*

So, I added a third (and last feature) called "Max shape radius". Think of it like this: every atomic shape in a halftone pattern has a size (and therefore a radius).
The darker the color in the image, the larger this shape will be and probably a little to close to its neighbors. On a digital image, there's really nothing wrong when these shapes overlap or slightly touch each other.

![a dark cluster](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/dark-halftone.png)

*Halftones generated from a darker section of an image with make the halftone shapes larger and closer together*

But when you're cutting holes with a laser cutter, as fine as the cutting beam is...well. HONEYCOMB LASER COLLAPSE.

So this new "Max shape radius" slider says - "Hey, if pure black gets represented by a shape that's 100% of the possible size, let's limit
the possible size to some percentage of that maximum size".

I don't necessarily know if this is the perfect solution because as you go lower and lower, the sizes of your atomic halftone shapes start getting pretty
uniform and you can't make out an image anymore. But, at the same time, it can serve to limit those darker patches to something that won't ruin your cut if you're careful.

![Max shape radius setting](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/max-shape.jpg)
*Max shape radius starting at 100% (left), then 84%, 71%, and finally 50%. Notice how the shapes successfully get separated in preparation for laser cutting, but the image gets washed out
when going too low*

In practice, I've also noticed that what looks a bit unsaturated on screen in terms of shapes being smaller and more uniform, actually ends up looking pretty great when cut. So there's a bit of a learning
curve and some eyeballing to do, but at least there is some control to constrain how much the laser cuts away.


## Rock-boxes

As I got the pieces in place, I was fairly set on the use-case of creating portraits of people. It seemed the best thing to shoot for, because
portraits tend to have a clear subject and a background you don't typically care about, so it's something we can aim to wash out as we make halftone patterns.

But even at medium halftone resolution, the finer details DO get washed out and the face looks less and less recognizable. And, I'm assuming if we go too fine, we risk
the honeycomb collapse again, or even just not having a pattern that lets enough light through to illuminate the image.

So, with this in mind, I went for famous musicians! Portraits of legends that would be easily recognizable at a distance. It's laser cutting time!

![Bono SVG](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/bono.png)
*SVG of Bono from U2, ready to be laser cut*

Like I said, there was still a bit of a learning curve as I started out. I even got a BIT too ambitious once I had some great cuts where I wanted to try mixing acrylic ink with a clear
sealant to fill the laser cut holes with a semi-transparent layer to diffuse light better.

Unfortunately, the holes were too tiny, and as a result air kept getting trapped making things super uneven and messy. That said, I don't typically work with these materials, so there
could be a better way of accomplishing this...though for now, I'm throwing in the towel!

![Filling holes](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/hole-filling.jpg)
*Failed attempt at adding light diffusing semi-transparent sealer - Notice especially on Bono how uneven it is on each hole due to air bubbles*

Once I gave up....err...WAS SATISFIED with the results, I grabbed some cherry red wood stain I had in my garage and applied a few coats to the laser cut face. And then to create the rest of the box, used my
handsaw to cut the remaining pieces, nailing them into place.

I'm gonna be perfectly honest. I'm not a woodworker. My cuts weren't straight. Some of my nails went in crooked, and I really shouldn't have been besmirching the nice laser cut box face with nails, let alone crooked ones.
But as a first attempt, the results didn't look half bad.

## Lighting it up

Cuttable LEDs strips are a thing! I didn't really know how they worked, but it was a fairly simple thing to research. I [bought a 16.4 ft roll](https://www.amazon.com/gp/product/B075LB9HK2) and some [solderless/snap down LED strip connectors](https://www.amazon.com/gp/product/B01DM7EXX2/).
Since I knew I was using low voltage, I felt safe enough to just touch the exposed wires to a 9V battery. After some trial and error figuring out the connection, my short 6 inch cut LEDs strip lit up!

![Powering the Cuttable LED strip](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/snap-led-connector.jpg)
*With cuttable LEDs you snip along the marked area and expose the contacts. The snapping LED connectors can be a bit hard to open up at first, but once you do they hinge open and you set the LED contacts on the strip to the now exposed power connectors. Close the strip connector, and then touch the two separate wires
to a 9V battery*


At that point I knew my lighting plan should work! So, I measured the inside of my boxes and applied my (sticky backed) LED strip around the sides of the box and bought some [9V battery holders](https://www.amazon.com/dp/B07BXBS93X). These ones actually have on/off switches so they proved to be
a great way to provide power without leaving the box always on.

I did have a moment of disappointment when I turned on the box. The LEDs really weren't shining through all that well. The problem was that the light was mounted on the sides. I knew they weren't going to be directionally correct, but I
thought that enough light would shine through the front. Unfortunately, this wasn't the case, so I lined the back panel of the box with an aluminum foil wrapped piece of cardboard.

THIS was enough to make the light shine through the front well enough and create a nice effect.

![Boxes](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/three-boxes.jpg)
*Bono box with LEDs and tin foil back panel in place, alongside John Lennon and the Division Bell album cover (non-illuminated)*

![Inside](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/inside-of-box.jpg)
*Inside the Bono-box: LEDs attached to the side, makeshift tin foil back, and 9V battery container*

Though, if we're being honest, the LEDs now lit up the front too well. You could actually make out individual LED lights from certain angles.
I gotta tell you, this was ruining my vibe. I don't need an EVEN light, just something noisy enough to not force you to see
what the inside looks like.

So at this point, I went to the library and studied up on optical physics...

Just kidding. I balled up some aluminum foil, and stuck it to the back panel with some tape and hoped for the best.

![Tin foil ball](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/balled-up-tin-foil.jpg)
*The optical physics of carefully balled up tin foil disperses the light*

## Coloring the box

Still having hurt feelings about my semi-transparent sealer attempt, I also picked up some [colored gel light filters](https://www.amazon.com/dp/B08NG8PLS3). I cut a blue one to height, and a bit wider than the box front and just stuffed it in. It's holding tight as its snug
against the LED strip, so works well!

![colored gel filter](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/gel-filter.jpg)
*Gel light filter curved to cram in the front against the laser cut face. The LED light strip holds it in place*


## Refining the process

So at this point, I had something that worked well enough, but I had uneven cuts and badly nailed sections.

"If only I could cut wood with millimeter precision accurate straight lines"...he said with a straight face and full access to a laser cutter.

There's a fantastic website called [MakerCase](https://www.makercase.com/) that lets you input the dimensions of a box you want to make and lets you download an SVG of the faces of the box ready to be laser cut!
I made a 5x5x2 inch box and cut it out of 1/8 inch birch plywood. The cuts were perfect for snug assembly, and I added the halftone pattern to a couple of the faces, ultimately making a [Lightburn template]() of sorts.

![Bonobox close up](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/bonobox-closeup.jpg)
*Is it a lightbox? Or is it a BONOBOX?*


![Bonobox close up](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/bonobox-angle.jpg)
*Photo taken from an angle, it's even better than the real thing*

![Bono and Lenon hanging out](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/bono-lenon.jpg)
*Bono and John Lennon hanging out by my record collection*

![Full set](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/full-set.jpg)
*Bono x2, John Lennon, and Pink Floyd's Division Bell*


This was a fun little experiment, and while I'm not necessarily handy with wood, lasers made it easy. If you're in the
area, come learn about and check out the [Sun Gallery makerspace](https://makerspace.sungallery.org) and make your own laser cut light box!
Here's my Lightburn template for the [Bono box](https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/2024/09/bonobox-0.125in-template.lbrn2).
The template is for 1/8" inch thick material, and I used birch plywood.

But if you're not in the area, you can always try out [Hello Halftones](https://labs.adobe.com/experiments/hello-halftones/) and make your own halftone patterns for your own laser cutter, or
any number of other things you can think of!
