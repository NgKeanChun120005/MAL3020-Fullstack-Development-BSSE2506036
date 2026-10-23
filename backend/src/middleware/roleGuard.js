const { AppError } = require('../utils/AppError');

//check role of the user and allow access to the route if the role is allowed
function roleGuard(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated'));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }
    next();
  };
}

module.exports = { roleGuard };