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

// /legal/eula
router.get('/', (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    res.render('legal/eula', {
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      currentUser,
    });
  } catch (error: any) {
    logger.error('Error rendering /legal/eula', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler',
      errormessage: 'Fehler beim Laden der Endbenutzer-Lizenzvereinbarung (EULA)',
      errorstack: error.message,
    });
  }
});

export default router;
