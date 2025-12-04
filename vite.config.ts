import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'database-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save-database' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const dbPath = path.join(__dirname, 'src', 'database', 'database.json');
                fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(error) }));
              }
            });
          } else if (req.url === '/api/save-database') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
          } else {
            next();
          }
        });
      }
    }
  ],
  base: '/evomni-playground/',
  server: {
    port: 5173,
    strictPort: false
  },
  build: {
    outDir: 'build'
  }
})
