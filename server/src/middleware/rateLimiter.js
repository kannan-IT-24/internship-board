import { rateLimit } from 'express-rate-limit';

/**
 * Creates the general API rate limiter.
 * Configurable via environment variables:
 *   RATE_LIMIT_WINDOW_MS  – rate-limit window in milliseconds (default: 15 min)
 *   RATE_LIMIT_MAX        – max requests per window (default: 200)
 */
export function createGeneralLimiter() {
  return rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
    standardHeaders: 'draft-8', // Emit RateLimit-* response headers per draft-8 spec
    legacyHeaders: false,
    message: {
      status: 'error',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait before trying again.',
      },
    },
    skipSuccessfulRequests: false,
  });
}

/**
 * Creates the strict rate limiter for POST /api/applications.
 * Configurable via environment variables:
 *   APPLY_RATE_LIMIT_WINDOW_MS – sliding window in milliseconds (default: 15 min)
 *   APPLY_RATE_LIMIT_MAX       – max submissions per window (default: 10)
 */
export function createApplicationSubmitLimiter() {
  return rateLimit({
    windowMs: Number(process.env.APPLY_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.APPLY_RATE_LIMIT_MAX) || 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      status: 'error',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message:
          'Too many application submissions from this IP. Please wait before submitting again.',
      },
    },
    skipSuccessfulRequests: false,
  });
}
