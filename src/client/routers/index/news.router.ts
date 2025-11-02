import express from 'express';
import type { Request, Response } from 'express';
import prisma from '@/client/lib/prisma';
import logger from '@/services/logger.service';

const router = express.Router();

// Blog Overview
router.get('/', async (_req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: { tagRecords: true, metadataRecords: true },
    });
    res.render('index/blog', {
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      blogs,
      errorstack: null,
    });
  } catch (error: any) {
    logger.error('Error fetching blog posts', { error });
    res.status(500).render('index/blog', {
      blogs: [],
      logoImage: '/assets/img/logo.png',
      errorstack: error.message,
    });
  }
});

// Blog Details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const blogId = (req.params as Record<string, string>)['id'];
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: { comments: true, tagRecords: true, metadataRecords: true },
    });

    if (!blog) {
      return res.status(404).render('index/blogPost', {
        blog: null,
        logoImage: '/assets/img/logo.png',
        errorstack: 'Blog-Post nicht gefunden.',
      });
    }

    res.render('index/blogPost', {
      blog,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
    });
  } catch (error: any) {
    logger.error('Error fetching blog post', { error });
    res.status(500).render('index/blogPost', {
      blog: null,
      logoImage: '/assets/img/logo.png',
      errorstack: 'Fehler beim Abrufen des Blog-Posts.',
    });
  }
});

export default router;
