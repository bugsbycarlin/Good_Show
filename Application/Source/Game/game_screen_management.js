//
// The following Game class methods manage different screens;
// here a screen could mean a whole game mode, a cutscene,
// the title screen, lobby screen, etc.
//
// There's a method to initialize, and methods to handle
// several different types of transitions.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//



class Screen extends PIXI.Container {
  constructor(...extra_params) {
    super();
    this.initialize(...extra_params);
  }


  destroy() {
    while(this.children[0]) {
      let x = this.removeChild(this.children[0]);
      x.destroy();
    }
    super.destroy();
  }

  update() {
  }

  initialize(extra_param) {
  }
}


Game.prototype.createScreen = function(screen_name, extra_param = null, reset = false) {
  if (screen_name == "show_player") {
    this.screens["show_player"] = new ShowPlayer(this.width, this.height);
  }

  console.log(screen_name);
  this.screens[screen_name].position.x = 0;
  pixi.stage.addChild(this.screens[screen_name]);
  pixi.stage.addChild(this.black);
}


// Set up effects screens, then create and start with the first screen (defined in game.js).
Game.prototype.initializeScreens = function() {
  this.screens = [];

  this.black = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.black.width = this.width;
  this.black.height = this.height;
  this.black.tint = 0x000000;
  this.black.visible = false;

  this.createScreen(first_screen);
  this.current_screen = first_screen;
}


// Slide the old screen off to the side, and slide the new one into place.
Game.prototype.switchScreens = function(old_screen, new_screen) {
  var direction = -1;
  if (new_screen == "title") direction = 1;
  this.screens[new_screen].position.x = direction * -1 * this.width;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.screens[i].destroy();
    }
  }
  var tween_1 = new TWEEN.Tween(this.screens[old_screen].position)
    .to({x: direction * (this.width + 200)})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(() => {this.screens[old_screen].destroy();})
    .start();
  var tween_2 = new TWEEN.Tween(this.screens[new_screen].position)
    .to({x: 0})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
  this.current_screen = new_screen;
}


// Fade the old screen to the new screen. If it's a double fade,
// fade to black then fade in. Otherwise, it's a direct fade from one to the other.
Game.prototype.fadeScreens = function(old_screen, new_screen, double_fade = false, fade_time = 1000) {
  if (this.screens[old_screen] != null) pixi.stage.removeChild(this.screens[old_screen]);
  if (this.screens[new_screen] != null) pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  if (double_fade) {  
    pixi.stage.addChild(this.black);
    this.black.alpha = 1;
    this.black.visible = true;
  }
  pixi.stage.addChild(this.screens[old_screen]);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.screens[i].destroy();
    }
  }

  this.screens[old_screen].alpha = 1
  this.screens[new_screen].alpha = 1

  var tween = new TWEEN.Tween(this.screens[old_screen])
    .to({alpha: 0})
    .duration(fade_time)
    // .easing(TWEEN.Easing.Linear)
    .onComplete(() => {
      if (!double_fade) {
        if (old_screen != new_screen) this.screens[old_screen].destroy();
        this.current_screen = new_screen;
      } else {
        var tween2 = new TWEEN.Tween(this.black)
        .to({alpha: 0})
        .duration(fade_time)
        .onComplete(() => {
          if (old_screen != new_screen) this.screens[old_screen].destroy();
          this.current_screen = new_screen;
          pixi.stage.removeChild(this.black);
        })
        .start();
      }
    })
    .start();
}


Game.prototype.fadeToBlack = function(fade_time=1500) {
  pixi.stage.addChild(this.black);
  this.black.alpha = 0.01;

  var tween = new TWEEN.Tween(this.black)
    .to({alpha: 1})
    .duration(fade_time)
    .start();
}


// Fade in from the black screen.
Game.prototype.fadeFromBlack = function(fade_time=1500) {
  pixi.stage.addChild(this.black);
  this.black.visible = true;
  this.black.alpha = 1;

  var tween = new TWEEN.Tween(this.black)
    .to({alpha: 0})
    .duration(fade_time)
    .onComplete(() => {
      pixi.stage.removeChild(this.black);
    })
    .start();
}


// Instantly pop from one screen to the other.
Game.prototype.popScreens = function(old_screen, new_screen) {
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[old_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  pixi.stage.addChild(this.black);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.screens[i].destroy();
    }
  }
  this.screens[old_screen].destroy();
  this.current_screen = new_screen;
}


clearScreen = function(screen) {
  while(screen.children[0]) {
    let x = screen.removeChild(screen.children[0]);
    x.destroy();
  }
}




