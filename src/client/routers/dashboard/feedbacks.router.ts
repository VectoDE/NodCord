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
// 💬 Feedback Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    res.render('dashboard/feedbacks/feedbacks', {
      feedbacks,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      currentPage: 'feedbacks',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching feedback list', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Feedbacks',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Feedback erstellen (Formular)
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
      orderBy: { username: 'asc' },
    });

    const projects = await prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    res.render('dashboard/feedbacks/createFeedback', {
      users,
      projects,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'feedbacks',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering create feedback form', { error });
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
// ✏️ Feedback bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const feedbackId = (req.params as Record<string, string>)['id'];

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        user: { select: { id: true, username: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (!feedback) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Feedback nicht gefunden',
        errormessage: 'Dieses Feedback existiert nicht.',
        errorstatus: 404,
      });
    }

    const users = await prisma.user.findMany({
      select: { id: true, username: true },
      orderBy: { username: 'asc' },
    });

    const projects = await prisma.project.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    res.render('dashboard/feedbacks/editFeedback', {
      feedback,
      users,
      projects,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'feedbacks',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading feedback edit view', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden des Feedbacks',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Feedback löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const feedbackId = (req.params as Record<string, string>)['id'];

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { project: { select: { title: true } } },
    });

    if (!feedback) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Feedback nicht gefunden',
        errormessage: 'Dieses Feedback existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.feedback.delete({ where: { id: feedbackId } });
    logger.info(`Feedback von User "${feedback.userId}" gelöscht`);

    res.redirect('/dashboard/feedbacks');
  } catch (error: any) {
    logger.error('Error deleting feedback', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen des Feedbacks',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
