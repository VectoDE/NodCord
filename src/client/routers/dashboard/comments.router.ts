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
router.use(roleMiddleware(['admin', 'moderator']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 💬 Kommentare Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        blog: {
          select: { id: true, title: true },
        },
        author: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    res.render('dashboard/comments/comments', {
      comments,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'comments',
    });
  } catch (error: any) {
    logger.error('Error fetching comments', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Kommentare konnten nicht geladen werden',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Kommentar erstellen
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isArchived: false },
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/comments/createComment', {
      blogs,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'comments',
      errorstack: null,
    });
  } catch (error: any) {
    logger.error('Error rendering create comment form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Formulars',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Kommentar bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const commentId = (req.params as Record<string, string>)['id'];

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        blog: { select: { id: true, title: true } },
        author: { select: { id: true, username: true } },
      },
    });

    if (!comment) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Kommentar nicht gefunden',
        errormessage: 'Der angeforderte Kommentar existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/comments/editComment', {
      comment,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'comments',
      errorstack: null,
    });
  } catch (error: any) {
    logger.error('Error loading comment edit form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden des Kommentars',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Kommentar löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const commentId = (req.params as Record<string, string>)['id'];

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { blog: { select: { title: true } } },
    });

    if (!comment) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Kommentar nicht gefunden',
        errormessage: 'Der Kommentar existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    logger.info(`Kommentar zu Blog "${comment.blog?.title}" gelöscht`);
    res.redirect('/dashboard/comments');
  } catch (error: any) {
    logger.error('Error deleting comment', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen des Kommentars',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
