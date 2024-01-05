//
// This file contains general sound effect and music utilities based on Howl.js.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var use_music = true;
var use_sound = true;

// let music_volume = 0.4;
// let sound_volume = 0.4;
let music_volume = localStorage.getItem("player_music_volume");
if (music_volume == null) {
  music_volume = 0.4;
} else {
  music_volume = parseFloat(music_volume);
}
let sound_volume = localStorage.getItem("player_sound_volume");
if (sound_volume == null) {
  sound_volume = 0.4;
} else {
  sound_volume = parseFloat(sound_volume);
}

let current_music = null;
let old_music = null;

let sound_files = [
  ["click", "click.wav"],
]


let sound_data = [];
for (let i = 0; i < sound_files.length; i++) {
  file = sound_files[i];
  sound_data[file[0]] = new Howl({preload: true, src: ["Sound/" + file[1]]})
}


loadSound = function(name, path, force=false) {
  if (force || sound_data[name] === undefined) {
    sound_data[name] = new Howl({preload: true, src: [path]})
  }
}


soundEffect = function(effect_name, volume=sound_volume) {
  if (use_sound && volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.volume(volume);
      sound_effect.play();
    }
  }
}


stopSoundEffect = function(effect_name) {
  if (sound_volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.stop();
    }
  }
}


stopAllSound = function() {
  for (const [key, value] of Object.entries(sound_data)) {
    sound_data[key].stop();
  }
}


pauseSoundEffect = function(effect_name) {
  if (sound_data[effect_name].playing() == true) {
    sound_data[effect_name].hold_up = true;
    sound_data[effect_name].pause();
  }
}


resumeSoundEffect = function(effect_name) {
  if (sound_data[effect_name] != null && sound_data[effect_name].hold_up == true) {
    sound_data[effect_name].hold_up = null;
    sound_data[effect_name].play();
  }
}


setMusic = function(music_name, loop = true) {
  if (use_music && music_volume > 0) {
    if (current_music != null && current_music.name == music_name) {
      return;
    }

    let crossfade = false;
    if (current_music != null && current_music.name != music_name) {
      crossfade = true;
      fadeMusic(500);
    }

    current_music = sound_data[music_name];
    if (current_music != null) {
      current_music.name = music_name;
      current_music.loop(loop);
      current_music.volume(music_volume);
      current_music.play();

      if (crossfade) {
        for (let i = 0; i < 14; i++) {
          delay(function() {
            current_music.volume(i / 20);
          }, 50 * i);
        }
      } else {
        current_music.volume(0.6);
      }
    }
  }
}


getMusicTiming = function() {
  if (current_music != null) {
    elapsed = Math.floor(current_music.seek());
    remaining = Math.floor(current_music._duration) - elapsed;
    return [elapsed, remaining];
  } else {
    return [0, 0];
  }
}


stopMusic = function() {
  if (current_music != null) {
    current_music.stop();
    current_music = null;
  }
}


fadeMusic = function(delay_time = 0) {
  if (current_music != null) {
    old_music = current_music;
    current_music = null;
    for (let i = 0; i < 14; i++) {
      delay(function() {
        old_music.volume((13 - i) / 20);
      }, delay_time + 50 * i);
    }
    setTimeout(function() {
      // TO DO
      // DELETE OLD MUSIC
      old_music = null;
    }, 1500);
  }
}


toggleMusic = function(song = null) {
  use_music = !use_music;
  if (use_music == false) {
    stopMusic();
  } else if (song != null) {
    setMusic(song);
  }
  localStorage.setItem("use_music", use_music);
}


toggleSound = function() {
  use_sound = !use_sound;
  localStorage.setItem("use_sound", use_sound);
}


keySound = function(key, volume=1.0) {
  let click_sound = "keyboard_click_" + ((key.charCodeAt(0) % 5)+1).toString();
  soundEffect(click_sound, volume);
}