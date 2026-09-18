const { app, BrowserWindow, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'logo.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'NeoWL',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Disable webSecurity to prevent cross-origin issues
    },
    autoHideMenuBar: true,
  });

  mainWindow.setMenu(null);

  // Intercept headers to bypass ALL iframe blocking (CSP & X-Frame-Options)
  // This is Electron's superpower that Tauri doesn't have!
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = Object.assign({}, details.responseHeaders);
    
    // Remove headers that block iframes
    const headersToRemove = ['content-security-policy', 'x-frame-options'];
    
    for (const header of Object.keys(responseHeaders)) {
      if (headersToRemove.includes(header.toLowerCase())) {
        delete responseHeaders[header];
      }
    }
    
    callback({
      cancel: false,
      responseHeaders: responseHeaders
    });
  });

  // Bypass Anti-Adblock popup detection by allowing the window but closing it instantly
  mainWindow.webContents.setWindowOpenHandler((details) => {
    return { 
      action: 'allow',
      overrideBrowserWindowOptions: {
        show: false,
        width: 0,
        height: 0
      }
    };
  });

  mainWindow.webContents.on('did-create-window', (childWindow) => {
    childWindow.close();
  });

  // Load the Vercel Production Website directly!
  mainWindow.loadURL('https://nonton-desktop.vercel.app/');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
