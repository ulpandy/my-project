const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const db = require('../config/database');
const PDFDocument = require('pdfkit');
const stream = require('stream');

// ✅ Новая функция: Статистика времени по дням недели
const getWorkedHoursPerWeek = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const result = await db.query(`
      SELECT 
        EXTRACT(DOW FROM end_time) AS weekday,
        SUM(EXTRACT(EPOCH FROM duration)) / 3600 AS hours
      FROM task_time_logs
      WHERE user_id = $1 
        AND end_time BETWEEN $2 AND $3
        AND duration IS NOT NULL
      GROUP BY weekday
    `, [userId, startDate, endDate]);

    const data = Array(7).fill(0);
    result.rows.forEach(row => {
      const index = parseInt(row.weekday);
      data[index] = parseFloat(row.hours.toFixed(2));
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// 📌 Логирование активности
const logActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, timestamp, ...data } = req.body;

    if (!type || !timestamp) throw new ApiError(400, 'Type and timestamp are required');

    if (type === 'user-activity') {
      const { mouseClicks, keyPresses, mouseMovements } = data;
      if (mouseClicks === undefined || keyPresses === undefined || mouseMovements === undefined) {
        throw new ApiError(400, 'Missing activity data');
      }
      await db.query(
        `INSERT INTO activity_logs (user_id, type, timestamp, data)
         VALUES ($1, $2, $3, $4)`,
        [userId, type, timestamp, JSON.stringify({ mouseClicks, keyPresses, mouseMovements })]
      );
    } else if (type === 'window-switch') {
      const { title, url, isAiTool } = data;

      if (typeof title !== 'string' || !title.trim() || typeof url !== 'string' || !url.trim()) {
        logger.warn('[logActivity] Invalid title or url:', { title, url, data });
        throw new ApiError(400, 'Title and URL are required');
      }

      await db.query(
        `INSERT INTO activity_logs (user_id, type, timestamp, data)
         VALUES ($1, $2, $3, $4)`,
        [userId, type, timestamp, JSON.stringify({ title, url, isAiTool })]
      );
    } else {
      throw new ApiError(400, 'Unsupported activity type');
    }

    res.status(200).json({ message: 'Activity logged successfully' });
  } catch (error) {
    next(error);
  }
};

// 📊 Статистика активности
const getActivityStats = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;
    if (!startDate || !endDate) throw new ApiError(400, 'Start date and end date are required');

    let query = `
      SELECT 
        SUM(mouse_clicks) AS "totalClicks",
        SUM(key_presses) AS "totalKeyPresses",
        SUM(mouse_movements) AS "totalMouseMovements",
        ROUND(
          (SUM(mouse_clicks) + SUM(key_presses) + SUM(mouse_movements)) / 
          (EXTRACT(EPOCH FROM ($2::timestamp - $1::timestamp)) / 3600)
        ) AS "averageActivityPerHour"
      FROM activity_logs
      WHERE timestamp BETWEEN $1 AND $2`;
    const queryParams = [startDate, endDate];

    if (userId) {
      query += ` AND user_id = $3`;
      queryParams.push(userId);
    }

    const result = await db.query(query, queryParams);
    const stats = result.rows[0];
    const userEmail = userId
      ? (await db.query('SELECT email FROM users WHERE id = $1', [userId])).rows[0]?.email || userId
      : 'All users';

    res.status(200).json({
      user: userEmail,
      totalClicks: parseInt(stats.totalClicks) || 0,
      totalKeyPresses: parseInt(stats.totalKeyPresses) || 0,
      totalMouseMovements: parseInt(stats.totalMouseMovements) || 0,
      averageActivityPerHour: parseFloat(stats.averageActivityPerHour) || 0
    });
  } catch (error) {
    next(error);
  }
};

// 📈 Метрика по всем пользователям
const getPerUserActivityStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) throw new ApiError(400, 'Start date and end date are required');

    const result = await db.query(`
      SELECT 
        users.id AS "userId",
        users.email AS "username",
        COALESCE(SUM((data->>'mouseClicks')::int), 0) AS "mouseTime",
        COALESCE(SUM((data->>'keyPresses')::int), 0) AS "keyboardTime",
        COALESCE(SUM((data->>'mouseMovements')::int), 0) AS "idleTime"
      FROM activity_logs
      JOIN users ON activity_logs.user_id = users.id
      WHERE type = 'user-activity' AND timestamp BETWEEN $1 AND $2
      GROUP BY users.id, users.email
      ORDER BY users.email
    `, [startDate, endDate]);

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

// 📄 Генерация PDF отчета
const downloadActivityPdf = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;
    if (!startDate || !endDate) throw new ApiError(400, 'Start date and end date are required');

    const query = `
      SELECT type, timestamp, data
      FROM activity_logs
      WHERE timestamp BETWEEN $1 AND $2
      ${userId ? 'AND user_id = $3' : ''}
      ORDER BY timestamp ASC`;
    const queryParams = [startDate, endDate];
    if (userId) queryParams.push(userId);

    const result = await db.query(query, queryParams);
    const logs = result.rows;

    const summary = {
      totalEvents: logs.length,
      activityEvents: 0,
      windowSwitches: 0,
      aiDetections: 0
    };

    logs.forEach(log => {
      if (log.type === 'user-activity') summary.activityEvents++;
      if (log.type === 'window-switch') {
        summary.windowSwitches++;
        if (log.data?.isAiTool) summary.aiDetections++;
      }
    });

    const doc = new PDFDocument({ margin: 40 });
    const bufferStream = new stream.PassThrough();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-report.pdf"');
    doc.pipe(bufferStream);
    bufferStream.pipe(res);

    doc.fontSize(20).text('User Activity Report', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`User ID: ${userId || 'All users'}`);
    doc.text(`Start Date: ${startDate}`);
    doc.text(`End Date: ${endDate}`).moveDown();

    const activityCount = summary.activityEvents;
    const aiToolCount = summary.aiDetections;
    const activeThreshold = 20;
    const aiUsageLimit = 5;

    doc.fontSize(14).text('Summary & Evaluation:', { underline: true }).moveDown();
    if (activityCount >= activeThreshold && aiToolCount <= aiUsageLimit) {
      doc.fillColor('green').fontSize(12).text('✅ The user is considered ACTIVE.');
    } else {
      doc.fillColor('red').fontSize(12).text('⚠️ The user is considered INACTIVE or LOW-ACTIVITY.');
    }

    doc
      .fillColor('black')
      .fontSize(10)
      .moveDown()
      .text(`Events: ${activityCount}, AI Detections: ${aiToolCount}`)
      .text('Thresholds: ≥ 20 events, ≤ 5 AI detections')
      .moveDown();

    doc.addPage();
    doc.fontSize(14).text('Event Log Table:', { underline: true }).moveDown();
    doc.fontSize(11)
      .text('Time', 50, doc.y, { continued: true, width: 120 })
      .text('Type', 170, doc.y, { continued: true, width: 70 })
      .text('Clicks', 240, doc.y, { continued: true, width: 50 })
      .text('Keys', 290, doc.y, { continued: true, width: 50 })
      .text('Moves', 340, doc.y, { continued: true, width: 60 })
      .text('URL', 400, doc.y, { continued: true, width: 160 })
      .text('AI Tool', 560, doc.y).moveDown();

    logs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleString();
      const isUser = log.type === 'user-activity';
      const isSwitch = log.type === 'window-switch';
      const clicks = isUser ? log.data?.mouseClicks ?? 0 : '';
      const keys = isUser ? log.data?.keyPresses ?? 0 : '';
      const moves = isUser ? log.data?.mouseMovements ?? 0 : '';
      const url = isSwitch ? log.data?.url ?? '' : '';
      const aiTool = isSwitch ? (log.data?.isAiTool ? 'Yes' : 'No') : '';

      doc.fontSize(10)
        .text(time, 50, doc.y, { continued: true, width: 120 })
        .text(log.type, 170, doc.y, { continued: true, width: 70 })
        .text(clicks.toString(), 240, doc.y, { continued: true, width: 50 })
        .text(keys.toString(), 290, doc.y, { continued: true, width: 50 })
        .text(moves.toString(), 340, doc.y, { continued: true, width: 60 })
        .text(url, 400, doc.y, { continued: true, width: 160 })
        .text(aiTool, 560, doc.y).moveDown();
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// ⬇️ Экспортируем все функции
module.exports = {
  logActivity,
  getActivityStats,
  getPerUserActivityStats,
  downloadActivityPdf,
  getWorkedHoursPerWeek
};
