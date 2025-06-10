const express = require('express');
const {
  logActivity,
  getActivityStats,
  downloadActivityPdf,
  getPerUserActivityStats,
  getWorkedHoursPerWeek // ✅ Новый контроллер
} = require('../controllers/activityController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { apiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// 🔐 Применяем middleware для всех маршрутов активности
router.use(authenticate);
router.use(apiRateLimiter);

// 📌 POST: логирование пользовательской активности
router.post('/', logActivity);

// 📊 GET: статистика активности по кликам / клавишам и т.д.
router.get('/stats', authorize('admin', 'manager'), getActivityStats);

// 🧾 GET: PDF отчёт о событиях активности
router.get('/pdf', authorize('admin', 'manager'), downloadActivityPdf);

// 👥 GET: метрики активности по каждому пользователю
router.get('/per-user-stats', authorize('admin', 'manager'), getPerUserActivityStats);

// ⏱️ ✅ GET: отработанные часы по дням недели (для графика Time Tracking)
router.get('/worked-hours', getWorkedHoursPerWeek);

module.exports = router;
