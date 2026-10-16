import { Router } from 'express';
import { InternshipsController } from '../controllers/internshipsController.js';
import {
  validatePagination,
  validateCreateInternship,
  validateUpdateInternship,
} from '../validators/internshipValidator.js';
import { requireAdminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.get('/', validatePagination, InternshipsController.list);
router.get('/:id', InternshipsController.getById);
router.post('/', requireAdminAuth, validateCreateInternship, InternshipsController.create);
router.put('/:id', requireAdminAuth, validateUpdateInternship, InternshipsController.update);
router.delete('/:id', requireAdminAuth, InternshipsController.delete);

export default router;
