import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import prisma from '@/client/lib/prisma';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

// ------------------------------------------------------------
// Middleware Setup
// ------------------------------------------------------------
router.use(authMiddleware(true));
router.use(roleMiddleware(['admin', 'moderator']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 👥 Gruppen Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        members: { select: { id: true, username: true } },
        projects: { select: { id: true, title: true } },
      },
    });

    res.render('dashboard/groups/groups', {
      groups,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'groups',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching groups', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Gruppen',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Neue Gruppe erstellen (Formular)
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { username: 'asc' },
      select: { id: true, username: true },
    });

    res.render('dashboard/groups/createGroup', {
      users,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'groups',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering create group form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Gruppenformulars',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Gruppe bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const groupId = (req.params as Record<string, string>)['id'];
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: { select: { id: true, username: true, email: true } },
        projects: { select: { id: true, title: true } },
      },
    });

    if (!group) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Gruppe nicht gefunden',
        errormessage: 'Diese Gruppe existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/groups/editGroup', {
      group,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'groups',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading group edit view', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Gruppe',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Gruppe löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const groupId = (req.params as Record<string, string>)['id'];
    const group = await prisma.group.findUnique({ where: { id: groupId } });

    if (!group) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Gruppe nicht gefunden',
        errormessage: 'Diese Gruppe existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.group.delete({ where: { id: groupId } });
    logger.info(`Group "${group.name}" wurde gelöscht.`);
    res.redirect('/dashboard/groups');
  } catch (error: any) {
    logger.error('Error deleting group', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen der Gruppe',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
