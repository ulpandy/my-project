const { hashPassword } = require('../utils/passwordUtils');

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) throw new ApiError(400, 'Token and new password required');

    const result = await db.query(
      `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiration > NOW()`,
      [token]
    );

    if (result.rows.length === 0) throw new ApiError(400, 'Invalid or expired token');

    const hashed = await hashPassword(newPassword);

    await db.query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = $2`,
      [hashed, token]
    );

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};
