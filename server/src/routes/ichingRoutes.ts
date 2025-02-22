import { Router } from 'express';
import { getIChingDivination } from '../controllers/ichingController';

const router = Router();

router.post('/divination', async (req, res) => {
  await getIChingDivination(req, res);
});

export default router; 