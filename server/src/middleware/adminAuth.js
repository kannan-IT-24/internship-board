import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Middleware protecting administrative mutation endpoints (POST, PUT, DELETE).
 *
 * Rules:
 * 1. If ADMIN_API_KEY is configured in environment:
 *    - Validates incoming `x-api-key` header or `Authorization: Bearer <token>`.
 *    - Rejects with 401 Unauthorized if missing or invalid.
 * 2. If ADMIN_API_KEY is not configured:
 *    - In production (NODE_ENV === 'production'): administrative mutations are safely disabled (403 Forbidden).
 *    - In non-production (development/test): requests pass through to facilitate automated testing.
 */
export function requireAdminAuth(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (configuredKey) {
    const apiKeyHeader = req.headers['x-api-key'];
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    const providedKey = apiKeyHeader || bearerToken;

    if (!providedKey || providedKey !== configuredKey) {
      return next(
        new UnauthorizedError(
          'Valid admin credentials required for this administrative operation.'
        )
      );
    }

    return next();
  }

  // If ADMIN_API_KEY is not configured in production, disable mutations to prevent open public writes
  if (process.env.NODE_ENV === 'production') {
    return next(
      new ForbiddenError(
        'Administrative operations are disabled in production unless ADMIN_API_KEY is configured.'
      )
    );
  }

  // Development/Test mode with no key configured: allow
  next();
}
