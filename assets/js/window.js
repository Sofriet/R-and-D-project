const { app, BrowserWindow, electronLocalshortcut } = require("electron");
const localShortcut = require('electron-localshortcut');

const nodePath = require('path');

let win; // Top level scope within the module


/**
 * Creates the window of the application
 * 
 * @return  win  Returns the created window
 */
function create() {
    // Params of the browser window
    win = new BrowserWindow({
        width: 1000,
        height: 750,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadURL(`file://${__dirname}/../../index.html`)
    win.on('closed', () => {
        win = null
    })

    // Shortcuts
    localShortcut.register('Ctrl+F', () => {
        win.isMaximized() ? win.unmaximize() : win.maximize();
    });

    return win; // Return the instance of the window
}

/**
 * Allows main to call the create function
 */
module.exports = { create };