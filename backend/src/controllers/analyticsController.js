const db = require('../config/database')

exports.getTeamAnalytics = async (req, res, next) => {
  try {
    const [tasksRes, usersRes, activityRes] = await Promise.all([
      db.query('SELECT id, assigned_to, status, created_at, completed_at FROM tasks'),
      db.query('SELECT id, name, role FROM users'),
      db.query('SELECT user_id, keyboard_time, mouse_time, idle_time FROM user_activity'),
    ])

    const tasks = tasksRes.rows
    const users = usersRes.rows
    const activity = activityRes.rows

    return res.json({ tasks, users, activity })
  } catch (err) {
    next(err)
  }
}
