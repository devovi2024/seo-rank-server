import express from 'express';
import auth from '../middleware/auth.js';
import {
  analyzeUrl,
  getAnalysisList,
  getAnalysisById,
  deleteAnalysis,
} from '../controllers/analysisController.js';

const router = express.Router();

router.use(auth);

router.post('/analyze', analyzeUrl);
router.get('/list', getAnalysisList);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

export default router;