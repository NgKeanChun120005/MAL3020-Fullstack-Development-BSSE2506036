const { AppError } = require('../utils/AppError');

// allow access to the route if the role is allowed
function roleGuard(...allowed) {
  return (req, res, next) => {
    // Check if the user is authenticated and has a role
    // If the user is not authenticated, it will return an error with status 401 (Not authenticated)
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated'));
    }
    // Check if the user's role is in the list of allowed roles
    // If the user's role is not allowed, it will return an error with status 403 (Forbidden)
    if (!allowed.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }
    next();
  };
}

module.exports = { roleGuard };