const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // или как у тебя подключается к БД

// Начать таймер задачи
router.post('/start', async (req, res, next) => {
  try {
    const { task_id, user_id } = req.body;
    if (!task_id || !user_id) {
      return res.status(400).json({ error: 'task_id и user_id обязательны' });
    }
    const result = await pool.query(
      `INSERT INTO task_time_logs (task_id, user_id, start_time) VALUES ($1, $2, NOW()) RETURNING *`,
      [task_id, user_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Остановить таймер задачи
router.post('/stop', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id записи обязателен' });
    }
    const record = await pool.query('SELECT start_time FROM task_time_logs WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    const start_time = record.rows[0].start_time;
    const result = await pool.query(
      `UPDATE task_time_logs 
       SET end_time = NOW(), 
           duration = NOW() - $1
       WHERE id = $2
       RETURNING *`,
      [start_time, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
