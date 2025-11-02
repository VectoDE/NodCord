import { Router } from 'express';

import {
  listBetaKeys,
  createBetaKey,
  updateBetaKey,
  deleteBetaKey,
  getBetaSystem,
  updateBetaSystem,
} from '@/api/controllers/beta.controller';
import { requireAuth } from '@/middlewares/authentication.middleware';

const router = Router();

router.get('/keys', requireAuth(), listBetaKeys);
router.post('/keys', requireAuth(), createBetaKey);
router.patch('/keys/:id', requireAuth(), updateBetaKey);
router.delete('/keys/:id', requireAuth(), deleteBetaKey);

router.get('/system', requireAuth(), getBetaSystem);
router.patch('/system', requireAuth(), updateBetaSystem);

export default router;
