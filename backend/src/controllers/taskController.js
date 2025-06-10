const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const db = require('../config/database');
const { validate: isUUID } = require('uuid');

// Получение задач с фильтрацией
const getTasks = async (req, res, next) => {
  try {
    const { status, assignedTo, projectId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.assigned_to as "assignedTo", t.created_by as "createdBy",
        t.project_id as "projectId",
        t.created_at as "createdAt", t.updated_at as "updatedAt",
        t.start_time as "startTime", t.end_time as "endTime", t.time_spent as "timeSpent",
        u1.name as "assignedToName", u2.name as "createdByName",
        p.name as "projectName"
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND t.status = $${paramIndex++}`;
      queryParams.push(status);
    }

    if (assignedTo) {
      query += ` AND t.assigned_to = $${paramIndex++}`;
      queryParams.push(assignedTo);
    }

    if (projectId) {
      query += ` AND t.project_id = $${paramIndex++}`;
      queryParams.push(projectId);
    }

    if (userRole === 'worker') {
      query += ` AND t.assigned_to = $${paramIndex++}`;
      queryParams.push(userId);
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Создание задачи
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, projectId } = req.body;
    const createdBy = req.user.id;

    if (!title) throw new ApiError(400, 'Title is required');
    if (!createdBy || !isUUID(createdBy)) throw new ApiError(400, 'Valid createdBy is required');
    if (assignedTo && !isUUID(assignedTo)) throw new ApiError(400, 'assignedTo must be a valid UUID');

    const result = await db.query(
      `INSERT INTO tasks (title, description, assigned_to, priority, created_by, project_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING 
         id, title, description, status, priority,
         assigned_to as "assignedTo", created_by as "createdBy",
         project_id as "projectId", created_at as "createdAt"`,
      [title, description, assignedTo, priority || 'medium', createdBy, projectId || null]
    );

    logger.info(`Task created: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Обновление задачи
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const {
      title,
      description,
      status,
      assignedTo,
      priority,
      projectId,
      startTime,
      endTime,
      timeSpent
    } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    if (!isUUID(taskId)) throw new ApiError(400, 'Invalid UUID format for task ID');
    if (projectId && !isUUID(projectId)) throw new ApiError(400, 'Invalid projectId');

    const taskCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (taskCheck.rows.length === 0) throw new ApiError(404, 'Task not found');

    const task = taskCheck.rows[0];

    if (userRole === 'worker' && task.assigned_to !== userId) {
      throw new ApiError(403, 'You can only update tasks assigned to you');
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if ('title' in req.body) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }

    if ('description' in req.body) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if ('status' in req.body) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if ('assignedTo' in req.body) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(assignedTo);
    }

    if ('priority' in req.body) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if ('projectId' in req.body) {
      updates.push(`project_id = $${paramIndex++}`);
      values.push(projectId);
    }

    if ('startTime' in req.body) {
      updates.push(`start_time = $${paramIndex++}`);
      values.push(startTime === null ? null : new Date(startTime));
    }

    if ('endTime' in req.body) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(endTime === null ? null : new Date(endTime));
    }

    if ('timeSpent' in req.body) {
      updates.push(`time_spent = $${paramIndex++}`);
      values.push(timeSpent === null ? null : timeSpent);
    }

    // Автоматически назначаем start_time, если статус inprogress и start_time ещё не установлен
    if (status === 'inprogress' && !task.start_time && !('startTime' in req.body)) {
      updates.push(`start_time = NOW()`);
    }

    // Автоматически устанавливаем end_time и time_spent при завершении задачи
    if (status === 'done' && !task.end_time && !('endTime' in req.body)) {
      updates.push(`end_time = NOW()`);
      if (!('timeSpent' in req.body) && task.start_time) {
        updates.push(`time_spent = EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000`);
      }
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE tasks
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, title, description, status, priority,
        assigned_to as "assignedTo", created_by as "createdBy",
        project_id as "projectId", created_at as "createdAt", updated_at as "updatedAt",
        start_time as "startTime", end_time as "endTime", time_spent as "timeSpent"
    `;

    values.push(taskId);
    const result = await db.query(query, values);

    logger.info(`Task updated: ${taskId}`);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Удаление задачи
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    if (!isUUID(taskId)) throw new ApiError(400, 'Invalid UUID format for task ID');

    const taskCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (taskCheck.rows.length === 0) throw new ApiError(404, 'Task not found');

    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    logger.info(`Task deleted: ${taskId}`);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Завершенные задачи по дням недели
const getWeeklyTaskCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { rows } = await db.query(`
      SELECT
        TO_CHAR(end_time, 'Dy') AS day,
        COUNT(*) AS count
      FROM tasks
      WHERE status = 'done'
        AND assigned_to = $1
        AND end_time >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY MIN(end_time)
    `, [userId]);

    const daysMap = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
    };

    const defaultData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
      day,
      completed: 0
    }));

    rows.forEach(({ day, count }) => {
      const index = daysMap[day];
      if (index !== undefined) {
        defaultData[index].completed = parseInt(count, 10);
      }
    });

    res.json(defaultData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getWeeklyTaskCompletion
};
