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

    // Root Welcome
    if (pathname === '/' && method === 'GET') {
      return sendJson(res, 200, {
        message: 'Fixup Home Services REST API (Native Node.js)',
        endpoints: ['/api/services', '/api/providers', '/api/bookings', '/api/admin/metrics', '/api/health']
      });
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
