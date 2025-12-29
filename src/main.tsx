import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeStorage } from './services/localStorageService'

// Initialize localStorage with data from database.json on first load
initializeStorage().then(() => {
  const container = document.getElementById('root')!
  const root = createRoot(container)
  root.render(<App />)
})

