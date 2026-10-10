import { Router } from 'express';
import { ApplicationsController } from '../controllers/applicationsController.js';
import { validateCreateApplication } from '../validators/applicationValidator.js';
import { validatePagination } from '../validators/internshipValidator.js';

const router = Router();

router.post('/', validateCreateApplication, ApplicationsController.create);
router.get('/', validatePagination, ApplicationsController.list);

export default router;
