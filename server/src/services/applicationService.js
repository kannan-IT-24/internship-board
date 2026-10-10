import { getDb } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export class ApplicationService {
  /**
   * Submits a new internship application.
   * Validates target internship existence, open application status, and duplicate prevention.
   */
  static submitApplication(
    { internship_id, applicant_name, applicant_email },
    db = getDb()
  ) {
    // 1. Verify internship existence and open status
    const internship = db
      .prepare('SELECT id, title, applications_open FROM internships WHERE id = ?')
      .get(internship_id);

    if (!internship) {
      throw new NotFoundError(`Internship with ID '${internship_id}' does not exist.`);
    }

    if (internship.applications_open === 0) {
      throw new ConflictError(
        `Applications for internship '${internship_id}' (${internship.title}) are currently closed.`
      );
    }

    // 2. Application-level check for duplicate application
    const existing = db
      .prepare(
        'SELECT id FROM applications WHERE internship_id = ? AND applicant_email = ?'
      )
      .get(internship_id, applicant_email);

    if (existing) {
      throw new ConflictError(
        `You have already submitted an application for internship '${internship_id}' with email '${applicant_email}'.`
      );
    }

    // 3. Database insert using parameterized query
    try {
      const insertSql = `
        INSERT INTO applications (internship_id, applicant_name, applicant_email)
        VALUES (?, ?, ?)
      `;
      const result = db
        .prepare(insertSql)
        .run(internship_id, applicant_name, applicant_email);

      const insertedId = result.lastInsertRowid;
      const createdRecord = db
        .prepare(
          'SELECT id, internship_id, applicant_name, applicant_email, created_at FROM applications WHERE id = ?'
        )
        .get(insertedId);

      return createdRecord;
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        throw new ConflictError(
          `You have already submitted an application for internship '${internship_id}' with email '${applicant_email}'.`
        );
      }
      throw err;
    }
  }

  /**
   * Retrieves a paginated list of applications (for development/demonstration inspection).
   */
  static listApplications({ page = 1, limit = 10 } = {}, db = getDb()) {
    const totalRow = db.prepare('SELECT COUNT(*) AS total FROM applications').get();
    const total = totalRow ? Number(totalRow.total) : 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    const offset = (page - 1) * limit;
    const selectSql = `
      SELECT id, internship_id, applicant_name, applicant_email, created_at
      FROM applications
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
    const data = db.prepare(selectSql).all(limit, offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
