const { validationResult } = require('express-validator');
const { AppError } = require('../utils/AppError');

//helps to validate the request body and return the first error if any validation fails
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const first = errors.array()[0];
  next(new AppError(400, first.msg));
}

module.exports = { validate };