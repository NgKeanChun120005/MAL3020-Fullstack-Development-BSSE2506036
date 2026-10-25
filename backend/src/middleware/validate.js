const { validationResult } = require('express-validator');
const { AppError } = require('../utils/AppError');

//helps to validate the request body and return the first error if any validation fails
function validate(req, res, next) {
  const errors = validationResult(req);
  // If there are no validation errors, proceed to the next middleware or route handler
  if (errors.isEmpty()) return next();

  // If there are validation errors, extract the first error message and pass it to the error handling middleware
  const first = errors.array()[0];
  next(new AppError(400, first.msg));
}

module.exports = { validate };