import { ValidationError } from '../utils/errors.js';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates request body for submitting a job application.
 */
export function validateCreateApplication(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return next(new ValidationError('Request body must be a valid JSON object.'));
  }

  const { internship_id, applicant_name, applicant_email } = body;

  // Validate internship_id
  if (!internship_id || typeof internship_id !== 'string' || internship_id.trim().length === 0) {
    return next(new ValidationError('internship_id is required and cannot be empty.'));
  }
  if (internship_id.trim().length > 50) {
    return next(new ValidationError('internship_id cannot exceed 50 characters.'));
  }

  // Validate applicant_name
  if (!applicant_name || typeof applicant_name !== 'string' || applicant_name.trim().length === 0) {
    return next(new ValidationError('applicant_name is required and cannot be empty.'));
  }
  const trimmedName = applicant_name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return next(new ValidationError('applicant_name must be between 2 and 100 characters.'));
  }

  // Validate applicant_email
  if (!applicant_email || typeof applicant_email !== 'string' || applicant_email.trim().length === 0) {
    return next(new ValidationError('applicant_email is required and cannot be empty.'));
  }
  const trimmedEmail = applicant_email.trim().toLowerCase();
  if (trimmedEmail.length > 255 || !EMAIL_REGEX.test(trimmedEmail)) {
    return next(new ValidationError('applicant_email must be a valid email address.'));
  }

  req.sanitizedBody = {
    internship_id: internship_id.trim(),
    applicant_name: trimmedName,
    applicant_email: trimmedEmail,
  };

  next();
}
