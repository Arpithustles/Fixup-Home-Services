/**
 * FIXUP BACKEND AUTHENTICATION & ROLE-BASED ACCESS CONTROL MIDDLEWARE
 * Enforces 72-hour session expiration and strict role exclusivity.
 */

const MAX_SESSION_AGE_MS = 72 * 60 * 60 * 1000; // 72 Hours

module.exports = {
  // Verify Authenticated User
  authenticate: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. No bearer token provided.' });
    }

    try {
      const token = authHeader.split(' ')[1];
      // Basic token decode or verification
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      
      // 72-hour expiration check
      if (Date.now() - decoded.loginTime > MAX_SESSION_AGE_MS) {
        return res.status(401).json({ success: false, error: 'Session expired after 72 hours. Please re-authenticate.' });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or corrupted session token.' });
    }
  },

  // Require specific role: 'CUSTOMER' or 'SERVICE_PROVIDER'
  requireRole: (role) => {
    return (req, res, next) => {
      if (!req.user || req.user.role !== role) {
        return res.status(403).json({
          success: false,
          error: `Access forbidden. This resource requires the ${role} role.`
        });
      }
      next();
    };
  },

  // Require Admin
  requireAdmin: (req, res, next) => {
    const adminHeader = req.headers['x-admin-key'];
    const validKey = process.env.ADMIN_KEY || 'admin-secret-key-123';

    if (adminHeader !== validKey) {
      return res.status(403).json({ success: false, error: 'Administrative privilege required.' });
    }
    next();
  }
};
