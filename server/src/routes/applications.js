import { Router } from 'express';
import { ApplicationsController } from '../controllers/applicationsController.js';
import { validateCreateApplication } from '../validators/applicationValidator.js';
import { validatePagination } from '../validators/internshipValidator.js';

/**
 * Creates the applications router with an injected rate limiter.
 * Using a factory allows each app instance (including test instances)
 * to receive its own rate limiter with an independent counter store,
 * preventing state leakage between test cases.
 *
 * @param {import('express').RequestHandler} submitLimiter – rate limiter for POST /
 * @returns {import('express').Router}
 */
export function createApplicationsRouter(submitLimiter) {
  const router = Router();

  // POST /api/applications — strict per-IP rate limit to prevent spam submissions
  router.post(
    '/',
    submitLimiter,
    validateCreateApplication,
    ApplicationsController.create
  );

  // GET /api/applications — paginated list (general limiter from app.js applies)
  router.get('/', validatePagination, ApplicationsController.list);

  return router;
}

// Default export for direct import convenience (uses a noop limiter placeholder)
// The real limiter is always injected from createApp(); this is only a fallback.
export default createApplicationsRouter((req, res, next) => next());
