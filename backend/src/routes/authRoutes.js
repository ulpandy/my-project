const express = require('express');
const { register, login, logout, forgotPassword, resetPassword, } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

console.log('DEBUG register:', typeof register);
console.log('DEBUG login:', typeof login);
console.log('DEBUG logout:', typeof logout);
console.log('DEBUG authenticate:', typeof authenticate);
console.log('DEBUG forgotPassword:', typeof forgotPassword);
console.log('DEBUG resetPassword:', typeof resetPassword);

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;