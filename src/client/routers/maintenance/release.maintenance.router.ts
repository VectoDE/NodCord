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

// 🚀 Release-Wartung mit vollständigen Informationen
router.get('/', (_req: Request, res: Response) => {
  try {
    res.render('maintenance/maintenanceRelease', {
      title: 'Release-Wartung',
      description: 'Wir führen Wartungsarbeiten für unser nächstes großes Release durch.',
      startDate: '25. August 2024',
      startTime: '10:00 AM',
      endDate: '31. December 2024',
      endTime: '02:00 PM',
      discord: 'https://discord.gg/example',
      twitter: 'https://twitter.com/example',
      facebook: 'https://facebook.com/example',
      preview: 'Hier ist eine Vorschau auf die neuen Funktionen, die wir veröffentlichen werden...',
      endDateTime: '2024-12-31T23:59:59',
    });
  } catch (error: any) {
    logger.error('Error rendering /maintenance-release', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler',
      errormessage: 'Ein Fehler ist beim Laden der Seite für die Release-Wartung aufgetreten.',
      errorstatus: 500,
      errorstack: error.message,
    });
  }
});

export default router;
