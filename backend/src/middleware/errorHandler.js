'use strict';

/**
 * Global error handler — must be registered last in the Express middleware chain.
 * Returns structured JSON errors matching the APIDocs error format.
 */
function errorHandler(err, req, res, _next) {
  const ts = new Date().toISOString();

  // Known application errors forwarded via next(err)
  const status = err.status || err.statusCode || 500;
  const code   = err.code   || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  console.error(`[${ts}] [ERROR] [errorHandler] ${req.method} ${req.path} → ${status} ${code}: ${message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  res.status(status).json({
    error:  message,
    code:   code,
    status: status,
  });
}

module.exports = errorHandler;
