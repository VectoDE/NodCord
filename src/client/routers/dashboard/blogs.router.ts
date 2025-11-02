import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import prisma from '@/client/lib/prisma';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

// ------------------------------------------------------------
// Middlewares
// ------------------------------------------------------------
router.use(authMiddleware(true));
router.use(roleMiddleware(['admin']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 📰 Blog Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: { tagRecords: true, metadataRecords: true, project: true },
    });

    res.render('dashboard/blogs/blogs', {
      blogs,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'blogs',
    });
  } catch (error: any) {
    logger.error('Error fetching blogs for dashboard', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Blog Übersicht Fehler',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 📝 Blog Erstellen
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/blogs/createBlog', {
      projects,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'blogs',
    });
  } catch (error: any) {
    logger.error('Error rendering create blog form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Blog-Erstellung',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Blog Bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const blogId = (req.params as Record<string, string>)['id'];

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: { tagRecords: true, metadataRecords: true, project: true },
    });

    if (!blog) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Blog nicht gefunden',
        errormessage: 'Der angeforderte Blog existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/blogs/editBlog', {
      blog,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'blogs',
    });
  } catch (error: any) {
    logger.error('Error rendering edit blog form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Blog Bearbeitungsfehler',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Blog Löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const blogId = (req.params as Record<string, string>)['id'];
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Blog nicht gefunden',
        errormessage: 'Der zu löschende Blog existiert nicht.',
        errorstatus: 404,
      });
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: { isArchived: true, deletedAt: new Date() },
    });

    logger.info(`Blog '${blog.title}' wurde archiviert.`);
    res.redirect('/dashboard/blogs');
  } catch (error: any) {
    logger.error('Error deleting blog', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Blog Löschfehler',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
