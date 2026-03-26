'use strict';
const rateLimit = require('express-rate-limit');

/** Global: 60 req/min per IP — applied to all routes */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      60,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (_req, res) => {
    console.warn(`[${new Date().toISOString()}] [WARN]  [rateLimiter] Global rate limit exceeded`);
    res.status(429).json({
      error:  'Too many requests, please slow down.',
      code:   'RATE_LIMITED',
      status: 429,
    });
  },
});

/** Strict: 10 req/min per IP — applied only to POST /api/quiz/generate */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (_req, res) => {
    console.warn(`[${new Date().toISOString()}] [WARN]  [rateLimiter] AI rate limit exceeded`);
    res.status(429).json({
      error:  'AI quiz generation limit reached — try again in a minute.',
      code:   'RATE_LIMITED',
      status: 429,
    });
  },
});

module.exports = { globalLimiter, aiLimiter };
