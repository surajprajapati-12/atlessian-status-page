import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let wss;
let broadcastUpdate;

async function createServer() {
  const app = express();
  
  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: process.cwd(),
  });
  
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);
  
  // Handle all routes - Simple client-side rendering for development
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    try {
      // Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );
      
      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);
      
      // Simple client-side rendering for development
      const html = template.replace('<!--ssr-outlet-->', '<div id="root"></div>');
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      console.error('Template Error:', e);
      res.status(500).end('Internal Server Error');
    }
  });
  
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || 'localhost';
  
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📊 Environment: development (Client-side rendering)`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  wss = new WebSocketServer({ server });
  broadcastUpdate = (data) => {
    wss.clients.forEach(client => {
      if (client.readyState === 1) client.send(JSON.stringify(data));
    });
  };
}

export { broadcastUpdate };

createServer().catch(console.error);
