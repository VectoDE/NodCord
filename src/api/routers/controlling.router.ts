import { Router } from 'express';

import {
  fetchStatusSummary,
  fetchLiveness,
  fetchReadiness,
  fetchCloudNetStatus,
} from '@/api/controllers/controlling.controller';
import { requireAuth } from '@/middlewares/authentication.middleware';

const router = Router();

router.get('/summary', requireAuth(), fetchStatusSummary);
router.get('/liveness', fetchLiveness);
router.get('/readiness', fetchReadiness);
router.get('/cloudnet', requireAuth(), fetchCloudNetStatus);

export default router;
