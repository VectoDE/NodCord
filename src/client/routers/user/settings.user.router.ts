import express from 'express';
import type { Request, Response } from 'express';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

router.get('/:username/settings', async (req: Request, res: Response) => {
  const username = (req.params as Record<string, string>)['username'];
  const currentUser = req.user;
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;

  if (!isAuthenticated) return res.redirect('/login');

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).send('User not found');

    res.render('userprofile/settings', {
      user,
      logoImage: '/assets/img/logo.png',
      isAuthenticated,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentUser,
    });
  } catch (error: any) {
    logger.error('Error fetching user settings', { error });
    res.status(500).send('Internal server error');
  }
});

export default router;
