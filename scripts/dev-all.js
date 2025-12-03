#!/usr/bin/env node
const { spawn, spawnSync } = require('child_process')
const http = require('http')

function waitForUrl(url, timeout = 30000, interval = 500) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 400) return resolve(true)
        res.resume()
        if (Date.now() - start > timeout) return reject(new Error('timeout'))
        setTimeout(check, interval)
      })
      req.on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('timeout'))
        setTimeout(check, interval)
      })
      req.setTimeout(interval, () => req.destroy())
    }
    check()
  })
}

function waitForAnyUrl(urls, timeout = 30000, interval = 500) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      let pending = urls.length
      let resolved = false
      urls.forEach((u) => {
        const req = http.get(u, (res) => {
          if (!resolved && res.statusCode && res.statusCode < 400) {
            resolved = true
            resolve(u)
          }
          res.resume()
          pending -= 1
          if (!resolved && pending === 0) {
            if (Date.now() - start > timeout) return reject(new Error('timeout'))
            setTimeout(check, interval)
          }
        })
        req.on('error', () => {
          pending -= 1
          if (!resolved && pending === 0) {
            if (Date.now() - start > timeout) return reject(new Error('timeout'))
            setTimeout(check, interval)
          }
        })
        req.setTimeout(interval, () => req.destroy())
      })
    }
    check()
  })
}

async function main() {
  // quick dotnet check
  try {
    const res = spawnSync('dotnet', ['--info'])
    if (res.error) {
      console.warn('dev-all: dotnet not found in PATH; mock API will likely fail. Install .NET SDK or run API manually.')
    }
  } catch (e) {
    console.warn('dev-all: dotnet check failed', String(e))
  }

  console.log('dev-all: starting mock API (dotnet)')
  const api = spawn('dotnet', ['run', '--project', './mock-api-dotnet/MockApi.csproj'], { 
    stdio: 'inherit',
    env: { ...process.env, EVOMNI_DEV: '1' }
  })

  try {
    console.log('dev-all: waiting for API http://localhost:5005/api/health')
    await waitForUrl('http://localhost:5005/api/health')
    console.log('dev-all: API is up')
  } catch (e) {
    console.warn('dev-all: timed out waiting for API, continuing anyway')
  }

  console.log('dev-all: starting vite (frontend)')
  const vite = spawn('npm', ['run', 'react-dev'], { stdio: 'inherit', env: process.env })

  try {
    console.log('dev-all: waiting for Vite on ports 5173-5178')
    const found = await waitForAnyUrl(['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'], 30000)
    console.log('dev-all: Vite dev server found at', found)
  } catch (e) {
    console.warn('dev-all: timed out waiting for Vite dev server; Electron will still poll for it')
  }

  console.log('dev-all: starting electron')
  const electron = spawn('npx', ['electron', '.'], { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development' } })

  const cleanup = () => {
    try { api.kill() } catch (e) {}
    try { vite.kill() } catch (e) {}
    try { electron.kill() } catch (e) {}
    process.exit()
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

main().catch((e) => {
  console.error('dev-all: failed', e)
  process.exit(1)
})
