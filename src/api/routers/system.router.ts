import { Router } from 'express';
import { performance } from 'node:perf_hooks';

import { requireApiKey } from '@/middlewares/apiKeyMiddleware';
import { standardResponse } from '@/utils/response.util';

const router = Router();

router.get('/health', (_req, res) =>
  standardResponse(
    res,
    200,
    {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    'OK',
  ),
);

router.get(
  '/metrics',
  requireApiKey({ rateLimit: false }),
  (_req, res) => {
    const used = process.memoryUsage();
    return standardResponse(
      res,
      200,
      {
        rss: used.rss,
        heapUsed: used.heapUsed,
        eventLoopLagMs: Math.round(performance.now() % 1000),
      },
      'Metrics',
    );
  },
);

export default router;
