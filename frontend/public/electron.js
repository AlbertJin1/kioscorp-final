const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1366,
        minHeight: 768,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,  // Disables nodeIntegration for better security
            contextIsolation: true,  // Enables context isolation for better security
            preload: path.join(__dirname, 'preload.js')  // Load preload script for better security and to expose necessary APIs
        },
        icon: path.join(__dirname, 'kioscorp-icon.ico')
    });

    // Maximize the window
    mainWindow.maximize();

    // Load the server URL for both development and production
    const indexPath = 'http://localhost:3010'; // Always load from the server
    mainWindow.loadURL(indexPath);

    // Add a menu with an About option but without DevTools toggle and View menu
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: 'info',
                            title: 'About This Application',
                            message: 'KiosCorp POS System',
                            detail: 'This application is a capstone project developed by KiosCorp.\n\n© 2024 KiosCorp. All rights reserved.',
                            buttons: ['OK'],
                            icon: path.join(__dirname, 'kioscorp-icon.ico')
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

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
