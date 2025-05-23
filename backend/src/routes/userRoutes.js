const express = require('express');
const { getCurrentUser, updateCurrentUser, getAllUsers, updateAvatar } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { apiRateLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' })

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticate);
// Apply rate limiting to all user routes
router.use(apiRateLimiter);

// Current user routes
router.get('/me', getCurrentUser);
router.put('/me', updateCurrentUser);

// Admin-only routes
router.get('/', authorize('admin', 'manager'), getAllUsers);

// Avatar upload route
router.patch('/avatar', authenticate, upload.single('avatar'), updateAvatar);

module.exports = router;