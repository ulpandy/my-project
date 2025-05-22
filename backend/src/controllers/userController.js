const { ApiError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const db = require('../config/database');

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

// Get all users (admin only)
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

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
};