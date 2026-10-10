import { getDb } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export class InternshipService {
  /**
   * Retrieves a paginated and filtered list of internships.
   * Parameterized queries ensure safe execution against SQL injection.
   */
  static listInternships({ page = 1, limit = 10, q, domain, mode } = {}, db = getDb()) {
    let whereClauses = [];
    let params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClauses.push('(id LIKE ? OR title LIKE ? OR domain LIKE ? OR mode LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (domain && domain.trim() && domain.trim() !== 'All Domains') {
      whereClauses.push('domain = ?');
      params.push(domain.trim());
    }

    if (mode && mode.trim() && mode.trim() !== 'All Modes') {
      whereClauses.push('mode = ?');
      params.push(mode.trim());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Calculate total matching records
    const countQuery = `SELECT COUNT(*) AS total FROM internships ${whereSql}`;
    const totalRow = db.prepare(countQuery).get(...params);
    const total = totalRow ? Number(totalRow.total) : 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    // Fetch paginated records
    const offset = (page - 1) * limit;
    const selectQuery = `
      SELECT id, title, domain, mode, duration_weeks, applications_open
      FROM internships
      ${whereSql}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `;
    const data = db.prepare(selectQuery).all(...params, limit, offset);

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

  /**
   * Retrieves a single internship by ID.
   */
  static getInternshipById(id, db = getDb()) {
    const query = `
      SELECT id, title, domain, mode, duration_weeks, applications_open
      FROM internships
      WHERE id = ?
    `;
    const record = db.prepare(query).get(id);

    if (!record) {
      throw new NotFoundError(`Internship with ID '${id}' was not found.`);
    }

    return record;
  }

  /**
   * Creates a new internship.
   */
  static createInternship(data, db = getDb()) {
    const existing = db.prepare('SELECT id FROM internships WHERE id = ?').get(data.id);
    if (existing) {
      throw new ConflictError(`Internship with ID '${data.id}' already exists.`);
    }

    const insertSql = `
      INSERT INTO internships (id, title, domain, mode, duration_weeks, applications_open)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.prepare(insertSql).run(
      data.id,
      data.title,
      data.domain,
      data.mode,
      data.duration_weeks,
      data.applications_open
    );

    return this.getInternshipById(data.id, db);
  }

  /**
   * Updates an existing internship.
   */
  static updateInternship(id, data, db = getDb()) {
    // Ensure record exists
    this.getInternshipById(id, db);

    const updateSql = `
      UPDATE internships
      SET title = ?, domain = ?, mode = ?, duration_weeks = ?, applications_open = ?
      WHERE id = ?
    `;
    db.prepare(updateSql).run(
      data.title,
      data.domain,
      data.mode,
      data.duration_weeks,
      data.applications_open,
      id
    );

    return this.getInternshipById(id, db);
  }

  /**
   * Deletes an internship, verifying no applications exist.
   */
  static deleteInternship(id, db = getDb()) {
    // Ensure record exists
    this.getInternshipById(id, db);

    // Safeguard related applications
    const countRow = db
      .prepare('SELECT COUNT(*) AS appCount FROM applications WHERE internship_id = ?')
      .get(id);

    const appCount = countRow ? Number(countRow.appCount) : 0;
    if (appCount > 0) {
      throw new ConflictError(
        `Cannot delete internship '${id}' because ${appCount} active application(s) exist for it.`
      );
    }

    db.prepare('DELETE FROM internships WHERE id = ?').run(id);

    return { id, deleted: true };
  }
}
