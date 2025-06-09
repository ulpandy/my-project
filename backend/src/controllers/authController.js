const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/tokenUtils');
const db = require('../config/database.js');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// 📩 Регистрация
const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      throw new ApiError(400, 'Email, password, and name are required');
    }

    const allowedRoles = ['worker', 'manager'];
    const userRole = allowedRoles.includes(role) ? role : 'worker';

    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [email, hashedPassword, name, userRole]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    logger.info(`User registered: ${newUser.id}`);

    await sendEmail(
      newUser.email,
      '🎉 Welcome to REMS',
      `
        <h2>Hello, ${newUser.name}!</h2>
        <p>You have successfully registered as <strong>${newUser.role}</strong>.</p>
        <p>You can now log in here: <a href="http://localhost:5173">REMS Platform</a></p>
        <br />
        <p>— REMS Team</p>
      `
    );

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// 🔐 Авторизация
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
      logger.warn(`Invalid login attempt for ${email}`);
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user);

    await db.query(`UPDATE users SET is_logged_in = true WHERE id = $1`, [user.id]);
    logger.info(`User logged in: ${user.id}`);

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// 🚪 Выход
const logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.id}`);
    await db.query(
      `UPDATE users SET is_logged_in = false WHERE id = $1`,
      [req.user.id]
    );
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// 🧠 Забыли пароль — отправка ссылки
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) throw new ApiError(400, 'Email is required');

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      logger.warn(`Reset requested for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    await db.query(
      `UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3`,
      [hashedToken, expiration, email]
    );

    const resetLink = `http://localhost:5173/reset-password?token=${rawToken}`;

    await sendEmail(
      email,
      '🔑 Reset Your Password',
      `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
        <br />
        <p>— REMS Security</p>
      `
    );

    res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ✅ Сброс пароля по токену
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, 'Token and new password are required');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const result = await db.query(
      `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiration > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.query(
      `UPDATE users
       SET password_hash = $1,
           reset_token = NULL,
           reset_token_expiration = NULL
       WHERE reset_token = $2`,
      [hashedPassword, hashedToken]
    );

    logger.info(`Password reset successful for token: ${hashedToken}`);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword
};
