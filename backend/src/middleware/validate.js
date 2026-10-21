import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';


//helps to validate the request body and return the first error if any validation fails
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const first = errors.array()[0];
  next(new AppError(400, first.msg));
}