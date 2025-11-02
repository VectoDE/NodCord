import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'public/uploads/profilePictures/'),
  filename: (req, file, cb) => {
    const username = req.user?.username ?? 'unknown';
    cb(null, `${username}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.post(
  '/:username/edit',
  upload.single('profilePicture'),
  async (req: Request, res: Response) => {
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

      const { fullname, email, bio, socialLinks } = req.body as Record<string, string>;
      const profilePicture = req.file
        ? `/uploads/profilePictures/${req.file.filename}`
        : user.profilePicture;

      await prisma.user.update({
        where: { username },
        data: { fullname, email, bio, socialLinks, profilePicture },
      });

      res.redirect(`/user/${username}`);
    } catch (error: any) {
      logger.error('Error updating user profile', { error });
      res.status(500).render('error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Internal Server Error',
        errormessage: 'An unexpected error occurred while updating the user profile.',
        errorstatus: 500,
        errorstack: error.stack,
        currentUser,
      });
    }
  },
);

export default router;
