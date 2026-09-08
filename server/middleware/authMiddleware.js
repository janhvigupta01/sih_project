const jwt = require('jsonwebtoken');
const { inMemoryStore } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'scrap_sathi_sih_2026_secret_key_mo_mines';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find user
    const user = inMemoryStore.users.find(u => u._id === decoded.id || u.phone === decoded.phone || u.email === decoded.email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token: user not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token expired or invalid: ' + err.message });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET
};
