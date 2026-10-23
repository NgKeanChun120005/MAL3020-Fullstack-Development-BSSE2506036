const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'No token provided'));
  }

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

module.exports = { authMiddleware };