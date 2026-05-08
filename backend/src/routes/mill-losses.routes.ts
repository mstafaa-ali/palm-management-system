import { Router } from 'express';
import {
  getAllLosses,
  createLoss,
  updateLoss,
  deleteLoss,
  getLossesSummary,
} from '../controllers/mill-losses.controller';

const router = Router();

// IMPORTANT: /summary harus didaftarkan SEBELUM /:id
router.get('/summary', getLossesSummary);
router.get('/', getAllLosses);
router.post('/', createLoss);
router.put('/:id', updateLoss);
router.delete('/:id', deleteLoss);

export default router;
