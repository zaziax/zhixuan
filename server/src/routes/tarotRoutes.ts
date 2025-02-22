import { Router } from 'express';
import { getTarotReading } from '../controllers/tarotController';

const router = Router();

router.post('/reading', getTarotReading);

export default router; 