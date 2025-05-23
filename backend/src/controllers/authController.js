const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/tokenUtils');
const db = require('../config/database.js');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // создадим позже


console.log('DEBUG typeof db:', typeof db);
console.log('DEBUG typeof db.query:', typeof db.query);

const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      throw new ApiError(400, 'Email, password, and name are required');
    }

    // ⚠️ Допустимые роли
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
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, userRole]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    logger.info(`User registered: ${newUser.id}`);

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

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Find user by email
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // Check if user exists and password is correct
    if (!user || !(await comparePassword(password, user.password_hash))) {
    
      console.log("Login attempt:", req.body);

    }

    // Generate JWT
    const token = generateToken(user);
    console.log('JWT Token:', token)

    logger.info(`User logged in: ${user.id}`);

    // Return user info and token
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

// Logout user (JWT invalidation is handled client-side)
const logout = async (req, res, next) => {
  try {
    // For JWT, we can't invalidate the token server-side
    // The client should remove the token from storage
    
    logger.info(`User logged out: ${req.user.id}`);
    
    res.status(200).json({ 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    next(error);
  }
};

 // Forgot password
// (sends reset link to email)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) throw new ApiError(400, 'Email is required');

    // Проверка: существует ли пользователь
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      logger.warn(`Reset requested for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' }); // не раскрываем, есть ли пользователь
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 мин

    await db.query(
      `UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3`,
      [token, expiration, email]
    );

    const resetLink = `http://localhost:3000/reset-password?token=${token}`; // заменишь на прод-URL

    await sendEmail(email, 'Password Reset', `Click here to reset your password: ${resetLink}`);

    res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, 'Token and new password are required');
    }

    const result = await db.query(
      `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiration > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = $2`,
      [hashedPassword, token]
    );

    logger.info(`Password reset successful for token: ${token}`);

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