//
// Nested Options List produces a navigable multi level menu
// from a tree of dictionary entries.
//
// NestedOptionsList extends PIXI.Container, so it's effectively a display object,
// like a sprite.
//
// To make a nested menu, make a tree where the choices are dictionary keys.
//
// eg:
//
// // "SINGLE": () => {
//   this.switchFromTitleToLobby();
// },
// "MULTI": {
//   "QUICK PLAY": () => {},
//   "CREATE GAME": () => {this.titleCreateGame("create")},
//   "JOIN GAME": () => {this.switchFromTitleToMultiSetName("multi_set_name")},
// },
// "CREDITS": () =>  {
//   this.switchFromTitleToCredits();
// },
// "QUIT": () => {
//   window.close();
// },
//
// If a dictonary value is another dictionary, it will be turned into a sub menu.
// If a dictionary value is a function, it will be called when the choice is selected.
// Provide a formatting function for making the label objects,  an escape function
// for escaping from the top level, and spacing number and selected and unselected
// color values, and you're in business.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class NestedOptionsList extends PIXI.Container {
  constructor(choice_list, format, root_escape, spacing, new_line_spacing, unselected_tint, selected_tint) {
    super();
    this.choice_list = choice_list;
    // this.choice is a chain of choices from the top to the current sub list.
    // so [0, 1] might correspond to "MULTI", "CREATE GAME".
    this.choice = [0];
    this.spacing = spacing;
    this.new_line_spacing = new_line_spacing;
    this.format = format;
    this.unselected_tint = unselected_tint;
    this.selected_tint = selected_tint;
    this.root_escape = root_escape;

    this.sub_list = null;

    this.renderList();
  }


  // Draw the correct menu/submenu
  // (Here "draw" means use the PIXI container to organize the correct
  // display objects in the correct order with the correct highlighting)
  renderList() {
    // Clear out the container
    while(this.children[0]) { 
      this.removeChild(this.children[0]);
    }

    // this.choice is a chain. Follow the chain,
    // setting the sub list to match.
    this.sub_list = Object.entries(this.choice_list);
    for (let i = 0; i < this.choice.length - 1; i++) {
      this.sub_list = Object.entries(this.sub_list[this.choice[i]][1]);
    }

    // Walk through the entries of the current sub list, tinting
    // the selected entry, and add them all to the container.
    let count = 0;
    let new_line_count = 0;
    for (const [key, value] of this.sub_list) {
      let entry = this.format(key);
      let new_lines = key.split("\n").length - 1;
      entry.position.y = count * this.spacing + new_line_count * this.new_line_spacing;
      if (count == this.choice[this.choice.length - 1]) {
        entry.tint = this.selected_tint;
      } else {
        entry.tint = this.unselected_tint;
      }

      this.addChild(entry);

      count += 1;
      new_line_count += new_lines;
    }
  }


  // Update color tinting when the choice is changed.
  updateChoice() {
    for (let i = 0; i < this.children.length; i++) {
      let entry = this.children[i];
      if (i == this.choice[this.choice.length - 1]) {
        entry.tint = this.selected_tint;
      } else {
        entry.tint = this.unselected_tint;
      }
    }
  }


  // Move up in the current sub list.
  moveUp() {
    soundEffect("switch_option");
    this.choice[this.choice.length - 1] += this.sub_list.length - 1;
    this.choice[this.choice.length - 1] = this.choice[this.choice.length - 1] % this.sub_list.length;
  
    this.updateChoice()
  }


  // Move down in the current sub list.
  moveDown() {
    soundEffect("switch_option");
    this.choice[this.choice.length - 1] += 1;
    this.choice[this.choice.length - 1] = this.choice[this.choice.length - 1] % this.sub_list.length;
  
    this.updateChoice();
  }


  // Something has been chosen!
  // If the value is another dictionary, add the selected number to the this.choice chain,
  // then update.
  // If it's a function, call that function.
  choose() {
    soundEffect("button_accept");
    let next_thing = this.sub_list[this.choice[this.choice.length - 1]][1];
    if (typeof next_thing === "function") {
      flicker(this.children[this.choice[this.choice.length - 1]], 300, this.selected_tint, this.unselected_tint);
      next_thing();
    } else if (next_thing != null) {
      this.choice.push(0);
      this.renderList();
    } else {
      flicker(this.children[this.choice[this.choice.length - 1]], 300, this.selected_tint, this.unselected_tint);
    }
  }


  // Back out to the high menu level (by simply popping the choice chain and updating),
  // or, if we're at the top level, call the escape function.
  escape() {
    if (this.choice.length > 1) {
      this.choice.pop();
      this.renderList();
    } else {
      this.root_escape();
    }
  }

  // Perform bizarre keyswapping magic to change the name of a menu entry.
  // menu_chain: an array that walks through the menu, ending on the entry
  // that needs to be changed, eg ["SETTINGS", "SOUND OFF"].
  // new_name: string that replaces the last entry of the chain, eg "SOUND ON".
  rename(menu_chain, new_name) {
    if (menu_chain == null || menu_chain.length < 1) return;

    let p = null;
    let pk = null;
    let m = this.choice_list;
    while(menu_chain.length > 1) {
      let c = menu_chain.shift();
      console.log(c);
      console.log(m);
      p = m;
      pk = c;
      m = m[c];
      console.log(m);
    }
    let old_name = menu_chain[0];
    let new_m = {};
    console.log(m);
    for (const [key, value] of Object.entries(m)) {
      if (key != old_name) {
        new_m[key] = value;
      } else {
        new_m[new_name] = value;
      }
    }
    
    if (p == null) {
      this.choice_list = new_m;
    } else {
      p[pk] = new_m;
    }

    this.renderList();
  }
}