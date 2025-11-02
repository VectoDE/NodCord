import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import authMiddleware from '@/middlewares/authentication.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

router.use(authMiddleware(true)); // Nur Admins sollen Wartungen anlegen dürfen
router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// 🛠️ Interne Seite zur Erstellung neuer Wartungsseiten
router.get('/', (_req: Request, res: Response) => {
  try {
    res.render('maintenance/maintenanceCreate', {
      logoImage: '/assets/img/logo.png',
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
    });
  } catch (error: any) {
    logger.error('Error rendering /maintenance-create', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler',
      errormessage: 'Fehler beim Laden der Wartungserstellungsseite.',
      errorstatus: 500,
      errorstack: error.message,
    });
  }
});

export default router;
