import express from 'express';
import auth from '../middleware/auth.js';
import {
  addKeyword,
  getKeywords,
  getKeywordById,
  refreshKeyword,
  toggleTracking,
  deleteKeyword,
} from '../controllers/rankController.js';

const router = express.Router();

router.use(auth);

router.post('/', addKeyword);
router.get('/', getKeywords);
router.get('/:id', getKeywordById);
router.post('/:id/refresh', refreshKeyword);
router.patch('/:id/toggle', toggleTracking);
router.delete('/:id', deleteKeyword);

export default router;