const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { hashPassword, comparePassword, generateStrongPassword } = require('../utils/passwordUtils');
const db = require('../config/database');
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

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

    // Проверка на существующий email
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Генерация надёжного пароля и хеширование
    const plainPassword = generateStrongPassword();
    const hashedPassword = await hashPassword(plainPassword);
    const id = uuidv4();

    // Сохраняем в базу данных
    const result = await db.query(
      `INSERT INTO users (id, name, email, role, password_hash, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role`,
      [id, name, email, role, hashedPassword, true]
    );

    // Отправляем письмо
    const subject = '🔐 Your Access Credentials for the System';

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome, ${name}!</h2>
        <p>Your account has been created.</p>
        <p><strong>Email:</strong> ${email}<br>
           <strong>Temporary Password:</strong> ${plainPassword}</p>
        <p>Please log in and change your password as soon as possible.</p>
        <a href="http://localhost:5173/login"
           style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;margin-top:10px;">
          Log in to your account
        </a>
        <p style="margin-top:20px;font-size:12px;color:#888;">If you didn't expect this email, you can ignore it.</p>
      </div>
    `;

    await sendEmail(email, subject, html);

    // Возвращаем ответ
    res.status(201).json({
      ...result.rows[0],
      message: 'User created and password sent via email.'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { createUser };



const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    // Удаляем связанные записи в activity_logs
    await db.query('DELETE FROM activity_logs WHERE user_id = $1', [userId]);

    // Затем удаляем самого пользователя
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

    if (result.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};




module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  updateAvatar,
  getUsersWithActivity,
  createUser,
  deleteUser
};