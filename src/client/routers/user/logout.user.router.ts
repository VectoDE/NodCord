import express from 'express';
import type { Request, Response } from 'express';
import logger from '@/services/logger.service';

const router = express.Router();

router.get('/:username/logout-all-sessions', (req: Request, res: Response) => {
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;
  if (!isAuthenticated) return res.redirect('/login');

  req.logout((error?: unknown) => {
    if (error) {
      logger.error('Error logging out', { error });
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred while logging out.';
      res.status(500).render('error', {
        errortitle: 'Logout Error',
        errormessage: message,
        errorstack: error instanceof Error ? error.stack : undefined,
      });
      return;
    }
    res.redirect('/login');
  });
});

export default router;
