import { AppError } from '../utils/AppError.js';


// Checks role
export function roleGuard(...allowed) {
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