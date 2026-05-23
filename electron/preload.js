// electron/preload.js – Secure bridge between the UI and the Node.js backend
// This file is crucial for App Store security compliance. It ensures the web renderer
// does not have direct access to Node.js APIs, preventing arbitrary code execution.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Gracefully shutdown the local backend server when the app is quitting
  shutdownServer: () => ipcRenderer.invoke('shutdown-server'),
  
  // Example of a secure channel for the UI to request the App version
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});

console.log("🔒 Electron Preload Script initialized. Context isolated.");
