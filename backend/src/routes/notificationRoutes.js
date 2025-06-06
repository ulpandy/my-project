const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getNotifications,
  createNotification
} = require('../controllers/notificationController');

// 📩 Создать уведомление
router.post('/', authenticate, createNotification);

// 📥 Получить все уведомления
router.get('/', authenticate, getNotifications);

module.exports = router;
