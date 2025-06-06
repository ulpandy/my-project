const db = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

// 📥 Получение уведомлений пользователя
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT id, user_id as "userId", message, created_at as "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

// 📤 Создание уведомления
const createNotification = async (req, res, next) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      throw new ApiError(400, 'User ID and message are required');
    }

    const id = uuidv4();

    await db.query(
      `INSERT INTO notifications (id, user_id, message, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [id, userId, message]
    );

    res.status(201).json({ id, userId, message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  createNotification
};
