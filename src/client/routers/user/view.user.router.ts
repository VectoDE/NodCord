import express from 'express';
import type { Request, Response } from 'express';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

router.get('/:username', async (req: Request, res: Response) => {
  const username = (req.params as Record<string, string>)['username'];
  const currentUser = req.user;
  const currentTab = ((req.query as Record<string, string>)['tab'] ?? 'posts') as
    | 'posts'
    | 'projects'
    | 'friends';

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        posts: true,
        projects: true,
        friends: { include: { follower: true, followed: true } },
      },
    });

    if (!user)
      return res.status(404).render('error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'User Not Found',
        errormessage: 'The user you are looking for does not exist.',
        errorstatus: 404,
        currentUser,
      });

    const posts = currentTab === 'posts' ? (user.posts ?? []) : [];
    const projects = currentTab === 'projects' ? (user.projects ?? []) : [];
    const friends = currentTab === 'friends' ? user.friends.map((f: any) => f.followed) : [];

    res.render('userprofile/profile', {
      user,
      currentUser,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentTab,
      posts,
      projects,
      friends,
    });
  } catch (error: any) {
    logger.error('Error fetching user profile', { error });
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the user profile.',
      errorstatus: 500,
      errorstack: error.stack,
      currentUser,
    });
  }
});

export default router;
