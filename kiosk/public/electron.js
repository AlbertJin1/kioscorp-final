const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,  // Set width to 1280
        height: 800,  // Set height to 800
        minWidth: 1280,
        minHeight: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,  // Disables nodeIntegration for better security
            contextIsolation: true,  // Enables context isolation for better security
            preload: path.join(__dirname, 'preload.js')  // Load preload script for better security and to expose necessary APIs
        },
        icon: path.join(__dirname, 'kioscorp-icon.ico')
    });

    // Maximize the window and set it to fullscreen
    mainWindow.maximize();
    mainWindow.setFullScreen(true);

    // Load the server URL for both development and production
    const indexPath = 'http://192.168.254.101:3005'; // Always load from the server
    mainWindow.loadURL(indexPath);

    // Disable menu
    Menu.setApplicationMenu(null); // This disables the entire menu

    // Optionally prevent opening DevTools automatically
    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.closeDevTools();
    });
}

app.whenReady().then(() => {
    createWindow();  // Call createWindow without checking isDev, as we always use the server URL
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(); // Ensure a window is created when there are no open windows
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
