import { Router } from 'express';
import {
  getAllProductions,
  createProduction,
  updateProduction,
  deleteProduction,
  getRendemenSummary
} from '../controllers/mill-production.controller';

const router = Router();

router.get('/', getAllProductions);
router.post('/', createProduction);
router.get('/summary', getRendemenSummary);
router.put('/:id', updateProduction);
router.delete('/:id', deleteProduction);

export default router;
