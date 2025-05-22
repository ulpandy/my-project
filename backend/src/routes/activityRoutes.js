const express = require('express');
const { logActivity, getActivityStats , downloadActivityPdf } = require('../controllers/activityController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { apiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply authentication to all activity routes
router.use(authenticate);
// Apply rate limiting to all activity routes
router.use(apiRateLimiter);

// Activity routes
router.post('/', logActivity);
router.get('/stats', authorize('admin', 'manager'), getActivityStats);
router.get('/pdf', authorize('admin', 'manager'), downloadActivityPdf);

module.exports = router;