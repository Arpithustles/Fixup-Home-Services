/**
 * FIXUP ZERO-DEPENDENCY NATIVE NODE.JS HTTP REST API SERVER
 * Runs on pure Node.js (v14+) without needing 'npm install' or internet access!
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;
const PROJECT_ROOT = path.resolve(__dirname, '..');
// The document root is the project directory; frontend assets live beneath it.
const FRONTEND_ROOT = PROJECT_ROOT;
const FRONTEND_ASSETS_ROOT = path.join(FRONTEND_ROOT, 'frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, data) {
  setCors(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function serveStaticFile(req, res, filePath, allowedRoot) {
  try {
    const rootRealPath = await fs.promises.realpath(allowedRoot);
    const realPath = await fs.promises.realpath(filePath);
    if (realPath !== rootRealPath && !realPath.startsWith(rootRealPath + path.sep)) {
      return sendJson(res, 404, { success: false, error: 'File not found.' });
    }

    const stats = await fs.promises.stat(realPath);
    if (!stats.isFile()) {
      return sendJson(res, 404, { success: false, error: 'File not found.' });
    }

    setCors(res);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(realPath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method.toUpperCase() === 'HEAD') return res.end();

    const stream = fs.createReadStream(realPath);
    stream.on('error', () => {
      if (!res.headersSent) sendJson(res, 500, { success: false, error: 'Unable to read file.' });
      else res.destroy();
    });
    stream.pipe(res);
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      return sendJson(res, 404, { success: false, error: 'File not found.' });
    }
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

  try {
    // Health Check
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(res, 200, {
        status: 'ONLINE',
        mode: 'Native Node.js Zero-Dependency Server',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }

    // Serve the landing page and files contained in the frontend directory only.
    if ((method === 'GET' || method === 'HEAD') && (pathname === '/' || pathname === '/index.html')) {
      let indexPath = path.join(PROJECT_ROOT, 'index.html');
      try {
        await fs.promises.access(indexPath, fs.constants.R_OK);
      } catch (err) {
        indexPath = path.join(FRONTEND_ASSETS_ROOT, 'index.html');
        return await serveStaticFile(req, res, indexPath, FRONTEND_ASSETS_ROOT);
      }
      return await serveStaticFile(req, res, indexPath, PROJECT_ROOT);
    }
    if ((method === 'GET' || method === 'HEAD') && pathname.startsWith('/frontend/')) {
      let relativePath;
      try {
        relativePath = decodeURIComponent(pathname.slice('/frontend/'.length));
      } catch (err) {
        return sendJson(res, 400, { success: false, error: 'Invalid file path.' });
      }
      if (!relativePath || relativePath.includes('\0')) {
        return sendJson(res, 404, { success: false, error: 'File not found.' });
      }

      const filePath = path.resolve(FRONTEND_ASSETS_ROOT, relativePath);
      if (filePath !== FRONTEND_ASSETS_ROOT && !filePath.startsWith(FRONTEND_ASSETS_ROOT + path.sep)) {
        return sendJson(res, 404, { success: false, error: 'File not found.' });
      }
      return await serveStaticFile(req, res, filePath, FRONTEND_ASSETS_ROOT);
    }

    // Services
    if (pathname === '/api/services' && method === 'GET') {
      return sendJson(res, 200, { success: true, data: db.getServices() });
    }
    if (pathname === '/api/services' && method === 'POST') {
      const body = await parseBody(req);
      const created = db.addService(body);
      return sendJson(res, 201, { success: true, data: created });
    }

    // Providers
    if (pathname === '/api/providers' && method === 'GET') {
      return sendJson(res, 200, { success: true, data: db.getProviders() });
    }
    if (pathname === '/api/providers/register' && method === 'POST') {
      const body = await parseBody(req);
      const created = db.addProvider(body);
      return sendJson(res, 201, { success: true, data: created });
    }

    // Bookings
    if (pathname === '/api/bookings' && method === 'GET') {
      return sendJson(res, 200, { success: true, data: db.getBookings() });
    }
    if (pathname === '/api/bookings' && method === 'POST') {
      const body = await parseBody(req);
      const created = db.createBooking(body);
      return sendJson(res, 201, { success: true, data: created });
    }

    // Admin Metrics
    if (pathname === '/api/admin/metrics' && method === 'GET') {
      const bookings = db.getBookings();
      const gmv = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
      return sendJson(res, 200, {
        success: true,
        data: {
          gmv,
          commission: Math.round(gmv * 0.15),
          totalBookings: bookings.length,
          verifiedPros: db.getProviders().filter(p => p.kycStatus === 'verified').length,
          activeJobs: bookings.filter(b => b.status !== 'completed').length,
          serverUptime: process.uptime()
        }
      });
    }

    // Support frontend root-relative links (for example /css/site.css) and
    // direct page loads while keeping all static access inside FRONTEND_ROOT.
    if ((method === 'GET' || method === 'HEAD') && !pathname.startsWith('/api/')) {
      let relativePath;
      try {
        relativePath = decodeURIComponent(pathname.slice(1));
      } catch (err) {
        return sendJson(res, 400, { success: false, error: 'Invalid file path.' });
      }
      if (!relativePath || relativePath.includes('\0')) {
        return sendJson(res, 404, { success: false, error: 'File not found.' });
      }

      const filePath = path.resolve(FRONTEND_ASSETS_ROOT, relativePath);
      if (filePath !== FRONTEND_ASSETS_ROOT && !filePath.startsWith(FRONTEND_ASSETS_ROOT + path.sep)) {
        return sendJson(res, 404, { success: false, error: 'File not found.' });
      }
      return await serveStaticFile(req, res, filePath, FRONTEND_ASSETS_ROOT);
    }

    // Fallback 404
    sendJson(res, 404, { success: false, error: `Route ${method} ${pathname} not found.` });
  } catch (err) {
    sendJson(res, 500, { success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ Fixup Native REST API running at http://localhost:${PORT}`);
  console.log(`🔒 Zero external dependencies required.`);
  console.log(`=======================================================`);
});
