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
      query += ` AND t.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (assignedTo) {
      query += ` AND t.assigned_to = $${paramIndex}`;
      queryParams.push(assignedTo);
      paramIndex++;
    }

    if (projectId) {
      query += ` AND t.project_id = $${paramIndex}`;
      queryParams.push(projectId);
      paramIndex++;
    }

    if (userRole === 'worker') {
      query += ` AND t.assigned_to = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Создание новой задачи
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, projectId } = req.body;
    const createdBy = req.user.id;

    if (!title) throw new ApiError(400, 'Title is required');
    if (!createdBy || !isUUID(createdBy)) throw new ApiError(400, 'Valid createdBy is required');

    if (assignedTo && (!isUUID(assignedTo))) {
      throw new ApiError(400, 'assignedTo must be a valid UUID if provided');
    }

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
    const { title, description, status, assignedTo, priority, projectId } = req.body;
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

    // Определяем, нужно ли установить end_time
    let endTimeUpdate = '';
    const values = [title, description, status, assignedTo, priority, projectId, taskId];
    if (status === 'done' && !task.end_time) {
      endTimeUpdate = ', end_time = NOW()';
    }

    const result = await db.query(
      `
      UPDATE tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          assigned_to = COALESCE($4, assigned_to),
          priority = COALESCE($5, priority),
          project_id = COALESCE($6, project_id),
          updated_at = NOW()
          ${endTimeUpdate}
      WHERE id = $7
      RETURNING 
        id, title, description, status, priority,
        assigned_to as "assignedTo", created_by as "createdBy",
        project_id as "projectId", created_at as "createdAt", updated_at as "updatedAt",
        end_time as "endTime"
      `,
      values
    );

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

// 📊 Получение статистики по завершённым задачам за неделю
const getWeeklyTaskCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { rows } = await db.query(`
      SELECT
        TO_CHAR(completed_at, 'Dy') AS day,
        COUNT(*) AS count
      FROM tasks
      WHERE status = 'completed'
        AND assigned_to = $1
        AND completed_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY MIN(completed_at)
    `, [userId]);

    // Преобразуем в формат для графика
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
  getWeeklyTaskCompletion,
};
