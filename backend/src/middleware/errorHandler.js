// errorHandler.js catches runtime errors and unexpected crashes.

function errorHandler(err, req, res, _next) {
  // Mongoose validation errors -> 400
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ error: first.message });
  }

  // Mongoose bad ObjectId cast -> 400
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Mongo duplicate key -> 409
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key' });
  }

  const status = err.status || 500;
  const isOperational = err.isOperational === true;

  if (!isOperational) {
    console.error('Unexpected error:', err);
  }

  res.status(status).json({
    error: isOperational ? err.message : 'Internal server error'
  });
}

module.exports = { errorHandler };