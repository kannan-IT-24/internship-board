/**
 * Centralized error-handling middleware.
 * Formats errors into the standardized API error envelope:
 * {
 *   "status": "error",
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human-readable explanation"
 *   }
 * }
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || (err.status && Number.isInteger(err.status) ? err.status : 500);

  // Map known SQLite errors to user-safe error responses
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred.';

  // Handle SQLite constraint violations safely without leaking internal schema or raw queries
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    code = 'CONFLICT';
    message = 'A record with the specified unique values already exists.';
  } else if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
    code = 'CONFLICT';
    message = 'Referenced resource does not exist or has related dependencies.';
  }

  // Do not expose stack traces or raw SQL in client responses
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    code = 'INTERNAL_SERVER_ERROR';
    message = 'An unexpected internal server error occurred.';
  }

  // Log non-sensitive error summary (prevent applicant PII leakage)
  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.message);
  }

  res.status(statusCode).json({
    status: 'error',
    error: {
      code,
      message,
    },
  });
}

/**
 * 404 Route Not Found middleware
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} was not found.`,
    },
  });
}
