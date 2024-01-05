//
// This file contains the main entry point electron uses to run the game.
// It follows this format: https://www.electronjs.org/docs/tutorial/quick-start
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


// Modules to control application life and create native browser window
const { app, ipcMain, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const settings = require('electron-settings');

function createWindow () {
  // Create the browser window.
  settings.get('fullscreen.data').then(value => {

    let fullscreen = false;
    if (value != null) fullscreen = value;

    const mainWindow = new BrowserWindow({
      // width: 1664,
      // height: 982,
      // width: 1280,
      // height: 742,
      width: 1400,
      height: 800,
      fullscreen: fullscreen,
      backgroundColor: '#000000',
      resizable: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        enableRemoteModule: true,
        contextIsolation: false,
      }
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    ipcMain.on('synchronous-message', (event, arg) => {
      if (arg[0] === "fullscreen" && arg[1] === true) {
        mainWindow.setFullScreenable(true);
        mainWindow.setFullScreen(true);
        mainWindow.maximize();
        mainWindow.show();
        settings.set('fullscreen', {
            data: true
        });
        event.returnValue = 'game is full screen.'
      } else if (arg[0] === "fullscreen" && arg[1] === false) {
        mainWindow.setFullScreen(false);
        mainWindow.unmaximize();
        mainWindow.setSize(1464, 860);
        mainWindow.show();
        settings.set('fullscreen', {
            data: false
        });
        event.returnValue = 'game is windowed.'
      } else if (arg[0] === "getfullscreen") {
        event.returnValue = mainWindow.isFullScreen();
      } else if (arg[0] === "fileList") {
        event.returnValue = fs.readdirSync(arg[1])
      } else if (arg[0] === "writeFile") {
        let path = arg[1];
        let content = arg[2];
        fs.writeFile(path, content, function (err) {
          if (err) throw err;
          console.log(path + ' saved!');
        });
        event.returnValue = true;
      } else if (arg[0] === "checkFile") {
        let path = arg[1];
        event.returnValue = fs.existsSync(path);
      } else if (arg[0] === "readFile") {
        let path = arg[1];
        let contents = fs.readFileSync(path, 'utf8');
        event.returnValue = contents;
      }
    });
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  // if (process.platform !=== 'darwin') app.quit()
  app.quit();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.