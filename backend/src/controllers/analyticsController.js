const db = require('../config/database');

// 🔧 Функция преобразования snake_case → camelCase
const camelize = obj =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
      value
    ])
  );

exports.getTeamAnalytics = async (req, res, next) => {
  try {
    const [tasksRes, usersRes, activityRes] = await Promise.all([
      db.query('SELECT id, assigned_to, status, created_at, completed_at FROM tasks'),
      db.query('SELECT id, name, role FROM users'),
      db.query('SELECT user_id, keyboard_time, mouse_time, idle_time FROM user_activity'),
    ]);

    // ✅ Преобразуем в camelCase
    const tasks = tasksRes.rows.map(camelize);
    const users = usersRes.rows.map(camelize);
    const activity = activityRes.rows.map(camelize);

    return res.json({ tasks, users, activity });
  } catch (err) {
    next(err);
  }
};
