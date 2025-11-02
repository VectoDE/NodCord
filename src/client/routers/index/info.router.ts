import express from 'express';
import type { Request, Response } from 'express';
import logger from '@/services/logger.service';
import infoService from '@/utils/info.util';
import monitorService from '@/services/monitor.service';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const botInfo = await infoService.getBotInfo();
    const systemInfo = await infoService.getSystemInfo();
    const apiInfo = await infoService.getApiInfo();
    const monitor = await monitorService.getStatusSummary(req.app);

    res.render('index/info', {
      bot: botInfo,
      system: systemInfo,
      api: apiInfo,
      monitor,
      logoImage: '/assets/img/logo.png',
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
    });
  } catch (error: any) {
    logger.error('Error fetching info', { error });
    res.status(500).send('Internal Server Error');
  }
});

export default router;
