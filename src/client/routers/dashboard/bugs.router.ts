import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import prisma from '@/client/lib/prisma';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
router.use(authMiddleware(true));
router.use(roleMiddleware(['admin', 'moderator']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 🐞 Bugs Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const bugs = await prisma.bug.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: { project: true, tenant: true },
    });

    res.render('dashboard/bugs/bugs', {
      bugs,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'bugs',
    });
  } catch (error: any) {
    logger.error('Error fetching bugs for dashboard', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Bugs Übersicht Fehler',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🐛 Bug Erstellen
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/bugs/createBug', {
      projects,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'bugs',
    });
  } catch (error: any) {
    logger.error('Error rendering create bug form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Bug-Erstellung',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Bug Bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const bugId = (req.params as Record<string, string>)['id'];

    const bug = await prisma.bug.findUnique({
      where: { id: bugId },
      include: { project: true, tenant: true },
    });

    if (!bug) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Bug nicht gefunden',
        errormessage: 'Der angeforderte Bug existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/bugs/editBug', {
      bug,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'bugs',
    });
  } catch (error: any) {
    logger.error('Error rendering edit bug form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden des Bugs',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Bug Löschen / Archivieren
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const bugId = (req.params as Record<string, string>)['id'];
    const bug = await prisma.bug.findUnique({ where: { id: bugId } });

    if (!bug) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Bug nicht gefunden',
        errormessage: 'Der zu löschende Bug existiert nicht.',
        errorstatus: 404,
      });
    }

    await prisma.bug.update({
      where: { id: bugId },
      data: { isArchived: true, deletedAt: new Date() },
    });

    logger.info(`Bug '${bug.title}' wurde archiviert.`);
    res.redirect('/dashboard/bugs');
  } catch (error: any) {
    logger.error('Error deleting bug', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen des Bugs',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
