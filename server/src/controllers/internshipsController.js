import { InternshipService } from '../services/internshipService.js';

export class InternshipsController {
  static list(req, res, next) {
    try {
      const { page, limit } = req.pagination;
      const { q, domain, mode } = req.query;

      const result = InternshipService.listInternships(
        { page, limit, q, domain, mode },
        req.app.locals.db
      );

      res.status(200).json({
        status: 'success',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = InternshipService.getInternshipById(id, req.app.locals.db);

      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static create(req, res, next) {
    try {
      const data = InternshipService.createInternship(
        req.sanitizedBody,
        req.app.locals.db
      );

      res.status(201).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static update(req, res, next) {
    try {
      const { id } = req.params;
      const data = InternshipService.updateInternship(
        id,
        req.sanitizedBody,
        req.app.locals.db
      );

      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  static delete(req, res, next) {
    try {
      const { id } = req.params;
      const data = InternshipService.deleteInternship(id, req.app.locals.db);

      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}
