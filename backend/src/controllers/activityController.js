const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const db = require('../config/database');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const path = require('path');
const fs = require('fs');



// Log activity
const logActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, timestamp, ...data } = req.body;

    if (!type || !timestamp) {
      throw new ApiError(400, 'Type and timestamp are required');
    }

    if (type === 'user-activity') {
      const { mouseClicks, keyPresses, mouseMovements } = data;
      if (mouseClicks === undefined || keyPresses === undefined || mouseMovements === undefined) {
        throw new ApiError(400, 'Missing activity data');
      }

      await db.query(`
        INSERT INTO activity_logs 
        (user_id, type, timestamp, data)
        VALUES ($1, $2, $3, $4)`,
        [userId, type, timestamp, JSON.stringify({ mouseClicks, keyPresses, mouseMovements })]
      );
    }

    else if (type === 'window-switch') {
      const { title, url, isAiTool } = data;
      if (!title || !url) {
        throw new ApiError(400, 'Title and URL are required');
      }

      await db.query(`
        INSERT INTO activity_logs 
        (user_id, type, timestamp, data)
        VALUES ($1, $2, $3, $4)`,
        [userId, type, timestamp, JSON.stringify({ title, url, isAiTool })]
      );
    }

    else {
      throw new ApiError(400, 'Unsupported activity type');
    }

    res.status(200).json({ message: 'Activity logged successfully' });

  } catch (error) {
    next(error);
  }
};

// Get aggregated activity statistics
const getActivityStats = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;

    let userEmail = null;

    if (userId) {
      const emailRes = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
      if (emailRes.rows.length > 0) {
        userEmail = emailRes.rows[0].email;
      }
    }

    if (!startDate || !endDate) {
      throw new ApiError(400, 'Start date and end date are required');
    }

    let query = `
      SELECT 
        SUM(mouse_clicks) as "totalClicks",
        SUM(key_presses) as "totalKeyPresses",
        SUM(mouse_movements) as "totalMouseMovements",
        ROUND(
          (SUM(mouse_clicks) + SUM(key_presses) + SUM(mouse_movements)) / 
          (EXTRACT(EPOCH FROM ($2::timestamp - $1::timestamp)) / 3600)
        ) as "averageActivityPerHour"
      FROM activity_logs
      WHERE timestamp BETWEEN $1 AND $2
    `;
    const queryParams = [startDate, endDate];
    let paramIndex = 3;

    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      queryParams.push(userId);
    }

    const result = await db.query(query, queryParams);

    const stats = result.rows[0];
    if (!stats.totalClicks) {
      res.status(200).json({
        totalClicks: 0,
        totalKeyPresses: 0,
        totalMouseMovements: 0,
        averageActivityPerHour: 0
      });
      return;
    }

    res.status(200).json({
      user: userEmail || userId || 'All users',
      totalClicks: parseInt(stats.totalClicks) || 0,
      totalKeyPresses: parseInt(stats.totalKeyPresses) || 0,
      totalMouseMovements: parseInt(stats.totalMouseMovements) || 0,
      averageActivityPerHour: parseFloat(stats.averageActivityPerHour) || 0
    });
  } catch (error) {
    next(error);
  }
};


// Генерация PDF-отчета
const getPerUserActivityStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ApiError(400, 'Start date and end date are required');
    }

    const result = await db.query(`
      SELECT 
        users.id as "userId",
        users.email as "username",
        COALESCE(SUM((data->>'mouseClicks')::int), 0) as "mouseTime",
        COALESCE(SUM((data->>'keyPresses')::int), 0) as "keyboardTime",
        COALESCE(SUM((data->>'mouseMovements')::int), 0) as "idleTime"
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

// Генерация PDF-отчета
const downloadActivityPdf = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ApiError(400, 'Start date and end date are required');
    }

    const query = `
      SELECT type, timestamp, data
      FROM activity_logs
      WHERE timestamp BETWEEN $1 AND $2
      ${userId ? 'AND user_id = $3' : ''}
      ORDER BY timestamp ASC
    `;

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

    // 🧾 Заголовок
    doc.fontSize(20).text('User Activity Report', { align: 'center' }).moveDown();

    // 📋 Даты и пользователь
    doc.fontSize(12).text(`User ID: ${userId || 'All users'}`);
    doc.text(`Start Date: ${startDate}`);
    doc.text(`End Date: ${endDate}`);
    doc.moveDown();

    // 🔍 Сводка и анализ активности
    const activeThreshold = 20;
    const aiUsageLimit = 5;
    const activityCount = summary.activityEvents;
    const aiToolCount = summary.aiDetections;

    doc.moveDown().fontSize(14).text('Summary & Evaluation:', { underline: true }).moveDown();

    if (activityCount >= activeThreshold && aiToolCount <= aiUsageLimit) {
      doc.fillColor('green').fontSize(12).text('✅ The user is considered ACTIVE based on the tracked events.');
    } else {
      doc.fillColor('red').fontSize(12).text('⚠️ The user is considered INACTIVE or LOW-ACTIVITY during this period.');
    }

    doc
      .fillColor('black')
      .fontSize(11)
      .moveDown()
      .text(`Activity threshold: ${activeThreshold} events. AI usage limit: ${aiUsageLimit} windows.`)
      .text(`Actual user-activity events: ${activityCount}`)
      .text(`AI tool detections: ${aiToolCount}`)
      .moveDown()
      .fontSize(10)
      .text('The system classifies a user as active if the number of interaction events (mouse, keyboard) is above the threshold and the number of detected AI-related tools is within acceptable limits.');

    // 📊 Таблица логов
    doc.addPage();
    doc.fontSize(14).text('Event Log Table:', { underline: true }).moveDown();

    // 🧾 Заголовок таблицы
    doc
      .fontSize(11)
      .fillColor('black')
      .text('Time', 50, doc.y, { continued: true, width: 120 })
      .text('Type', 170, doc.y, { continued: true, width: 70 })
      .text('Clicks', 240, doc.y, { continued: true, width: 50 })
      .text('Keys', 290, doc.y, { continued: true, width: 50 })
      .text('Moves', 340, doc.y, { continued: true, width: 60 })
      .text('URL', 400, doc.y, { continued: true, width: 160 })
      .text('AI Tool', 560, doc.y)
      .moveDown();

    // 📄 Строки таблицы
    logs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleString();
      const isUserActivity = log.type === 'user-activity';
      const isWindowSwitch = log.type === 'window-switch';

      const clicks = isUserActivity ? log.data?.mouseClicks ?? 0 : '';
      const keys = isUserActivity ? log.data?.keyPresses ?? 0 : '';
      const moves = isUserActivity ? log.data?.mouseMovements ?? 0 : '';

      const url = isWindowSwitch ? log.data?.url ?? '' : '';
      const aiTool = isWindowSwitch ? (log.data?.isAiTool ? 'Yes' : 'No') : '';

      doc
        .fontSize(10)
        .text(time, 50, doc.y, { continued: true, width: 120 })
        .text(log.type, 170, doc.y, { continued: true, width: 70 })
        .text(clicks.toString(), 240, doc.y, { continued: true, width: 50 })
        .text(keys.toString(), 290, doc.y, { continued: true, width: 50 })
        .text(moves.toString(), 340, doc.y, { continued: true, width: 60 })
        .text(url, 400, doc.y, { continued: true, width: 160 })
        .text(aiTool, 560, doc.y)
        .moveDown();
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};


module.exports = {
  logActivity,
  getActivityStats,
  getPerUserActivityStats,
  downloadActivityPdf
};
