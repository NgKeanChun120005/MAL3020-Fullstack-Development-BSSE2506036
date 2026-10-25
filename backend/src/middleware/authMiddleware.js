const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

// Middleware to authenticate requests using JWT tokens
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  // Check if the Authorization header is present and starts with 'Bearer '
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'No token provided'));
  }
// Extract the token from the Authorization header
  const token = header.split(' ')[1];

  // Verify the token using the secret key and attach the decoded user information to req.user
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
    // If the token is invalid or expired, catch the error and return a 401 Unauthorized response
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

module.exports = { authMiddleware };