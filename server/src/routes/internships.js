import { Router } from 'express';
import { InternshipsController } from '../controllers/internshipsController.js';
import {
  validatePagination,
  validateCreateInternship,
  validateUpdateInternship,
} from '../validators/internshipValidator.js';

const router = Router();

router.get('/', validatePagination, InternshipsController.list);
router.get('/:id', InternshipsController.getById);
router.post('/', validateCreateInternship, InternshipsController.create);
router.put('/:id', validateUpdateInternship, InternshipsController.update);
router.delete('/:id', InternshipsController.delete);

export default router;
