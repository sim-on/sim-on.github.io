---
layout: post
title: 'Bioluminescence (leuchtalgen.js)'
tags: [projects]
accent_image: /img/bg_leuchtalgen.png
accent_color: '#00c9c7'
---

On a trip to the Black Sea last year I had the pleasure of witnessing bioluminescent algae underwater. Their light was faint and only visible during a moonless night, but I was thorougly impressed by their beauty. 

I wanted to recreate the effect and found a [paper on fluid dynamics in games by Jos Stam](http://www.dgp.toronto.edu/people/stam/reality/Research/pdf/GDC03.pdf) that contains a straighforward implementation of a fluid solver in C. While approximative in nature, the results of this model look really pleasing. As it is 2017 and we have enough CPU cycles to waste, I wanted to build my own version with JavaScript and an HTML5 canvas, which you can find [here](http://grosser.in/assets/leuchtalgen.html).  Click the mouse to whirl the fluid around. One modification I made to the original model is in displaying the data of the density and velocity arrays: I made the brightness depend on the velocity which yields a bioluminescence-like effect, just like algae that light up when the water is perturbed.

As the paper is light on the (challenging!) math behind the code, I'll probably do a follow-up post on how to arrive at this result, starting from the Navier-Stokes equation if I have the time for it.

You can get the code [from Github](https://github.com/sim-on/leuchtalgen) or play with it [here](http://grosser.in/assets/leuchtalgen.html).
