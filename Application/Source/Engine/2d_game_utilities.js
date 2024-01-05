//
// This file contains utilities to make common 2d game elements, like sprites,
// text labels, visual effects, etc.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


let freefalling = [];
let gravity = 3.8;
let gentle_drop = 0.05;
let gentle_limit = 6;
freeeeeFreeeeeFalling = function(fractional) {
  for (let i = 0; i < freefalling.length; i++) {
    let item = freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    if (item.type != "ember") {
      if (item.personal_gravity == null) {
        item.vy += gravity * fractional;
      } else {
        item.vy += item.personal_gravity * fractional;
      }
    } else {
      item.alpha *= 0.97;
      item.vy += gentle_drop * fractional;
      if (item.vy > gentle_limit) item.vy = gentle_limit;
    }

    // TODO: this needs to be 200 for the player areas and 960 for the screen in total.
    if (item.position.y > 960 || item.alpha < 0.04) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  let new_freefalling = [];
  for (let i = 0; i < freefalling.length; i++) {
    let item = freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  freefalling = new_freefalling;
}


let shakers = [];
shakeDamage = function() {
  for (let item of shakers) {
    if (item != null && item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      if (timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
        item.permanent_x = null;
        item.permanent_y = null;
      }
    }
  }
}


// This function makes a container which holds a bunch of other
// sprites and containers. If you move this container, or change
// its size, everything inside it will move or change size.
function makeContainer(parent, x, y) {
  let c = new PIXI.Container();
  c.position.set(x, y);
  parent.addChild(c);
  return c;
}


function makeSprite(path, parent, x, y, anchor_x=0, anchor_y=0, pixel_hard_scale=true) {
  let new_sprite = new PIXI.Sprite(PIXI.Texture.from(path));
  if (pixel_hard_scale) new_sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  new_sprite.position.set(x, y);
  new_sprite.anchor.set(anchor_x, anchor_y);
  if (parent != null) {
    parent.addChild(new_sprite);
    new_sprite.parent = parent;
  }
  return new_sprite;
}


function makeAnimatedSprite(path, animation, parent, x, y, anchor_x=0, anchor_y=0, pixel_hard_scale=true) {
  let sheet = PIXI.Loader.shared.resources[path].spritesheet;
  if (animation == null) animation = Object.keys(sheet.animations)[0];
  let new_sprite = new PIXI.AnimatedSprite(sheet.animations[animation]);
  if (pixel_hard_scale) new_sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  new_sprite.position.set(x, y);
  new_sprite.anchor.set(anchor_x, anchor_y);
  if (parent != null) {
    parent.addChild(new_sprite);
    new_sprite.parent = parent;
  }
  return new_sprite;
}


function makeText(text, font, parent, x, y, anchor_x=0, anchor_y=0) {
  let new_text = new PIXI.Text(text, font);
  new_text.anchor.set(anchor_x, anchor_y);
  new_text.position.set(x, y);
  new_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  if (parent != null) {
    parent.addChild(new_text);
    new_text.parent = parent;
  }
  return new_text;
}


function makeBlank(parent, width, height, x, y, color=0xFFFFFF, anchor_x=0, anchor_y=0) {
  let blank = PIXI.Sprite.from(PIXI.Texture.WHITE);
  blank.x = x;
  blank.y = y;
  blank.width = width;
  blank.height = height;
  blank.anchor.set(anchor_x, anchor_y);
  blank.tint = color;
  if (parent != null) {
    parent.addChild(blank);
    blank.parent = parent;
  }
  return blank;
}


// Make a text element that starts empty and types out its message
// using an update function.
function makeTypewriterText(text, font, parent, x, y, anchor_x=0, anchor_y=0, wrap_width=0) {
  let t_text = makeText("", font, parent, x, y, anchor_x=0, anchor_y=0);
  
  t_text.partial_value = 0;
  t_text.final_text = text;
  t_text.wrap_width = wrap_width;

  // Update function types out another letter each time it's called,
  // until all the letters have been typed.
  t_text.updatePartial = function() {
    this.partial_value += 0.35;
    if (this.partial_value > this.final_text.length + 1) {
      this.partial_value = this.final_text.length + 1;
    } else {
      this.text = this.final_text.slice(0, Math.floor(this.partial_value));
    }
  }

  // Set function clears the existing text and sets a new string value.
  t_text.setPartial = function(new_str) {

    // If there's a positive wrap width, rebuild the text string to include line breaks.
    if (t_text.wrap_width > 0) {
      // Width of a single character. Note that this only works when the font is monospaced.
      let c_width = PIXI.TextMetrics.measureText('A', t_text.style).width;

      let lines = new_str.split("\n");
      new_str = "";
      for (let k = 0; k < lines.length; k++) {
        let words = lines[k].split(" ");
        console.log(words);
        let line_str = "";
        line_length = 0;
        for (let i = 0; i < words.length; i++) {
          if (line_length + c_width * words[i].length <= t_text.wrap_width) {
            line_str += words[i] + " ";
            line_length += c_width * (words[i].length + 1);
          } else {
            line_str += "\n"
            line_length = c_width * (words[i].length + 1);
            line_str += words[i] + " ";
          }
        }
        new_str += line_str + "\n";
      }
    }

    this.partial_value = 0;
    this.final_text = new_str;
    t_text.text = "";
  }

  t_text.setPartial(text);

  return t_text;
}


function makeRocketTile2(parent, letter, score_value, base, target_base, player) {
  let rocket_tile = new PIXI.Container();
  parent.addChild(rocket_tile);

  rocket_tile.velocity = 0;
  rocket_tile.scale.set(0.5, 0.55);
  rocket_tile.rotation = Math.atan2(target_base.y - base.y, target_base.x - base.x) + Math.PI / 2;
  rocket_tile.position.set(base.x + 16 * Math.cos(rocket_tile.rotation - Math.PI / 2), base.y + 16 * Math.sin(rocket_tile.rotation - Math.PI / 2));

  let fire_sprite = makeFire(rocket_tile, 0, 34, 0.32, 0.24);
  fire_sprite.original_x = fire_sprite.x;
  fire_sprite.original_y = fire_sprite.y;
  fire_sprite.visible = false;

  let rocket_file = "rocket_american";
  if (player == 1) rocket_file = "rocket_soviet";
  var rocket_proper = new PIXI.Sprite(PIXI.Texture.from("Art/" + rocket_file + ".png"));
  rocket_proper.anchor.set(0.5, 0.5);
  rocket_tile.addChild(rocket_proper);

  var tile = makePixelatedLetterTile(rocket_tile, letter, "white");
  tile.tint = 0x38351e;
  tile.scale.set(1.1,1);

  rocket_tile.fire_sprite = fire_sprite;
  rocket_tile.start_time = markTime() - Math.floor(Math.random() * 300);
  rocket_tile.parent = parent;
  rocket_tile.value_text = tile.value_text;

  rocket_tile.status = "active";

  rocket_tile.player = player;
  rocket_tile.letter = letter;

  rocket_tile.score_value = score_value;

  return rocket_tile;
}


function makeFire(parent, x, y, xScale, yScale) {
  let fire_sprite = makeAnimatedSprite("Art/fire.json", "fire", parent, x, y, 0.5, 0.5);
  fire_sprite.animationSpeed = 0.35; 
  fire_sprite.scale.set(xScale, yScale);
  fire_sprite.play();
  return fire_sprite;
}


function makeParachute(parent, x, y, xScale, yScale) {
  let parachute_sprite = makeSprite("Art/parachute.png", parent, x, y, 0.5, 0.5);
  parachute_sprite.scale.set(xScale, yScale);
  return parachute_sprite;
}


function makeBomb(parent, x, y, xScale, yScale) {
  let bomb_sprite = makeSprite("Art/bomb.png", parent, x, y, 0.5, 0.5);
  bomb_sprite.scale.set(xScale, yScale);
  bomb_sprite.angle = 10;
  return bomb_sprite;
}


function makeExplosion(parent, x, y, xScale, yScale, action) {
  let explosion_sprite = makeAnimatedSprite("Art/explosion.json", "explosion", parent, x, y, 0.5, 0.5);
  explosion_sprite.animationSpeed = 0.5; 
  explosion_sprite.scale.set(xScale, yScale);
  explosion_sprite.loop = false;
  explosion_sprite.play();
  explosion_sprite.onComplete = function() {
    action();
  }
  return explosion_sprite;
}


function makeElectric(parent, x, y, xScale, yScale) {
  let electric_sprite = makeAnimatedSprite("Art/electric.json", "electric", parent, x, y, 0.5, 0.5);
  electric_sprite.angle = Math.random() * 360;
  electric_sprite.animationSpeed = 0.4; 
  electric_sprite.scale.set(xScale, yScale);
  electric_sprite.play();
  electric_sprite.onLoop = function() {
    this.angle = Math.random() * 360;
  }
  return electric_sprite;
}


function makeSmoke(parent, x, y, xScale, yScale) {
  let smoke_sprite = makeAnimatedSprite("Art/smoke.json", "smoke", parent, x, y, 0.5, 0.5);
  smoke_sprite.animationSpeed = 0.4; 
  smoke_sprite.scale.set(xScale, yScale);
  smoke_sprite.loop = false;
  smoke_sprite.onComplete = function() {
    parent.removeChild(smoke_sprite);
  }
  smoke_sprite.play();
  return smoke_sprite;
}


function makeFireworks(parent, color, x, y, xScale, yScale) {
  let fireworks_sprite = makeAnimatedSprite("Art/fireworks_" + color + ".json", "fireworks", parent, x, y, 0.5, 0.5);
  fireworks_sprite.animationSpeed = 0.4; 
  fireworks_sprite.scale.set(xScale, yScale);
  fireworks_sprite.loop = false;
  fireworks_sprite.onComplete = function() {
    parent.removeChild(fireworks_sprite);
  }
  fireworks_sprite.play();
  return fireworks_sprite;
}


function makePop(parent, x, y, xScale, yScale) {
  let pop_sprite = makeAnimatedSprite("Art/pop.json", "pop", parent, x, y, 0.5, 0.5);
  pop_sprite.animationSpeed = 0.4;
  pop_sprite.scale.set(xScale, yScale);
  pop_sprite.loop = false;
  pop_sprite.onComplete = function() {
    parent.removeChild(pop_sprite);
  }
  pop_sprite.play();
  return pop_sprite;
}


function makePixelatedLetterTile(parent, text, color) {
  return makeSprite("Art/PixelatedKeys/pixelated_" + color + "_" + text + ".png", parent, 0, 0, 0.5, 0.5);
}


function makeLetterBuilding(parent, x, y, letter, team) {
  let letter_building = new PIXI.Container();
  parent.addChild(letter_building);
  letter_building.position.set(x, y);

  letter_building.text = letter;

  let team_name = "american";
  if (team == 1 || team == 3) team_name = "soviet";
  let building_sprite = makeSprite("Art/" + team_name + "_building_draft_2.png", letter_building, 0, 0, 0.5, 0.5);  

  let letter_image = makePixelatedLetterTile(letter_building, letter, "white");
  letter_image.anchor.set(0.5, 0.5);
  letter_image.position.set(0, -6);
  if (team == 1 || team == 3) { 
    letter_image.tint = 0x000000;
  }

  return letter_building;
}


function makeRocketWithScaffolding(parent, x, y) {
  let container = new PIXI.Container();
  parent.addChild(container);
  container.position.set(x, y);

  container.scaffolding = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_scaffolding.png"));
  container.scaffolding.anchor.set(0.5, 0.5);
  container.scaffolding.position.set(0,-8);
  container.addChild(container.scaffolding);

  container.rocket = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_neutral.png"));
  container.rocket.anchor.set(0.5, 0.5);
  container.addChild(container.rocket);

  return container;
}


function comicBubble(parent, text, x, y, size=36, font_family="Bangers") {
  let comic_container = new PIXI.Container();
  comic_container.position.set(x, y);
  parent.addChild(comic_container);

  let comic_text = new PIXI.Text(" " + text + " ", {fontFamily: font_family, fontSize: size, fill: 0x000000, letterSpacing: 6, align: "center"});
  comic_text.anchor.set(0.5,0.53);

  let black_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
  black_fill.width = comic_text.width + 16;
  black_fill.height = comic_text.height + 16;
  black_fill.anchor.set(0.5, 0.5);
  black_fill.tint = 0x000000;
  
  let white_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
  white_fill.width = comic_text.width + 10;
  white_fill.height = comic_text.height + 10;
  white_fill.anchor.set(0.5, 0.5);
  white_fill.tint = 0xFFFFFF;

  comic_container.addChild(black_fill); 
  comic_container.addChild(white_fill);
  comic_container.addChild(comic_text);

  comic_container.is_comic_bubble = true;

  comic_container.cacheAsBitmap = true;

  return comic_container;
}


function addOpponentPicture(parent, opponent_name, x, y) {
  let opponent_image = null;
  if(opponent_name != null) {
    let name = "";
    if (opponent_name == "zh") {
      name = "zhukov";
    } else if (opponent_name == "an") {
      name = "andy";
    } else if (opponent_name == "iv") {
      name = "ivan";
    } else if (opponent_name == "ro") {
      name = "rogov";
    } else if (opponent_name == "fe") {
      name = "fedor";
    } else if (opponent_name == "pu") {
      name = "putin";
    }
    opponent_image = makeSprite("Art/Opponents/" + name + ".png", parent, x, y, 0.5, 0.5);
    opponent_image.alpha = 0.7;
  } else {
    opponent_image = new PIXI.Container();
    parent.addChild(opponent_image);
  }
  return opponent_image;
}


// THIS IS NOT DEFUNCT, I WILL USE IT
swearing = function(parent, x, y) {
  let word = "";
  for (let i = 0; i < 5; i++) {
    let num = Math.floor(Math.random() * 5);
    word += "#$%&*".slice(num, num+1);
  }
  word += "!";
  let bub = comicBubble(parent, word, x - 150 + 300 * Math.random(), y - 50 + 100 * Math.random(), 24);
  delay(() => {
    parent.removeChild(bub);
  }, 500 + Math.random(500));
  if (shakers != null) shakers.push(bub);
  bub.shake = markTime();
  // shake parent? allow extra param to shake as well? yeah.
}




//
//
// Keyboard UI tools
//
//


makeKeyboard = function(options) {
  let parent = options.parent;
  let x = options.x == null ? 0 : options.x;
  let y = options.y == null ? 0 : options.y;
  let defense = options.defense == null ? [] : options.defense;
  let action = options.action == null ? function(){} : options.action;
  let player = options.player;

  let keyboard = new PIXI.Container();
  parent.addChild(keyboard);
  keyboard.position.set(x, y);
  keyboard.scale.set(0.625, 0.625);
  keyboard.letters = {};
  keyboard.keys = {};
  keyboard.error = 0;

  let keys = [];
  // if (this.keyboard_mode == "QWERTY") {
  keys[0] = ["Escape_1_esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_1_minus", "=_1_equals", "Backspace_2_backspace"];
  keys[1] = ["Tab_1.5_tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[_1_leftbracket", "]_1_rightbracket", "\\_1.5_backslash"];
  keys[2] = ["CapsLock_2_capslock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";_1_semicolon", "'_1_quote", "Enter_2_enter"];
  keys[3] = ["LShift_2.5_shift", "Z", "X", "C", "V", "B", "N", "M", ",_1_comma", "._1_period", "/_1_forwardslash", "RShift_2.5_shift"];
  keys[4] = ["Control_1.5_ctrl", "Alt_1_alt", "Meta_1.5_cmd", " _6_spacebar", "Fn_1_fn", "ArrowLeft_1_left", "ArrowUp_1_up", "ArrowDown_1_down", "ArrowRight_1_right"];
  // } else if (this.keyboard_mode == "DVORAK") {
  //   keys[0] = ["Escape_1_esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[_1_leftbracket", "]_1_rightbracket", "Backspace_2_backspace"];
  //   keys[1] = ["Tab_1.5_tab", "'_1_quote", ",_1_comma", "._1_period", "P", "Y", "F", "G", "C", "R", "L", "/_1_forwardslash", "=_1_equals", "\\_1.5_backslash"];
  //   keys[2] = ["CapsLock_2_capslock", "A", "O", "E", "U", "I", "D", "H", "T", "N", "S", "-_1_minus", "Enter_2_enter"];
  //   keys[3] = ["LShift_2.5_shift", ";_1_semicolon", "Q", "J", "K", "X", "B", "M", "W", "V", "Z", "RShift_2.5_shift"];
  //   keys[4] = ["Control_1.5_ctrl", "Alt_1_alt", "Meta_1.5_cmd", " _6_spacebar", "Fn_1_fn", "ArrowLeft_1_left", "ArrowUp_1_up", "ArrowDown_1_down", "ArrowRight_1_right"];
  // }

  let background = new PIXI.Sprite(PIXI.Texture.from("Art/Keyboard/keyboard_background.png"));
  background.anchor.set(0.5, 0.5);
  keyboard.addChild(background);
  keyboard.background = background;

  for (var h = 0; h < keys.length; h++) {
    var k_x = -610 + 10;
    var k_y = -230 + 50 + 82 * h;
    for (var i = 0; i < keys[h].length; i++) {
      let info = keys[h][i];
      
      let letter = info;
      let size = 1;
      let filename = "key_" + letter;
      if (info.includes("_")) {
        let s = info.split("_");
        letter = s[0];
        size = parseFloat(s[1]);
        filename = "key_" + s[2];
      }

      if (defense.includes(letter)) filename = "blue_" + filename;

      let button = makeKey(
        keyboard,
        k_x + size * 40, k_y, filename, size, () => { 
          if (player == 1) {
            pressKey(keyboard, letter);
            action(letter);
          }
        },
      );

      k_x += 80 * size;

      keyboard.keys[letter] = button;
      if (letter_array.includes(letter)) {
        keyboard.keys[letter.toLowerCase()] = button;
        keyboard.letters[letter] = button;
      }
    }
  }

  keyboard.setBombs = function (number){
    console.log("Setting " + number + " bombs");
    let spacekey = this.keys[" "];

    if(spacekey.bombs != null) {
      for (let i = 0; i < spacekey.bombs.length; i++) {
        let bomb = spacekey.bombs[i];
        let x = spacekey.removeChild(bomb);
        x.destroy();
      }
    }
    spacekey.bombs = [];
    for (let i = 0; i < number; i++) {
      let bomb = self.makeBomb(spacekey, 54 * i - 27 * (number - 1), 0, 0.8, 0.8);
      bomb.alpha = 0.6;
      spacekey.bombs.push(bomb);
    }
  }

  return keyboard;
}


pressKey = function(palette, key) {
  if (key in palette.keys) {
    let keyboard_key = palette.keys[key];
    let click_sound = "keyboard_click_" + ((key.charCodeAt(0) % 5)+1).toString();
    soundEffect(click_sound, 1.0);
    if (keyboard_key.key_pressed != true) {
      keyboard_key.key_pressed = true;
      // let old_y = keyboard_key.position.y;
      keyboard_key.position.y += 3;
      let old_tint = keyboard_key.tint;
      keyboard_key.tint = 0xDDDDDD;
      setTimeout(function() {
        keyboard_key.key_pressed = false;
        keyboard_key.position.y -= 3;
        keyboard_key.tint = old_tint;
      }, 50);
    }
  }
}


makeKey = function(parent, x, y, filename, size, action) {
  var key_button = new PIXI.Container();
  parent.addChild(key_button);
  var key_sprite = makeSprite("Art/Keyboard/" + filename + ".png", key_button, x, y, 0.5, 0.5, false);

  key_button.playable = true;
  key_button.interactive = true;
  key_button.buttonMode = true;
  key_button.on("pointerdown", action);

  key_button.action = action;

  key_button.disable = function() {
    this.interactive = false;
    this.disable_time = markTime();
  }

  key_button.enable = function() {
    this.interactive = true;
  }

  return key_button;
}




//
//
// Defunct tools, for now
//
//


// Game.prototype.updateEnemyScreenTexture = function() {
//   var self = this;
//   var screen = this.screens[this.current_screen];

//   let texture = PIXI.RenderTexture.create({width: 800, height: 600});

//   this.renderer.render(this.player_area, texture);

//   if (this.enemy_area.sprite == null) {
//     let sprite = PIXI.Sprite.from(texture);
//     sprite.position.set(-240,-520);
//     sprite.anchor.set(0, 0);
//     this.enemy_area.removeChild[0];
//     this.enemy_area.addChild(sprite);
//     this.enemy_area.sprite = sprite;
//   } else {
//     this.enemy_area.sprite.texture = texture;
//   }
// }



// Game.prototype.initializeAlertBox = function() {
//   this.alertBox.position.set(this.width / 2, this.height / 2);
//   this.alertBox.visible = false;

//   this.alertMask.position.set(this.width / 2, this.height / 2);
//   this.alertMask.visible = false;
//   this.alertMask.interactive = true;
//   this.alertMask.buttonMode = true;
//   this.alertMask.on("pointertap", function() {
//   });


//   var mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   mask.width = this.width;
//   mask.height = this.height;
//   mask.anchor.set(0.5, 0.5);
//   mask.alpha = 0.2;
//   mask.tint = 0x000000;
//   this.alertMask.addChild(mask);

//   var outline = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   outline.width = 850;
//   outline.height = 230;
//   outline.anchor.set(0.5, 0.5);
//   outline.position.set(-1, -1);
//   outline.tint = 0xDDDDDD;
//   this.alertBox.addChild(outline);
//   this.alertBox.outline = outline;

//   var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   backingGrey.width = 850;
//   backingGrey.height = 230;
//   backingGrey.anchor.set(0.5, 0.5);
//   backingGrey.position.set(4, 4);
//   backingGrey.tint = PIXI.utils.rgb2hex([0.8, 0.8, 0.8]);
//   this.alertBox.addChild(backingGrey);
//   this.alertBox.backingGrey = backingGrey;

//   var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   backingWhite.width = 850;
//   backingWhite.height = 230;
//   backingWhite.anchor.set(0.5, 0.5);
//   backingWhite.position.set(0,0);
//   backingWhite.tint = 0xFFFFFF;
//   this.alertBox.addChild(backingWhite);
//   this.alertBox.backingWhite = backingWhite;

//   this.alertBox.alertText = new PIXI.Text("EH. OKAY.", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.alertBox.alertText.anchor.set(0.5,0.5);
//   this.alertBox.alertText.position.set(0, 0);
//   this.alertBox.addChild(this.alertBox.alertText);

//   this.alertBox.interactive = true;
//   this.alertBox.buttonMode = true;
// }



// Game.prototype.showAlert = function(text, action) {
//   var self = this;
//   pixi.stage.addChild(this.alertMask);
//   pixi.stage.addChild(this.alertBox);
//   this.alert_last_screen = this.current_screen;
//   this.current_screen = "alert";
//   this.alertBox.alertText.text = text;

//   let measure = new PIXI.TextMetrics.measureText(text, this.alertBox.alertText.style);
//   this.alertBox.backingWhite.width = measure.width + 80;
//   this.alertBox.backingGrey.width = measure.width + 80;
//   this.alertBox.outline.width = measure.width + 80;
//   this.alertBox.backingWhite.height = measure.height + 80;
//   this.alertBox.backingGrey.height = measure.height + 80;
//   this.alertBox.outline.height = measure.height + 80;

//   this.alertBox.removeAllListeners();
//   this.alertBox.on("pointertap", function() {
//     action();
//     self.alertBox.visible = false
//     self.alertMask.visible = false
//     self.current_screen = self.alert_last_screen
//   });
//   this.alertBox.visible = true;
//   this.alertMask.visible = true;
//   new TWEEN.Tween(this.alertBox)
//     .to({rotation: Math.PI / 60.0})
//     .duration(70)
//     .yoyo(true)
//     .repeat(3)
//     .start()
// }



