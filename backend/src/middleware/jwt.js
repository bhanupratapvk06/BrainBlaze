'use strict';
const jwt = require('jsonwebtoken');

const SKIP_PATHS = ['/api/auth/login', '/health'];

/**
 * Verifies the HS256 JWT in the Authorization header.
 * Attaches req.student = { studentId, name, class } on success.
 * Skips verification for unauthenticated routes.
 */
function jwtMiddleware(req, res, next) {
  // Skip auth for login + health
  if (SKIP_PATHS.includes(req.path)) return next();

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authorization token required',
      code:  'AUTH_REQUIRED',
      status: 401,
    });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload    = jwt.verify(token, process.env.JWT_SECRET);
    req.student      = {
      studentId: payload.studentId,
      name:      payload.name,
      class:     payload.class,
    };
    console.log(`[${new Date().toISOString()}] [DEBUG] [jwt] Authenticated studentId=${req.student.studentId} path=${req.path}`);
    next();
  } catch (err) {
    console.warn(`[${new Date().toISOString()}] [WARN]  [jwt] Token verification failed: ${err.message}`);
    return res.status(401).json({
      error: 'Invalid or expired token',
      code:  'AUTH_REQUIRED',
      status: 401,
    });
  }
}

module.exports = jwtMiddleware;
