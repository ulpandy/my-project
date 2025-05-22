const bcrypt = require('bcrypt');
const { ApiError } = require('../middleware/errorHandler');

// Salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

// Validate password against requirements
const validatePassword = (password) => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new ApiError(400, 'Password must be at least 6 characters long and contain at least one number and one special character');
  }
  return true;
};

// Hash password
const hashPassword = async (password) => {
  validatePassword(password);
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  validatePassword,
  hashPassword,
  comparePassword,
};