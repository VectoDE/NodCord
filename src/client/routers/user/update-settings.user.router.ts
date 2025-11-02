import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

router.post('/:username/settings', async (req: Request, res: Response) => {
  const currentUser = req.user;
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;

  if (!isAuthenticated || !currentUser) return res.redirect('/login');

  try {
    const { email, password } = req.body as Record<string, string>;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    res.redirect(`/user/${currentUser.username}/settings`);
  } catch (error: unknown) {
    logger.error('Error updating settings', { error });
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while updating your settings.';
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: message,
      errorstatus: 500,
      errorstack: error instanceof Error ? error.stack : undefined,
      currentUser,
    });
  }
});

export default router;
