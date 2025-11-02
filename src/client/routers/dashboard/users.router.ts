import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import prisma from '@/client/lib/prisma';
import bcrypt from 'bcrypt';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger from '@/services/logger.service';

const router = express.Router();

// ------------------------------------------------------------
// Middleware Setup
// ------------------------------------------------------------
router.use(authMiddleware(true));
router.use(roleMiddleware(['admin', 'moderator', 'developer']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 👥 Benutzerübersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        isBetaTester: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.render('dashboard/users/users', {
      users,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'users',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching users', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Benutzerliste',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Benutzer erstellen (Formular)
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  res.render('dashboard/users/createUser', {
    isAuthenticated: res.locals['isAuthenticated'] ?? false,
    logoImage: '/assets/img/logo.png',
    currentPage: 'users',
    errorstack: null,
    api: {
      https: process.env['API_HTTPS'],
      baseURL: process.env['API_BASE_URL'],
      port: process.env['API_PORT'],
    },
  });
});

// ------------------------------------------------------------
// ✏️ Benutzer bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req.params as Record<string, string>)['id'];
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        bio: true,
        isVerified: true,
        isBetaTester: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Benutzer nicht gefunden',
        errormessage: 'Dieser Benutzer existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/users/editUser', {
      user,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'users',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading user edit form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden des Benutzers',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🔒 Benutzer-Passwort aktualisieren
// ------------------------------------------------------------
router.post('/update/:id/password', async (req: Request, res: Response) => {
  try {
    const userId = (req.params as Record<string, string>)['id'];
    const { newPassword } = req.body;

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    logger.info(`Password updated for user ${userId}`);
    res.redirect(`/dashboard/users/update/${userId}`);
  } catch (error: any) {
    logger.error('Error updating password', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Passwort-Update',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Benutzer löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req.params as Record<string, string>)['id'];
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Benutzer nicht gefunden',
        errormessage: 'Dieser Benutzer existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.user.delete({ where: { id: userId } });
    logger.info(`User "${user.username}" wurde gelöscht.`);
    res.redirect('/dashboard/users');
  } catch (error: any) {
    logger.error('Error deleting user', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen des Benutzers',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🧾 Benutzer-Details anzeigen
// ------------------------------------------------------------
router.get('/view/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req.params as Record<string, string>)['id'];
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
        teams: true,
        tickets: true,
      },
    });

    if (!user) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Benutzer nicht gefunden',
        errormessage: 'Dieser Benutzer existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/users/viewUser', {
      user,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'users',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error displaying user details', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Anzeigen des Benutzers',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
