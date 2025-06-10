const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ✅ Начать таймер задачи
router.post('/start', async (req, res, next) => {
  try {
    const { task_id, user_id } = req.body;
    if (!task_id || !user_id) {
      return res.status(400).json({ error: 'task_id и user_id обязательны' });
    }

    // Проверяем, есть ли активный таймер для этой задачи
    const activeTimer = await pool.query(
      `SELECT id FROM task_time_logs 
       WHERE task_id = $1 AND user_id = $2 AND end_time IS NULL`,
      [task_id, user_id]
    );

    if (activeTimer.rows.length > 0) {
      return res.status(400).json({ error: 'Для этой задачи уже есть активный таймер' });
    }

    const result = await pool.query(
      `INSERT INTO task_time_logs (task_id, user_id, start_time) 
       VALUES ($1, $2, NOW()) 
       RETURNING *`,
      [task_id, user_id]
    );

    // Обновляем статус задачи на "в процессе"
    await pool.query(
      `UPDATE tasks 
       SET status = 'inprogress', 
           start_time = NOW() 
       WHERE id = $1`,
      [task_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ✅ Поставить таймер на паузу
router.post('/pause', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id записи обязателен' });
    }

    const result = await pool.query(
      `UPDATE task_time_logs 
       SET pause_time = NOW() 
       WHERE id = $1 AND end_time IS NULL 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Активный таймер не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ✅ Возобновить таймер после паузы
router.post('/resume', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id записи обязателен' });
    }

    const record = await pool.query(
      `SELECT pause_time FROM task_time_logs WHERE id = $1`,
      [id]
    );

    if (record.rows.length === 0 || !record.rows[0].pause_time) {
      return res.status(400).json({ error: 'Таймер не на паузе' });
    }

    const pauseDuration = new Date() - new Date(record.rows[0].pause_time);

    const result = await pool.query(
      `UPDATE task_time_logs 
       SET total_paused = COALESCE(total_paused, 0) + $1,
           pause_time = NULL
       WHERE id = $2
       RETURNING *`,
      [pauseDuration, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ✅ Остановить таймер задачи
router.post('/stop', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id записи обязателен' });
    }

    const record = await pool.query(
      `SELECT start_time, pause_time, total_paused 
       FROM task_time_logs 
       WHERE id = $1`,
      [id]
    );

    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    const { start_time, pause_time, total_paused } = record.rows[0];
    let finalDuration = new Date() - new Date(start_time);

    if (pause_time) {
      const pauseDuration = new Date() - new Date(pause_time);
      finalDuration -= pauseDuration;
    }

    if (total_paused) {
      finalDuration -= total_paused;
    }

    const result = await pool.query(
      `UPDATE task_time_logs 
       SET end_time = NOW(),
           duration = $1
       WHERE id = $2
       RETURNING *`,
      [finalDuration, id]
    );

    await pool.query(
      `UPDATE tasks 
       SET status = 'done', 
           end_time = NOW(),
           time_spent = COALESCE(time_spent, 0) + $1
       WHERE id = (SELECT task_id FROM task_time_logs WHERE id = $2)`,
      [finalDuration, id]
    );

    res.json({
      ...result.rows[0],
      duration_human: formatDuration(result.rows[0].duration)
    });
  } catch (error) {
    next(error);
  }
});

// ✅ Вспомогательная функция форматирования
function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours}h ${minutes}m ${seconds}s`;
}

module.exports = router;
