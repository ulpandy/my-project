const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const db = require('../config/database');
const PDFDocument = require('pdfkit');
const stream = require('stream');

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


// Get activity statistics
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

    // Validate date range
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

    // Filter by user if provided
    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      queryParams.push(userId);
    }

    const result = await db.query(query, queryParams);

    // Format the results
    const stats = result.rows[0];
    if (!stats.totalClicks) {
      // No data for the period
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

// Generate PDF report
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

    // Аналитика
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

    const doc = new PDFDocument();
    const bufferStream = new stream.PassThrough();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-report.pdf"');

    doc.pipe(bufferStream);
    bufferStream.pipe(res);

    doc.fontSize(20).text('User Activity Report', { align: 'center' }).moveDown();

    doc.fontSize(12).text(`User ID: ${userId || 'All users'}`);
    doc.text(`Start Date: ${startDate}`);
    doc.text(`End Date: ${endDate}`);
    doc.moveDown();

    doc.text(`Total Events: ${summary.totalEvents}`);
    doc.text(`Mouse/Keyboard Activity Events: ${summary.activityEvents}`);
    doc.text(`Window Switches: ${summary.windowSwitches}`);
    doc.text(`AI Tool Detections (ChatGPT etc): ${summary.aiDetections}`);
    doc.moveDown().fontSize(14).text('Details:', { underline: true }).moveDown();

    logs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleString();
      doc.fontSize(10).text(`[${time}] ${log.type}`);
      if (log.type === 'user-activity') {
        const { mouseClicks, keyPresses, mouseMovements } = log.data || {};
        doc.text(` - Clicks: ${mouseClicks}, Keys: ${keyPresses}, Moves: ${mouseMovements}`);
      } else if (log.type === 'window-switch') {
        doc.text(` - Title: ${log.data?.title}`);
        doc.text(` - URL: ${log.data?.url}`);
        doc.text(` - AI tool? ${log.data?.isAiTool ? 'Yes' : 'No'}`);
      }
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    next(error);
  }
};

module.exports = {
  logActivity,
  getActivityStats,
  downloadActivityPdf
};