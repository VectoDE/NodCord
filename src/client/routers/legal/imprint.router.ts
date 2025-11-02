import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import authMiddleware from '@/middlewares/authentication.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

// Middleware
router.use(authMiddleware(false));
router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// /legal/imprint
router.get('/', (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    res.render('legal/imprint', {
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      currentUser,
    });
  } catch (error: any) {
    logger.error('Error rendering /legal/imprint', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler',
      errormessage: 'Fehler beim Laden des Impressums',
      errorstack: error.message,
    });
  }
});

export default router;
