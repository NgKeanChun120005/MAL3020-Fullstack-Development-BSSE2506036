export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const isOperational = err.isOperational === true;

  // Log unexpected errors
  if (!isOperational) {
    console.error('Unexpected error:', err);
  }

  res.status(status).json({
    error: isOperational ? err.message : 'Internal server error'
  });
}