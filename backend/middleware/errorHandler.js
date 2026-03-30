const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}:`, err.message);

  let status  = err.statusCode || 500;
  let message = err.message    || 'Internal Server Error';

  // PostgreSQL constraint violations
  if (err.code === '23505') { status = 409; message = 'A record with this value already exists.'; }
  if (err.code === '23503') { status = 400; message = 'Referenced record does not exist.'; }
  if (err.code === '23514') { status = 400; message = 'Value violates check constraint.'; }
  if (err.code === '22P02') { status = 400; message = 'Invalid UUID format.'; }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };