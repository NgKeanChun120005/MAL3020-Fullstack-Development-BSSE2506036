// This class is used to create custom error objects for the application.
class AppError extends Error {
  constructor(status, message) {
    super(message);
     // Identify the type of error such as 404, 500, etc.
    this.status = status;
     // isOperational indicates whether the error is expected.
    this.isOperational = true;
     // Create a stack trace for the error, used for debugging purposes.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };