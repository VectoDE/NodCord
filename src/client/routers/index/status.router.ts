import express from 'express';
import type { Request, Response } from 'express';
import logger from '@/services/logger.service';
import monitorService from '@/services/monitor.service';
import pm2Service from '@/services/pm2.service';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const monitor = await monitorService.getStatusSummary(req.app);
    const processes = await pm2Service.listProcesses();

    res.render('index/status', {
      logoImage: '/assets/img/logo.png',
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      monitor,
      processes,
    });
  } catch (error: any) {
    logger.error('Error fetching status', { error });
    res.status(500).send('Internal Server Error');
  }
});

export default router;
