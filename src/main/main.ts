// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';

const createWindow = (): void => {
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1600,
    height: 900,
    resizable: false, // Disable resizing
    frame: false, // Removes minimize, maximize, and close buttons (title bar)
    autoHideMenuBar: true, // Hides the menu bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  };

  const mainWindow = new BrowserWindow(windowOptions);

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.loadFile('src/renderer/frontend/index.html');
};

app.whenReady().then(() => {
  createWindow();
  Menu.setApplicationMenu(null);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
