import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// --- Diagnostic: intercept HTTP handler ---
const origCreateServer = http.createServer;
http.createServer = function (...args) {
  const handler = args.find(a => typeof a === 'function');
  if (handler) {
    const idx = args.indexOf(handler);
    let firstAssetReq = true;
    args[idx] = async function (req, res) {
      const reqUrl = req.url || '';
      const urlPath = reqUrl.split('?')[0];

      // Diagnostic endpoint
      if (urlPath === '/__diag__') {
        try {
          const entryPath = path.join(__dirname, 'dist', 'server', 'entry.mjs');
          const serverDir = path.join(__dirname, 'dist', 'server');
          const clientDir = path.join(__dirname, 'dist', 'client');
          const astroDir = path.join(clientDir, '_astro');

          let chunkInfo = 'N/A';
          try {
            const chunks = fs.readdirSync(path.join(serverDir, 'chunks'));
            chunkInfo = chunks.join(', ');
          } catch (e) {
            chunkInfo = 'error: ' + e.message;
          }

          let astroFiles = [];
          try {
            astroFiles = fs.readdirSync(astroDir).slice(0, 30);
          } catch (e) { /* empty */ }

          const info = {
            cwd: process.cwd(),
            dirname: __dirname,
            entryExists: fs.existsSync(entryPath),
            clientDir: clientDir,
            clientDirExists: fs.existsSync(clientDir),
            astroDirExists: fs.existsSync(astroDir),
            astroFileCount: astroFiles.length,
            astroFiles,
            serverChunks: chunkInfo,
            nodeModulesSend: fs.existsSync(path.join(__dirname, 'node_modules', 'send')),
            env: {
              NODE_ENV: process.env.NODE_ENV,
              PORT: process.env.PORT,
              HOST: process.env.HOST,
            }
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(info, null, 2));
        } catch (e) {
          res.writeHead(500);
          res.end('Error: ' + e.message);
        }
        return;
      }

      // Log first few asset requests for debugging
      if (urlPath.startsWith('/_astro/') && firstAssetReq) {
        firstAssetReq = false;
        const clientDir = path.join(__dirname, 'dist', 'client');
        const filePath = path.join(clientDir, urlPath);
        console.log('[DIAG] === First asset request ===');
        console.log('[DIAG] Request URL:', reqUrl);
        console.log('[DIAG] Expected file:', filePath);
        console.log('[DIAG] File exists:', fs.existsSync(filePath));
        console.log('[DIAG] Client dir:', clientDir);
        console.log('[DIAG] Client dir exists:', fs.existsSync(clientDir));

        // Try alternate path calculations
        const serverDir = path.join(__dirname, 'dist', 'server');
        const relClient = path.resolve(serverDir, '../client');
        console.log('[DIAG] Relative client (../client from server):', relClient, '→ exists:', fs.existsSync(relClient));

        const chunksDir = path.join(serverDir, 'chunks');
        const relFromChunks = path.resolve(chunksDir, '../../client');
        console.log('[DIAG] Relative client (../../client from chunks):', relFromChunks, '→ exists:', fs.existsSync(relFromChunks));

        // List what's actually in dist
        try {
          const distContents = fs.readdirSync(path.join(__dirname, 'dist'));
          console.log('[DIAG] dist/ contents:', distContents);
        } catch (e) {
          console.log('[DIAG] Cannot read dist/:', e.message);
        }

        // List _astro files
        try {
          const astroFiles = fs.readdirSync(path.join(clientDir, '_astro'));
          console.log('[DIAG] _astro/ files (first 10):', astroFiles.slice(0, 10));
        } catch (e) {
          console.log('[DIAG] Cannot read _astro/:', e.message);
        }
      }

      return handler.call(this, req, res);
    };
  }
  return origCreateServer.apply(this, args);
};

console.log('[DIAG] Wrapper loaded, http.createServer intercepted');

// Import entry.mjs — this triggers server start with our patched createServer
await import('./dist/server/entry.mjs');
