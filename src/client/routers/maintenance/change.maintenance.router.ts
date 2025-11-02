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

// 🧩 Änderungen im Wartungsmodus
router.get('/', (_req: Request, res: Response) => {
  try {
    res.render('maintenance/maintenanceChange', {
      discord: 'https://discord.gg/example',
      twitter: 'https://twitter.com/example',
      facebook: 'https://facebook.com/example',
    });
  } catch (error: any) {
    logger.error('Error rendering /maintenance-change', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler',
      errormessage: 'Ein Fehler ist beim Laden der Seite für Wartungsänderungen aufgetreten.',
      errorstatus: 500,
      errorstack: error.message,
    });
  }
});

export default router;
