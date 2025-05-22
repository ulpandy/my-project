const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints
const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // Default: 1 minute
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 5, // Default: 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again later.'
  }
});

// Rate limiter for API endpoints
const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // Default: 1 minute
  max: parseInt(process.env.RATE_LIMIT_API_MAX) || 100, // Default: 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user ? req.user.id : req.ip, // Use user ID if authenticated, IP otherwise
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.'
  }
});

module.exports = {
  authRateLimiter,
  apiRateLimiter
};