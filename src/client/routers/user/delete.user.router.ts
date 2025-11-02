import express from 'express';
import type { Request, Response } from 'express';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

router.post('/delete-account', async (req: Request, res: Response) => {
  const currentUser = req.user;
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;

  if (!isAuthenticated || !currentUser) return res.redirect('/login');

  try {
    await prisma.user.delete({ where: { id: currentUser.id } });
    req.logout((error?: unknown) => {
      if (error) {
        logger.error('Error logging out after account deletion', { error });
      }
      res.redirect('/');
    });
  } catch (error: unknown) {
    logger.error('Error deleting account', { error });
    const message =
      error instanceof Error ? error.message : 'An error occurred while deleting your account.';
    res.status(500).render('error', {
      errortitle: 'Account Deletion Error',
      errormessage: message,
    });
  }
});

export default router;
