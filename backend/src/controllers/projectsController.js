const db = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

// Get all projects
const getProjects = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        p.*, u.name AS createdByName 
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Create new project
const createProject = async (req, res, next) => {
  try {
    const { name, description, deadline } = req.body; // ✅ добавили deadline
    const createdBy = req.user.id;

    if (!name) throw new ApiError(400, 'Project name is required');

    const result = await db.query(`
      INSERT INTO projects (name, description, created_by, deadline)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, createdBy, deadline]); // ✅ передаём deadline

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};


//delete project
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Проверка, существует ли проект
    const check = await db.query(`SELECT * FROM projects WHERE id = $1`, [id]);
    if (check.rows.length === 0) {
      throw new ApiError(404, 'Project not found');
    }

    // Удаление проекта
    await db.query(`DELETE FROM projects WHERE id = $1`, [id]);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};


// Update project
const updateProject = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, deadline, status } = req.body;

  const result = await db.query(`
    UPDATE projects
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        deadline = COALESCE($3, deadline),
        status = COALESCE($4, status),
        updated_at = NOW()
    WHERE id = $5
    RETURNING *
  `, [name, description, deadline, status, id]);

  res.status(200).json(result.rows[0]);
}

// Get projects with summary
const getProjectsWithSummary = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.start_date,
        p.deadline,
        p.status,
        p.created_by,
        p.created_at,
        p.updated_at,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completed_tasks,
        -- Проект считается "on track", если есть задачи и не менее 50% выполнено
        CASE 
          WHEN COUNT(t.id) = 0 THEN false
          WHEN SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END)::float / COUNT(t.id) >= 0.5 THEN true
          ELSE false
        END AS on_track
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  getProjectsWithSummary
};
