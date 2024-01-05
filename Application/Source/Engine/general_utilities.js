//
// This file contains general utilites useful across all Alpha Zoo javascript projects.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// Some colors
// Blue: 0x3cb0f3
// Yellow: 0xf3db3c
// Red: 0xdb5858
// Green: 0x71d07d
// Retro green: 0x3ff74f

const board_width = 12;

const special_level_duration = 60000;

const bomb_spawn_interval = 10000;

const letter_values = {
  "A": 1, "B": 2, "C": 1, "D": 1, "E": 1, "F": 2, "G": 1,
  "H": 2, "I": 1, "J": 3, "K": 2, "L": 1, "M": 1, "N": 1,
  "O": 1, "P": 1, "Q": 4, "R": 1, "S": 1, "T": 1, "U": 2,
  "V": 3, "W": 2, "X": 3, "Y": 2, "Z": 4,
}

var character_names = [
  "ALFIE", "BERT", "CALLIE", "DENZEL", "EMMA", "FATIMA",
  "GRETA", "HAKEEM", "INEZ", "JIN", "KRISHNA", "LIAN",
  "MARCUS", "NAOMI", "OMAR", "PABLO", "QUARREN", "RIYA",
  "SOPHIE", "TANIEL", "UBA", "VIJAY", "WINTER", "XAVIER",
  "YAIR", "ZHANG",
];

var opponents = [ "an", "zh", "iv", "ro", "fe"];

var fire_colors = [0xda5533, 0xf66931, 0xef912d, 0xfaae4b];

const letter_array = Object.keys(letter_values);
const lower_array = [];
for (i in letter_array) {
  lower_array.push(letter_array[i].toLowerCase());
}
const shuffle_letters = [];
for (i in letter_array) {
  shuffle_letters.push(letter_array[i]);
}


// This function picks a random number between 1 and N
function dice(number) {
  return Math.floor(Math.random() * number) + 1;
}


function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}


// https://github.com/substack/point-in-polygon (MIT license)
function pointInsidePolygon(point, vs, flat=false) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;

    // flat means the polygon list is [x1, y1, x2, y2, x3, y3, ...]
    // not flat means the polygon list is [[x1, y1], [x2, y2], [x3, y3], ...]
    if (flat) {
      // TO DO adapt this to flat.
    } else {
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          var xi = vs[i][0], yi = vs[i][1];
          var xj = vs[j][0], yj = vs[j][1];
          
          var intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
    }
    
    return inside;
};


// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


function detectMobileBrowser() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}


// Turn a number of seconds into a countdown clock
// 75 -> "1:15"
// 75.5 -> "1:15"
// 200 -> "3:20"
// 23 -> "0:23"
// This method assumes a number of minutes less than an hour.
function countDownString(seconds) {
  let clock_minutes = Math.floor(seconds / 60);
  let clock_seconds = Math.floor(seconds - clock_minutes * 60);
  return clock_minutes + ":" + (clock_seconds < 10 ? "0" : "") + clock_seconds;
}


// An easing function I need sometimes.
// https://easings.net/#easeOutBack
function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}



// Assuming no duplicates in a list,
// find the value and return the next value,
// wrapping around if necessary.
function next(some_list, value) {
  if (some_list.length == 0) return null;
  if (some_list.length == 1 && some_list[0] != value) return null;
  // if (some_list.length == 1 && some_list[0] == value) return value;
  // if (some_list.indexOf(value) == -1) return some_list[0];

  let v_index = some_list.indexOf(value);
  let w_index = (v_index + 1) % some_list.length;
  return some_list[w_index];
}


// Assuming no duplicates in a list,
// find the value and return the previous value,
// wrapping around if necessary.
function prev(some_list, value) {
  if (some_list.length == 0) return null;
  if (some_list.length == 1 && some_list[0] != value) return null;
  if (some_list.length == 1 && some_list[0] == value) return value;
  if (some_list.indexOf(value) == -1) return some_list[0];

  let v_index = some_list.indexOf(value);
  let w_index = (v_index + some_list.length - 1) % some_list.length;
  return some_list[w_index];
}


function pick(some_list) {
  return some_list[Math.floor(Math.random() * some_list.length)]
}


function addDedupeSort(some_list, other_list) {
  other_list.forEach((score) => {
    let dupe = false;
    some_list.forEach((score2) => {
      if (score.name == score2.name && score.score == score2.score && score.uid == score2.uid) {
        dupe = true;
      }
    });
    if (!dupe) {
      some_list.push(score);
    }
    some_list.sort(function comp(a, b) {
      return (a.score < b.score || a.score == b.score && b.name < a.name) ? 1 : -1;
    })
  });
}


function flicker(item, duration, color_1, color_2) {
  item.flicker_junker = 0
  let color_counter = 0;
  var tween = new TWEEN.Tween(item)
    .to({flicker_junker: 80})
    .duration(duration)
    .onUpdate(function() {
      if (color_counter % 2 == 0) {
        item.tint = color_1;
      } else {
        item.tint = color_2;
      }
      color_counter += 1;
    })
    .onComplete(function() {
      item.tint = color_1;
    })
    .start();
}



