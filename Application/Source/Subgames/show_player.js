//
// This file contains the Show Player's one and only screen,
// comprising an episode selector and an audio player.
//
// Copyright 2024 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let loading_counter = 0;


class ShowPlayer extends Screen {
  // Set up the screen
  initialize(game_width, game_height) {
    this.state = null;

    this.layers = {};
    let layers = this.layers;

    layers["background"] = new PIXI.Container();
    this.addChild(layers["background"]);
    layers["episodes"] = new PIXI.Container();
    this.addChild(layers["episodes"]);
    layers["episode_buttons"] = new PIXI.Container();
    this.addChild(layers["episode_buttons"]);
    layers["player"] = new PIXI.Container();
    this.addChild(layers["player"]);

    this.config = history_of_rome_config;
    let conf = this.config;

    let background = makeSprite(conf.background_pool_path + dice(conf.background_pool_size) + ".jpg", layers["background"], conf.background_x, conf.background_y);
    background.width = conf.background_width;
    background.height = conf.background_height;
    let veneer = makeBlank(layers["background"], game_width, game_height, 0, 0);
    veneer.tint = 0xFFFFFF;
    veneer.alpha = 0.3;

    this.current_page = localStorage.getItem("player_current_page");
    if (this.current_page == null) {
      this.current_page = 0;
    } else {
      this.current_page = parseInt(this.current_page);
    }

    this.current_episode = 0;

    this.historyOfRomeSpecificSetup();

    this.updateEpisodes();

    this.back_button = makeSprite("./Art/Nav/back_button.png", layers["episode_buttons"], -10, game_height - 115);
    this.back_button.scale.set(1.5,1.2);
    this.back_button.tint = 0x0A3463;
    this.back_button.interactive = true;
    this.back_button.on("pointertap", () => {
      soundEffect("click");
      this.current_page -= 1;
      if (this.current_page < 0) this.current_page = conf.pages.length - 1;
      localStorage.setItem("player_current_page", this.current_page);
      this.updateEpisodes();
    })

    this.forward_button = makeSprite("./Art/Nav/forward_button.png", layers["episode_buttons"], game_width - 130, game_height - 115);
    this.forward_button.scale.set(1.5,1.2);
    this.forward_button.tint = 0x0A3463;
    this.forward_button.interactive = true;
    this.forward_button.on("pointertap", () => {
      soundEffect("click");
      this.current_page += 1;
      if (this.current_page >= conf.pages.length) this.current_page = 0;
      localStorage.setItem("player_current_page", this.current_page);
      this.updateEpisodes();
    })

    layers["player"].visible = false;
    this.initializePlayer();

    this.state = "selection";
  }


  // This setup is specific to the History of Rome
  historyOfRomeSpecificSetup() {
    let title_font = {fontFamily: "Times New Roman", fontSize: 96, fontWeight: 900, fill: 0xFFFFFF, letterSpacing: 2, align: "left"};
    this.title = makeText("THE HISTORY OF ROME", title_font, layers["background"], 699, 80, 0.5, 0.5);
    this.title_2 = makeText("THE HISTORY OF ROME", title_font, layers["background"], 703, 82, 0.5, 0.5);
    this.title_3 = makeText("THE HISTORY OF ROME", title_font, layers["background"], 701, 80, 0.5, 0.5);
    this.title.tint = 0xD19B2F;
    this.title_2.tint = 0x000000;
    this.title_3.tint = 0x8E001C;

    this.episode_font = {fontFamily: "Times New Roman", fontSize: 64, fontWeight: 900, fill: 0xFFFFFF, letterSpacing: 2, align: "left"};
  }


  // Make one of the audio player control buttons
  makePlayerButton(player_buttons, art_path, x, y, action) {
    let button = makeContainer(player_buttons, 0, 0);
    button.backing = makeSprite("./Art/Nav/player_button_backing.png", button,  x, y);
    button.fronting = makeSprite(art_path, button, x + 2, y + 2);
    button.fronting.tint = 0x000000;
    button.interactive = true;
    button.on("pointertap", action);
    return button
  }


  // Initialize the player UI
  initializePlayer() {
    let layers = this.layers;
    let conf = this.config;

    let player_buttons = makeContainer(layers["player"], 260, 610);
    makeSprite("./Art/Nav/player_button_panel_backing.png", player_buttons, 0, 0);


    // Time line
    this.time_line = makeBlank(layers["player"], 891, 10, 260, 550);
    this.time_line.tint = 0x000000;

    this.time_marker = makeSprite("./Art/Nav/time_marker.png", layers["player"], 260, 554, 0.5, 0.5)

    let time_font =  {fontFamily: "Bebas Neue", fontSize: 48, fontWeight: 900, fill: 0x000000, letterSpacing: 2, align: "right"};
    this.time_elapsed = makeText("00:00", time_font, layers["player"], 240, 535, 1, 0);
    this.time_remaining = makeText("00:00", time_font, layers["player"], 1165, 535, 0, 0);

    this.loading = makeSprite("./Art/Nav/loading.png", layers["player"], 700, 400, 0.5, 0.5)
    this.loading.tint = 0x000000;

    let volume_font =  {fontFamily: "Bebas Neue", fontSize: 80, fontWeight: 900, fill: 0x000000, letterSpacing: 2, align: "right"};
    this.volume_marker = makeText("60%", time_font, layers["player"], 1270, 650, 0, 0);
    this.volume_marker.visible = false;

    this.episode_title = makeText("", this.episode_font, layers["player"], 700, 225, 0.5, 0.5);
    this.episode_title.tint = 0x000000;

    //
    // Close button
    //
    this.close_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/close_button.png", 10, 10,
      () => {
        this.state = "selection";
        soundEffect("click");
        layers["episodes"].visible = true;
        layers["episode_buttons"].visible = true;
        layers["player"].visible = false;
        stopMusic();
        current_music = null;
        this.updateEpisodes();
    });

    //
    // Previous button
    //
    this.previous_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/previous_button.png", 120, 10,
      () => {
        console.log("previous");
        soundEffect("click");
        this.previousEpisode();
    });

    //
    // Skip Back button
    //
    this.skip_back_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/skip_back_button.png", 230, 10,
      () => {
        console.log("skip_back");
        soundEffect("click");
        if (current_music != null) {
          if (current_music.seek() > 15) {
            current_music.seek(current_music.seek() - 15)
          } else {
            current_music.seek(0)
          }
        }
    });

    //
    // Play Pause button
    //
    this.play_pause_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/pause_button.png", 340, 10,
      () => {
        console.log("play / pause");
        soundEffect("click");
        if (current_music.playing()) {
          current_music.pause();
          this.play_pause_button.fronting_2.visible = true;
          this.play_pause_button.fronting.visible = false;

        } else {
          current_music.play();
          this.play_pause_button.fronting_2.visible = false;
          this.play_pause_button.fronting.visible = true;
        }
    });
    this.play_pause_button.fronting_2 = makeSprite("./Art/Nav/play_button.png", this.play_pause_button, 340 + 2, 10 + 2);
    this.play_pause_button.fronting_2.tint = 0x000000;
    this.play_pause_button.fronting_2.visible = false;

    //
    // Skip forward button
    //
    this.skip_forward_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/skip_forward_button.png", 450, 10,
      () => {
        console.log("skip_forward");
        soundEffect("click");
        if (current_music != null) {
          current_music.seek(current_music.seek() + 30)
        }
    });

    //
    // Next button
    //
    this.next_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/next_button.png", 560, 10,
      () => {
        soundEffect("click");
        this.nextEpisode();
    });

    //
    // Volume up button
    //
    this.volume_up_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/volume_up_button.png", 670, 10,
      () => {
        console.log("volume_up");
        music_volume += 0.1;
        music_volume = Math.round(music_volume * 10)/10;
        if (music_volume > 1) music_volume = 1;
        current_music.volume(music_volume);
        sound_volume = music_volume;
        soundEffect("click");
        localStorage.setItem("player_music_volume", music_volume);
        localStorage.setItem("player_sound_volume", sound_volume);
        this.volume_marker.visible = true;
        console.log(music_volume);
        this.volume_marker.text = (Math.floor(100 * music_volume)) + "%";
        if(this.d) {
          window.clearTimeout(this.d.id);
          window.clearTimeout(this.d.delete_id);
        }
        this.d = delay(() => {
          this.volume_marker.visible = false;
        }, 2500);
    });

    //
    // Volume down button
    //
    this.volume_down_button = this.makePlayerButton(
      player_buttons, "./Art/Nav/volume_down_button.png", 780, 10,
      () => {
        console.log("volume_down");
        music_volume -= 0.1;
        music_volume = Math.round(music_volume * 10)/10;
        if (music_volume < 0) music_volume = 0;
        current_music.volume(music_volume);
        sound_volume = music_volume;
        soundEffect("click");
        localStorage.setItem("player_music_volume", music_volume);
        localStorage.setItem("player_sound_volume", sound_volume);
        this.volume_marker.visible = true;
        console.log(music_volume);
        this.volume_marker.text = (Math.floor(100 * music_volume)) + "%";
        if(this.d) {
          window.clearTimeout(this.d.id);
          window.clearTimeout(this.d.delete_id);
        }
        this.d = delay(() => {
          this.volume_marker.visible = false;
        }, 2500);
    });

  }


  // Update the paginated list of episodes
  updateEpisodes() {
    let layers = this.layers;
    let conf = this.config;

    while(layers["episodes"].children[0]) {
      let x = layers["episodes"].removeChild(layers["episodes"].children[0]);
    }

    let last_section_title = null;

    for (let i = 0; i < conf.pages[this.current_page].length; i++) {
      let backing = makeBlank(layers["episodes"], 1400, 72, 70, 176 + 84 * i);
      backing.tint = 0xFFFFFF;
      if (i % 2 == 0) backing.tint = 0x999999;
      backing.alpha = 0.3;
      backing.interactive = true;

      let raw_ep_text = conf.pages[this.current_page][i];
      let episode_text = this.getEpisodeText(raw_ep_text);
      let episode_text_box = makeText(episode_text, this.episode_font, layers["episodes"], 80, 180 + 84 * i, 0, 0);
      if (raw_ep_text.startsWith("t_")) {
        episode_text_box.tint = 0x0A3463;
      } else {
        episode_text_box.tint = 0x000000;
      }

      if (!raw_ep_text.startsWith("t_")) {
        backing.on("pointertap", () => { 
          stopMusic()
          let music_path = conf.content_path + raw_ep_text;
          console.log(music_path);
          loadSound(raw_ep_text, music_path);
          this.playMusic(raw_ep_text);
          this.episode_title.text = episode_text;
          this.state = "play";
          this.current_episode = i;
        

          soundEffect("click");
          layers["episodes"].visible = false;
          layers["episode_buttons"].visible = false;
          layers["player"].visible = true;
        })

        if (last_section_title != null) {
          last_section_title.on("pointertap", () => {
            backing.emit("pointertap");
          })
          last_section_title = null;
        }
      } else {
        last_section_title = backing;
      }
    }
  }


  // Get the nice episode text from the raw text
  getEpisodeText(raw_ep_text) {
    let episode_text = "";
    if (raw_ep_text.startsWith("t_")) {
      episode_text = raw_ep_text.replace("t_", "");
    } else {
      episode_text = raw_ep_text.replace("-"," -").replace(/_/g," ").replace(".mp3","");
    }
    return episode_text;
  }


  // Go to the next episode
  nextEpisode() {
    let layers = this.layers;
    let conf = this.config;

    stopMusic();
    current_music = null;
    this.current_episode += 1;
    if (this.current_episode >= conf.pages[this.current_page].length) {
      this.current_page += 1;
      this.current_episode = 0;
      if (this.current_page >= conf.pages.length) {
        this.current_page = 0;
        this.current_episode = 0;
        this.close_button.emit("pointertap");
        this.state = "selection";
        localStorage.setItem("player_current_page", this.current_page);
        return;
      }
    }
    if (conf.pages[this.current_page][this.current_episode].startsWith("t_")) {
      return this.nextEpisode();
    }

    localStorage.setItem("player_current_page", this.current_page);

    let raw_ep_text = conf.pages[this.current_page][this.current_episode];
    let music_path = conf.content_path + raw_ep_text;

    loadSound(raw_ep_text, music_path);
    this.playMusic(raw_ep_text);
    this.episode_title.text = this.getEpisodeText(raw_ep_text);
    this.state = "play";        
  }


  // Go to the previous episode
  previousEpisode() {
    let layers = this.layers;
    let conf = this.config;

    stopMusic();
    current_music = null;
    this.current_episode -= 1;
    if (this.current_episode < 0) {
      this.current_page -= 1;
      if (this.current_page < 0) {
        this.current_page = 0;
        this.current_episode = 0;
        this.state = "selection";
        this.close_button.emit("pointertap");
        localStorage.setItem("player_current_page", this.current_page);
        return;
      }
      this.current_episode = conf.pages[this.current_page].length - 1;
    }
    if (conf.pages[this.current_page][this.current_episode].startsWith("t_")) {
      return this.previousEpisode();
    }

    localStorage.setItem("player_current_page", this.current_page);

    let raw_ep_text = conf.pages[this.current_page][this.current_episode];
    let music_path = conf.content_path + raw_ep_text;

    loadSound(raw_ep_text, music_path);
    this.playMusic(raw_ep_text);
    this.episode_title.text = this.getEpisodeText(raw_ep_text);
    this.state = "play"; 
  }


  // Play the music (with an end event that moves to the next track)
  playMusic(path) {
    setMusic(path);
    current_music.on('end', () => {
      stopMusic();
      this.nextEpisode();
    });
  }


  // Handle keys
  keyDown(ev) {
    let layers = this.layers;
    let conf = this.config;

    let key = ev.key;
    console.log(key);

    if (this.state == "selection"){
      if (key === "ArrowLeft" || key === "1") {
        this.back_button.emit("pointertap");
      }

      if (key === "ArrowRight" || key === "3") {
        this.forward_button.emit("pointertap");
      }
    }

    if (this.state == "play") {
      if (key === " " || key === "0") {
        this.play_pause_button.emit("pointertap");
      }

      if (key === "ArrowLeft" || key === "4") {
        this.skip_back_button.emit("pointertap");
      }

      if (key === "ArrowRight" || key === "6") {
        this.skip_forward_button.emit("pointertap");
      }

      if (key === "1") {
        this.previous_button.emit("pointertap");
      }

      if (key === "3") {
        this.next_button.emit("pointertap");
      }

      if (key === "ArrowUp" || key === "5") {
        this.volume_up_button.emit("pointertap");
      }

      if (key === "ArrowDown" || key === "2") {
        this.volume_down_button.emit("pointertap");
      }

      if (key === "Escape" || key === ".") {
        this.close_button.emit("pointertap");
      }
    }
  }


  // Regular update method for time markers, loading glyph, etc
  update(diff) {
    let fractional = diff / (1000/30.0);

    if (this.state == "play") {
      let [elapsed, remaining] = getMusicTiming()

      if (elapsed != 0 || remaining != 0) {
        this.loading.visible = false;
        this.loading.angle = 0;

        this.time_marker.x = 260 + 891 * (elapsed / (elapsed+remaining))

        let seconds = elapsed % 60
        let minutes = Math.floor((elapsed - seconds)/60) % 60
        let hours = Math.floor((elapsed - 60 * minutes - seconds)/3600)
        this.time_elapsed.text = String(minutes).padStart(2,"0")
          + ":" + String(seconds).padStart(2,"0")
        if (hours > 0) this.time_elapsed.text = String(hours) + ":" + this.time_elapsed.text

        seconds = remaining % 60
        minutes = Math.floor((remaining - seconds)/60) % 60
        hours = Math.floor((remaining - 60 * minutes - seconds)/3600)
        this.time_remaining.text = String(minutes).padStart(2,"0")
          + ":" + String(seconds).padStart(2,"0")
        if (hours > 0) this.time_remaining.text = String(hours) + ":" + this.time_remaining.text
      } else {
        this.loading.visible = true;
        this.loading.angle += 10;
        this.time_elapsed.text = "00:00";
        this.time_remaining.text = "00:00";
      }
    }
  }
}

