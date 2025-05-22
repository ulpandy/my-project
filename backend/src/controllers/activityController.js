const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const db = require('../config/database');

// Log activity
const logActivity = async (req, res, next) => {
  try {
    const { mouseClicks, keyPresses, mouseMovements, timestamp } = req.body;
    const userId = req.user.id;

    // Validate data
    if (mouseClicks === undefined || keyPresses === undefined || mouseMovements === undefined) {
      throw new ApiError(400, 'Mouse clicks, key presses, and mouse movements are required');
    }

    // Log the activity
    await db.query(
      `INSERT INTO activity_logs 
       (user_id, mouse_clicks, key_presses, mouse_movements, timestamp)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, mouseClicks, keyPresses, mouseMovements, timestamp || new Date()]
    );

    res.status(200).json({ message: 'Activity logged successfully' });
  } catch (error) {
    next(error);
  }
};

// Get activity statistics
const getActivityStats = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;

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

    // Создание PDF-документа
    const doc = new PDFDocument();
    const bufferStream = new stream.PassThrough();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-report.pdf"');

    doc.pipe(bufferStream);
    bufferStream.pipe(res);

    doc.fontSize(20).text('User Activity Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`User ID: ${userId || 'All users'}`);
    doc.text(`Start Date: ${startDate}`);
    doc.text(`End Date: ${endDate}`);
    doc.moveDown();

    doc.text(`Total Mouse Clicks: ${stats.totalClicks || 0}`);
    doc.text(`Total Key Presses: ${stats.totalKeyPresses || 0}`);
    doc.text(`Total Mouse Movements: ${stats.totalMouseMovements || 0}`);
    doc.text(`Average Activity per Hour: ${stats.averageActivityPerHour || 0}`);

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