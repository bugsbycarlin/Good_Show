//
// This file contains a system for pausing and resuming games, for keeping time
// that respects pauses, and for making delays that respect pauses.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let paused = false;
let pause_moment = 0;
let pause_time = 0;
let paused_tweens = [];

pause = function(extra_method = null) {
  paused = true;
  pause_moment = Date.now();
  paused_tweens = [];
  let tweens = TWEEN.getAll();
  for (var i = 0; i < tweens.length; i++) {
    var tween = tweens[i];
    tween.pause();
    paused_tweens.push(tween);
  }
  if (current_music != null) {
    current_music.pause();
  }
  pauseAllDelays();
}


resume = function() {
  paused = false;
  pause_time += Date.now() - pause_moment;
  for (var i = 0; i < paused_tweens.length; i++) {
    var tween = paused_tweens[i];
    tween.resume();
  }
  paused_tweens = [];
  if (current_music != null) {
    current_music.play();
  }
  resumeAllDelays();
}


markTime = function() {
  return Date.now() - pause_time;
}


timeSince = function(mark) {
  return markTime() - mark;
}


// Wrap setTimeout so it has pause functionality.
delays = {};
unique = 0;
function delay(callback, delay_time) {
  var d = new Object();
  d.fixed_id = unique;
  unique += 1;
  d.callback = callback;
  d.delay_time = delay_time;
  d.start_time = Date.now();
  d.id = window.setTimeout(d.callback, d.delay_time);
  d.delete_id = window.setTimeout(function() {delete delays[d.fixed_id]}, d.delay_time);
  d.paused = false;
  delays[d.fixed_id] = d;
  return d;
}


function pauseAllDelays() {
  for ([id, value] of Object.entries(delays)) {
    let d = value;
    if (d.paused == false) {
      window.clearTimeout(d.id);
      window.clearTimeout(d.delete_id);
      d.delay_time -= Date.now() - d.start_time;
      d.paused = true;
    }
  }
}


function resumeAllDelays() {
  for ([id, value] of Object.entries(delays)) {
    let d = value;
    if (d.paused == true) {
      d.start_time = Date.now();
      d.id = window.setTimeout(d.callback, d.delay_time);
      d.delete_id = window.setTimeout(function() {delete delays[d.fixed_id]}, d.delay_time);
    }
  }
}

