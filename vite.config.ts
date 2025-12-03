import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/evomni-playground/',
  server: {
    port: 5173,
    strictPort: false
  },
  build: {
    outDir: 'build'
  }
})
