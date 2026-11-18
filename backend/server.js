/**
 * FIXUP HOME SERVICES PLATFORM — NODE.JS / EXPRESS REST API SERVER
 * Main Entry Point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const serviceRoutes = require('./routes/serviceRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Fixup Backend Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root API Welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Fixup REST API Server',
    endpoints: {
      services: '/api/services',
      providers: '/api/providers',
      bookings: '/api/bookings',
      adminMetrics: '/api/admin/metrics',
      health: '/api/health'
    }
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚡ Fixup Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready for requests from User, Provider & Admin apps.`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
