// electron/main.js – HermSchrod Box: Electron Main Process
// Launches the UI, boots the backend, and handles app lifecycle.

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;

// ---------------------------------------------------
// Start the local Express server (the ferocious beast backend)
// ---------------------------------------------------
function startBackend() {
  const serverPath = path.join(__dirname, '..', 'server', 'index.js');
  serverProcess = spawn('node', [serverPath], {
    cwd: path.join(__dirname, '..', 'server'),
    stdio: 'inherit',
    shell: false,
  });

  serverProcess.on('error', err => {
    console.error('🔥 Failed to start backend:', err);
  });

  serverProcess.on('exit', code => {
    console.log(`Backend exited with code ${code}`);
    serverProcess = null;
  });
}

// ---------------------------------------------------
// Stop the backend when the app quits
// ---------------------------------------------------
function stopBackend() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// ---------------------------------------------------
// Create the main window
// ---------------------------------------------------
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a14',
    title: 'HermSchrod Box – Neuropsych Dashboard',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // Uncomment for development:
  // win.webContents.openDevTools();
}

// ---------------------------------------------------
// App lifecycle
// ---------------------------------------------------
app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// ---------------------------------------------------
// IPC Handlers
// ---------------------------------------------------
ipcMain.handle('shutdown-server', async () => {
  stopBackend();
  return true;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
