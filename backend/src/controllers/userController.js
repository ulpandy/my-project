const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const db = require('../config/database');
const sendEmail = require('../utils/sendEmail')

// Get current user info
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, email, name, role, bio FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update current user info
const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, bio, oldPassword, newPassword } = req.body;

    // Check if user exists
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    const user = userResult.rows[0];
    let passwordHash = user.password_hash;

    // Update password if provided
    if (oldPassword && newPassword) {
      // Verify old password
      const isPasswordValid = await comparePassword(oldPassword, user.password_hash);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
      }
      
      // Hash new password
      passwordHash = await hashPassword(newPassword);
      logger.info(`Password updated for user: ${userId}`);
    }

    // Update user info
    const updateResult = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           password_hash = $3
       WHERE id = $4
       RETURNING id, email, name, bio`,
      [name || user.name, bio !== undefined ? bio : user.bio, passwordHash, userId]
    );

    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Get all users (admin,manager only)
const getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role FROM users ORDER BY name'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};


const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    await db.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatarPath, req.user.id]);

    res.status(200).json({ avatar: avatarPath });
  } catch (err) {
    next(err);
  }
};

const getUsersWithActivity = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.is_logged_in,
        (
          SELECT MAX(a.timestamp)
          FROM activity_logs a
          WHERE a.user_id = u.id
        ) AS last_active
      FROM users u
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      throw new ApiError(400, 'All fields are required');
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // 🛡 Генерация временного пароля
    const plainPassword = crypto.randomBytes(6).toString('hex'); // напр. "a1b2c3d4e5f6"
    const hashedPassword = await hashPassword(plainPassword);
    const id = uuidv4();

    const result = await db.query(
      `INSERT INTO users (id, name, email, role, password_hash, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role`,
      [id, name, email, role, hashedPassword, true]
    );

    // ✉ Отправка email
    await sendEmail(
      email,
      '🔐 Your REMS Account Access',
      `
        <h2>Hello, ${name}!</h2>
        <p>You've been invited to the <strong>REMS</strong> platform as a <strong>${role}</strong>.</p>
        <p>Here are your temporary credentials:</p>
        <ul>
          <li><strong>Login:</strong> ${email}</li>
          <li><strong>Password:</strong> ${plainPassword}</li>
        </ul>
        <p>👉 Access the platform here: <a href="http://localhost:5173">http://localhost:5173</a></p>
        <p style="color: red;"><strong>Please change your password after logging in.</strong></p>
        <br />
        <p>— REMS Team</p>
      `
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};




module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  updateAvatar,
  getUsersWithActivity,
  createUser
};