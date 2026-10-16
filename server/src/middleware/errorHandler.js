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

  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred.';

  if (err.type === 'entity.parse.failed') {
    code = 'INVALID_JSON';
    message = 'Request body must contain valid JSON.';
  } else if (err.type === 'entity.too.large') {
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body exceeds the allowed size.';
  }

  // Handle SQLite constraint violations safely without leaking internal schema or raw queries
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    code = 'CONFLICT';
    message = 'A record with the specified unique values already exists.';
  } else if (err.message && err.message.includes('FOREIGN KEY constraint failed')) {
    code = 'CONFLICT';
    message = 'Referenced resource does not exist or has related dependencies.';
  }

  // Never expose internal error details, regardless of deployment environment.
  if (statusCode >= 500) {
    code = 'INTERNAL_SERVER_ERROR';
    message = 'An unexpected internal server error occurred.';
  }

  // Avoid logging error messages and query strings, which may contain user data.
  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} (${err.code || 'UNKNOWN'})`);
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
