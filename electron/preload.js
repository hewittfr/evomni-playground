const { contextBridge } = require('electron')

// Minimal safe preload so BrowserWindow can load it without crashing
contextBridge.exposeInMainWorld('evomni', {
  platform: process.platform,
  env: process.env.NODE_ENV || 'development'
})
