import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const CLIENT_DIR = path.join(__dirname, 'dist', 'client');

// MIME types for static assets
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

// --- Intercept http.createServer to wrap the handler ---
const origCreateServer = http.createServer;
http.createServer = function (...args) {
  const handler = args.find(a => typeof a === 'function');
  if (handler) {
    const idx = args.indexOf(handler);
    args[idx] = function (req, res) {
      const reqUrl = req.url || '';
      let urlPath;
      try {
        urlPath = decodeURIComponent(reqUrl.split('?')[0]);
      } catch {
        urlPath = reqUrl.split('?')[0];
      }

      // Serve static files from client dir directly (bypass send module)
      if (urlPath.startsWith('/_astro/') || (!urlPath.startsWith('/api/') && path.extname(urlPath))) {
        const filePath = path.join(CLIENT_DIR, urlPath);
        const resolved = path.resolve(filePath);

        // Security: ensure resolved path stays within CLIENT_DIR
        if (resolved.startsWith(CLIENT_DIR)) {
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const mime = MIME_TYPES[ext] || 'application/octet-stream';
              const headers = {
                'Content-Type': mime,
                'Content-Length': stat.size,
              };
              // Long cache for hashed assets
              if (urlPath.startsWith('/_astro/')) {
                headers['Cache-Control'] = 'public, max-age=31536000, immutable';
              }
              res.writeHead(200, headers);
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // File not found or error — fall through to original handler
          }
        }
      }

      // Pass through to original Astro handler (SSR pages, API routes)
      return handler.call(this, req, res);
    };
  }
  return origCreateServer.apply(this, args);
};

console.log('[STATIC] Custom static handler active — serving from', CLIENT_DIR);

// Import entry.mjs — triggers server start with our patched createServer
await import('./dist/server/entry.mjs');
