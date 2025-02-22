import express from 'express';
import { getStats, incrementPageView } from '../controllers/statsController';

const router = express.Router();

router.get('/', getStats);
router.post('/increment', incrementPageView);

export default router; 