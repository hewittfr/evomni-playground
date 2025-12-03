// electron/main.js — single, non-duplicated implementation
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

const isDev = process.env.NODE_ENV === 'development' || process.env.EVOMNI_DEV === '1';
let dotnetProc = null;
let ownsApi = false; // whether this process started the mock API

// hot reload in development: restart electron when main or renderer files change
if (isDev) {
  try {
    require('electron-reload')(__dirname + '/..', {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      awaitWriteFinish: true,
      ignored: /node_modules|[\\/]\.git|\/mock-api-dotnet\//
    });
    log('INFO', 'electron-reload enabled for development');
  } catch (e) {
    log('WARN', 'electron-reload not available');
  }
}

const LOG_PATH = path.join(os.tmpdir(), 'evo-electron.log');
function log(level, msg) {
  const line = `${new Date().toISOString()} [${level}] ${msg}\n`;
  try { fs.appendFileSync(LOG_PATH, line); } catch (e) { /* ignore */ }
  if (level === 'ERROR') console.error(msg); else console.log(msg);
}

function probeUrl(url, timeout = 1000) {
  return new Promise((resolve) => {
    let done = false;
    try {
      const req = http.get(url, (res) => {
        if (done) return;
        done = true;
        const ok = res.statusCode !== undefined && res.statusCode < 400;
        req.destroy();
        resolve(ok);
      });
      req.on('error', () => { if (!done) { done = true; resolve(false); } });
      req.setTimeout(timeout, () => { if (!done) { done = true; req.destroy(); resolve(false); } });
    } catch (e) { resolve(false); }
  });
}

async function waitForHealth(url, retries = 30, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    if (await probeUrl(url, 1000)) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

async function findDevServer(retries = 12, delayMs = 300) {
  const ports = [5173, 5174, 5175, 5176, 5177, 5178];
  for (let attempt = 0; attempt < retries; attempt++) {
    for (const p of ports) {
      const url = `http://localhost:${p}`;
      if (await probeUrl(url, 400)) return url;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

async function ensureMockApi() {
  if (!isDev) return true;

  // quick dotnet check
  try {
    const info = spawnSync('dotnet', ['--info']);
    if (info.error) { log('WARN', 'dotnet not available'); return false; }
  } catch (e) {
    log('WARN', `dotnet check failed: ${String(e)}`);
    return false;
  }

  const apiHealthUrl = 'http://localhost:5005/api/health';
  const dotnetProject = path.join(__dirname, '..', 'mock-api-dotnet');

  // If API already served by another process, don't take ownership.
  if (await probeUrl(apiHealthUrl, 1000)) {
    ownsApi = false;
    return await waitForHealth(apiHealthUrl, 5, 500);
  }

  log('INFO', `Spawning mock API from ${dotnetProject}`);
  dotnetProc = spawn('dotnet', ['run', '--project', dotnetProject], { env: process.env, stdio: 'inherit' });
  ownsApi = true;

  dotnetProc.on('error', (err) => log('ERROR', `dotnet process error: ${String(err)}`));
  dotnetProc.on('exit', (code, signal) => { log('INFO', `dotnet exited code=${code} signal=${signal}`); dotnetProc = null; ownsApi = false; });

  const healthy = await waitForHealth(apiHealthUrl, 60, 1000);
  if (!healthy) {
    log('ERROR', `Mock API did not become healthy at ${apiHealthUrl}`);
    try { if (dotnetProc) dotnetProc.kill(); } catch (e) { /* ignore */ }
    dotnetProc = null; ownsApi = false;
    try { dialog.showErrorBox('Mock API failed', `API did not become healthy at ${apiHealthUrl}`); } catch (e) { /* ignore */ }
    return false;
  }

  log('INFO', 'Mock API healthy');
  return true;
}

async function createWindow() {
  const apiReady = await ensureMockApi();
  if (!apiReady && isDev) {
    log('ERROR', 'API not ready; aborting window creation in dev');
    return;
  }

  const { screen } = require('electron');
  const primary = screen.getPrimaryDisplay();
  const workArea = primary.workArea || primary.workAreaSize || { width: 1200, height: 800 };
  const width = Math.floor((workArea.width * 75) / 100);
  const height = Math.floor((workArea.height * 75) / 100);

  const mainWindow = new BrowserWindow({
    width, height, center: true, autoHideMenuBar: true, show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, 'preload.js') }
  });

  if (isDev) {
    const devUrl = await findDevServer();
    const target = devUrl ? `${devUrl}/#/` : 'http://localhost:5173/#/';
    try {
      await mainWindow.loadURL(target);
      mainWindow.show();
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } catch (err) {
      log('ERROR', `Failed to load dev UI: ${String(err)}`);
      try { dialog.showErrorBox('Failed to load dev UI', String(err)); } catch (e) { /* ignore */ }
    }
  } else {
    const indexPath = path.join(__dirname, '..', 'build', 'index.html');
    if (!fs.existsSync(indexPath)) {
      try { dialog.showErrorBox('Missing build', `Build not found at ${indexPath}`); } catch (e) { /* ignore */ }
      const errHtml = `data:text/html,<!doctype html><html><body><h2>Build not found</h2><p>Run \"npm run build\"</p></body></html>`;
      await mainWindow.loadURL(errHtml);
      mainWindow.show();
      return;
    }
    await mainWindow.loadURL(`file://${indexPath}#/`);
    mainWindow.show();
  }

  mainWindow.on('closed', () => {
    if (ownsApi && dotnetProc) {
      try { dotnetProc.kill(); } catch (e) { /* ignore */ }
      dotnetProc = null; ownsApi = false;
      log('INFO', 'Killed owned mock API on window close');
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (ownsApi && dotnetProc) {
    try { dotnetProc.kill(); } catch (e) { /* ignore */ }
    dotnetProc = null; ownsApi = false;
    log('INFO', 'Killed owned mock API on app shutdown');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
