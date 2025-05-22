const { logger } = require('../utils/logger');

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.message}`, { 
    url: req.originalUrl, 
    method: req.method,
    stack: err.stack
  });

  // API error handling
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Database errors
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      status: 'error',
      message: 'Database constraint violation',
    });
  }

  // Default error handling
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = {
  ApiError,
  errorHandler,
};