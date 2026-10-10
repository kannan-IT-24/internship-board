import { ValidationError } from '../utils/errors.js';

const ALLOWED_MODES = ['Remote', 'Hybrid', 'On-site'];

/**
 * Validates pagination query parameters for list endpoints.
 */
export function validatePagination(req, res, next) {
  let { page = 1, limit = 10 } = req.query;

  // Validate page
  if (typeof page === 'string') {
    if (!/^\d+$/.test(page.trim())) {
      return next(new ValidationError('Page parameter must be a positive integer.'));
    }
    page = parseInt(page, 10);
  } else if (typeof page !== 'number' || !Number.isInteger(page)) {
    return next(new ValidationError('Page parameter must be a positive integer.'));
  }

  if (page < 1) {
    return next(new ValidationError('Page parameter must be at least 1.'));
  }

  // Validate limit
  if (typeof limit === 'string') {
    if (!/^\d+$/.test(limit.trim())) {
      return next(new ValidationError('Limit parameter must be an integer between 1 and 100.'));
    }
    limit = parseInt(limit, 10);
  } else if (typeof limit !== 'number' || !Number.isInteger(limit)) {
    return next(new ValidationError('Limit parameter must be an integer between 1 and 100.'));
  }

  if (limit < 1 || limit > 100) {
    return next(new ValidationError('Limit parameter must be between 1 and 100.'));
  }

  req.pagination = { page, limit };
  next();
}

/**
 * Validates request body for creating a new internship.
 */
export function validateCreateInternship(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return next(new ValidationError('Request body must be a valid JSON object.'));
  }

  const { id, title, domain, mode, duration_weeks, applications_open } = body;

  // Check ID
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(new ValidationError('Internship ID is required and must be a non-empty string.'));
  }
  if (id.trim().length > 50) {
    return next(new ValidationError('Internship ID must not exceed 50 characters.'));
  }

  // Check Title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new ValidationError('Internship title is required and must be a non-empty string.'));
  }
  if (title.trim().length > 150) {
    return next(new ValidationError('Internship title must not exceed 150 characters.'));
  }

  // Check Domain
  if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
    return next(new ValidationError('Domain is required and must be a non-empty string.'));
  }
  if (domain.trim().length > 100) {
    return next(new ValidationError('Domain must not exceed 100 characters.'));
  }

  // Check Mode
  if (!mode || typeof mode !== 'string' || !ALLOWED_MODES.includes(mode.trim())) {
    return next(
      new ValidationError(`Mode is required and must be one of: ${ALLOWED_MODES.join(', ')}.`)
    );
  }

  // Check Duration Weeks
  if (
    duration_weeks === undefined ||
    duration_weeks === null ||
    !Number.isInteger(Number(duration_weeks)) ||
    Number(duration_weeks) <= 0
  ) {
    return next(new ValidationError('duration_weeks must be a positive integer greater than 0.'));
  }
  if (Number(duration_weeks) > 104) {
    return next(new ValidationError('duration_weeks cannot exceed 104 weeks (2 years).'));
  }

  // Check applications_open
  let normalizedOpen = 1;
  if (applications_open !== undefined && applications_open !== null) {
    if (applications_open === 0 || applications_open === 1) {
      normalizedOpen = applications_open;
    } else if (typeof applications_open === 'boolean') {
      normalizedOpen = applications_open ? 1 : 0;
    } else {
      return next(new ValidationError('applications_open must be 0, 1, true, or false.'));
    }
  }

  req.sanitizedBody = {
    id: id.trim(),
    title: title.trim(),
    domain: domain.trim(),
    mode: mode.trim(),
    duration_weeks: Number(duration_weeks),
    applications_open: normalizedOpen,
  };

  next();
}

/**
 * Validates request body for updating an existing internship.
 */
export function validateUpdateInternship(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return next(new ValidationError('Request body must be a valid JSON object.'));
  }

  const { title, domain, mode, duration_weeks, applications_open } = body;

  // Check Title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new ValidationError('Internship title is required and must be a non-empty string.'));
  }
  if (title.trim().length > 150) {
    return next(new ValidationError('Internship title must not exceed 150 characters.'));
  }

  // Check Domain
  if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
    return next(new ValidationError('Domain is required and must be a non-empty string.'));
  }
  if (domain.trim().length > 100) {
    return next(new ValidationError('Domain must not exceed 100 characters.'));
  }

  // Check Mode
  if (!mode || typeof mode !== 'string' || !ALLOWED_MODES.includes(mode.trim())) {
    return next(
      new ValidationError(`Mode is required and must be one of: ${ALLOWED_MODES.join(', ')}.`)
    );
  }

  // Check Duration Weeks
  if (
    duration_weeks === undefined ||
    duration_weeks === null ||
    !Number.isInteger(Number(duration_weeks)) ||
    Number(duration_weeks) <= 0
  ) {
    return next(new ValidationError('duration_weeks must be a positive integer greater than 0.'));
  }
  if (Number(duration_weeks) > 104) {
    return next(new ValidationError('duration_weeks cannot exceed 104 weeks (2 years).'));
  }

  // Check applications_open
  let normalizedOpen = 1;
  if (applications_open !== undefined && applications_open !== null) {
    if (applications_open === 0 || applications_open === 1) {
      normalizedOpen = applications_open;
    } else if (typeof applications_open === 'boolean') {
      normalizedOpen = applications_open ? 1 : 0;
    } else {
      return next(new ValidationError('applications_open must be 0, 1, true, or false.'));
    }
  }

  req.sanitizedBody = {
    title: title.trim(),
    domain: domain.trim(),
    mode: mode.trim(),
    duration_weeks: Number(duration_weeks),
    applications_open: normalizedOpen,
  };

  next();
}
