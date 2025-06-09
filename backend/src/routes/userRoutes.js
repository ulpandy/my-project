const express = require('express');
const { getCurrentUser, updateCurrentUser, getAllUsers, updateAvatar, getUsersWithActivity, createUser } = require('../controllers/userController');
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
router.get('/with-activity', authenticate, authorize('admin', 'manager'), getUsersWithActivity);
router.post('/', authorize('admin'), createUser);

// Avatar upload route
router.patch('/avatar', authenticate, upload.single('avatar'), updateAvatar);



module.exports = router;