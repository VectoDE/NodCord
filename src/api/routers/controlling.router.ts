import { Router } from 'express';

import {
  fetchStatusSummary,
  fetchLiveness,
  fetchReadiness,
  fetchCloudNetStatus,
} from '@/api/controllers/controlling.controller';
import { routerLimiter } from '@/middlewares/httpRateLimit.middleware';
import { requireAuth } from '@/middlewares/authentication.middleware';

const router = Router();

router.use(routerLimiter);

router.get('/summary', requireAuth(), fetchStatusSummary);
router.get('/liveness', fetchLiveness);
router.get('/readiness', fetchReadiness);
router.get('/cloudnet', requireAuth(), fetchCloudNetStatus);

export default router;
