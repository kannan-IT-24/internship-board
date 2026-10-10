import { ApplicationService } from '../services/applicationService.js';

export class ApplicationsController {
  static create(req, res, next) {
    try {
      const data = ApplicationService.submitApplication(
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

  static list(req, res, next) {
    try {
      const { page, limit } = req.pagination;
      const result = ApplicationService.listApplications(
        { page, limit },
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
}
