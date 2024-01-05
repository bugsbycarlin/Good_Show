//
// preload.js is glue to allow the app's javascript environment to communicate with the
// electron wrapper's javascript environment in a sandboxed manner.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

const { ipcRenderer } = require('electron')

window.gameFullScreen = function(game_fullscreen) {
  ipcRenderer.sendSync('synchronous-message', ["fullscreen", game_fullscreen]);
}

window.gameIsFullScreen = function(game_fullscreen) {
  return ipcRenderer.sendSync('synchronous-message', ["getfullscreen"]);
}

window.fileList = function(directory_path) {
  return ipcRenderer.sendSync('synchronous-message', ["fileList", directory_path]);
}

window.writeFile = function(file_path, content) {
  return ipcRenderer.sendSync('synchronous-message', ["writeFile", file_path, content]);
}

window.checkFile = function(file_path) {
  return ipcRenderer.sendSync('synchronous-message', ["checkFile", file_path]);
}

window.readFile = function(file_path) {
  return ipcRenderer.sendSync('synchronous-message', ["readFile", file_path]);
}