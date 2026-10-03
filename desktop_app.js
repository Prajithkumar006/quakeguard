/* ==========================================================================
   QuakeGuard - Electron Native Desktop Application Entry Point
   ========================================================================== */

const { app, BrowserWindow, Menu, Notification } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 900,
    minHeight: 650,
    title: "QuakeGuard AI - Disaster Response & Earthquake Platform",
    icon: path.join(__dirname, 'assets/logo.jpg'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  Menu.setApplicationMenu(null); // Clean window without browser bar

  // Show desktop notification on launch
  if (Notification.isSupported()) {
    new Notification({
      title: 'QuakeGuard AI Desktop App',
      body: 'Seismic Monitoring & Emergency Response System Active.'
    }).show();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
