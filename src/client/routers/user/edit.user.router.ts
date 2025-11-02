import express from 'express';
import type { Request, Response } from 'express';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

router.get('/:username/edit', async (req: Request, res: Response) => {
  const username = (req.params as Record<string, string>)['username'];
  const currentUser = req.user;
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;

  if (!isAuthenticated || !currentUser) return res.redirect('/login');

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.id !== currentUser.id)
      return res.status(403).render('error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Access Denied',
        errormessage: 'You are not authorized to edit this profile.',
        errorstatus: 403,
      });

    res.render('userprofile/editProfile', {
      user,
      isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentUser,
    });
  } catch (error: any) {
    logger.error('Error fetching profile for editing', { error });
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the profile for editing.',
      errorstatus: 500,
      errorstack: error.stack,
      currentUser,
    });
  }
});

export default router;
