'use strict';

/**
 * Higher-order function: accepts a Zod schema and returns Express middleware
 * that validates req.body, req.params, and req.query against it.
 *
 * Usage:
 *   router.post('/login', zodValidate(loginSchema), handler)
 */
function zodValidate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body:   req.body,
      params: req.params,
      query:  req.query,
    });

    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      console.warn(`[${new Date().toISOString()}] [WARN]  [zodValidate] Validation failed: ${issues}`);
      return res.status(400).json({
        error:  `Validation error: ${issues}`,
        code:   'VALIDATION_ERROR',
        status: 400,
      });
    }

    // Attach parsed data back so handlers don't need to re-parse
    req.validated = result.data;
    next();
  };
}

module.exports = zodValidate;
