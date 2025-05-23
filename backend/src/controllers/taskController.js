const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const db = require('../config/database');

// Get tasks with filtering
const getTasks = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.assigned_to as "assignedTo", t.created_by as "createdBy",
        t.created_at as "createdAt",
        u1.name as "assignedToName", u2.name as "createdByName"
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Apply filters
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (assignedTo) {
      query += ` AND t.assigned_to = $${paramIndex}`;
      queryParams.push(assignedTo);
      paramIndex++;
    }

    // Apply role-based filtering
    if (userRole === 'worker') {
      query += ` AND t.assigned_to = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    // Order by created_at
    query += ' ORDER BY t.created_at DESC';

    const result = await db.query(query, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Create a new task
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority } = req.body;
    const createdBy = req.user.id;

    console.log('CREATE TASK PAYLOAD:', { title, description, assignedTo, createdBy });

    
    // Validate required fields
    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

if (assignedTo !== null && assignedTo !== undefined) {
  if (typeof assignedTo !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(assignedTo)) {
    throw new ApiError(400, 'assignedTo must be a valid UUID if provided');
  }
}
    if (!createdBy || typeof createdBy !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(createdBy)) {
      throw new ApiError(400, 'Valid createdBy UUID is required');
    }
    
    // Create the task
    const result = await db.query(
      `INSERT INTO tasks (title, description, assigned_to, priority, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING 
         id, title, description, status, priority,
         assigned_to as "assignedTo", created_by as "createdBy",
         created_at as "createdAt"`,
      [title, description, assignedTo, priority || 'medium', createdBy]
    );

    logger.info(`Task created: ${result.rows[0].id}`);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};



// Update a task
const updateTask = async (req, res, next) => {
  try {
    
    const taskId = req.params.id;
    const { validate: isUUID } = require('uuid');
    if (!isUUID(taskId)) {
      throw new ApiError(400, 'Invalid UUID format for task ID');
    }
    const { title, description, status, assignedTo, priority } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if task exists
    const taskCheck = await db.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      throw new ApiError(404, 'Task not found');
    }

    const task = taskCheck.rows[0];

    // Check permissions
    if (userRole === 'worker' && task.assigned_to !== userId) {
      throw new ApiError(403, 'You can only update tasks assigned to you');
    }

    // Update the task
    const result = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           assigned_to = COALESCE($4, assigned_to),
           priority = COALESCE($5, priority),
           updated_at = NOW()
       WHERE id = $6
       RETURNING 
         id, title, description, status, priority,
         assigned_to as "assignedTo", created_by as "createdBy",
         created_at as "createdAt", updated_at as "updatedAt"`,
      [title, description, status, assignedTo, priority, taskId]
    );

    logger.info(`Task updated: ${taskId}`);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete a task
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // Check if task exists
    const taskCheck = await db.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      throw new ApiError(404, 'Task not found');
    }

    // Delete the task
    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    logger.info(`Task deleted: ${taskId}`);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};