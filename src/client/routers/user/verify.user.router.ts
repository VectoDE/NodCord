import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '@/client/lib/prisma';
import { sendRegistrationVerificationEmail } from '@/services/nodemailer.service';
import logger from '@/services/logger.service';

const router = express.Router();

router.get(':username/send-verification', async (req: Request, res: Response) => {
  const currentUser = req.user;
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;

  if (!isAuthenticated || !currentUser) return res.redirect('/login');

  try {
    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user) return res.status(404).render('error', { errortitle: 'User not found' });

    if (user.isVerified) {
      return res.redirect(`/user/${user.username}/settings`);
    }

    const token = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationTokenExpires: new Date(Date.now() + 3_600_000),
      },
    });

    await sendRegistrationVerificationEmail(user.email, user.username, token);
    res.redirect(`/user/${user.username}/settings`);
  } catch (error: unknown) {
    logger.error('Error sending verification email', { error });
    const message = error instanceof Error ? error.message : 'Failed to send verification email.';
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Error',
      errormessage: message,
    });
  }
});

export default router;
