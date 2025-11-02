import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import authMiddleware from '@/middlewares/authentication.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

router.use(authMiddleware(false));
router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ⚙️ Update-Wartung mit geplantem Ende
router.get('/', (_req: Request, res: Response) => {
  try {
    res.render('maintenance/maintenanceUpdate', {
      endDate: '25. August 2024',
      endTime: '02:00 PM',
      discord: 'https://discord.gg/example',
      twitter: 'https://twitter.com/example',
      facebook: 'https://facebook.com/example',
    });
  } catch (error: any) {
    logger.error('Error rendering /maintenance-update', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler',
      errormessage: 'Ein Fehler ist beim Laden der Wartungsseite für Updates aufgetreten.',
      errorstatus: 500,
      errorstack: error.message,
    });
  }
});

export default router;
