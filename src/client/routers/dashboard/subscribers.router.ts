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
// 📬 Abonnenten Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/subscribers/subscribers', {
      subscribers,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'subscribers',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching subscribers', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Abonnenten',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

// ------------------------------------------------------------
// ➕ Neuer Abonnent erstellen (Formular)
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    res.render('dashboard/subscribers/createSubscriber', {
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'subscribers',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering create subscriber form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Abonnentenformulars',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Abonnent bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const subscriberId = (req.params as Record<string, string>)['id'];
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: subscriberId },
    });

    if (!subscriber) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Abonnent nicht gefunden',
        errormessage: 'Dieser Abonnent existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/subscribers/editSubscriber', {
      subscriber,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'subscribers',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading subscriber edit view', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden des Abonnenten',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Abonnent löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const subscriberId = (req.params as Record<string, string>)['id'];
    const subscriber = await prisma.subscriber.findUnique({ where: { id: subscriberId } });

    if (!subscriber) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Abonnent nicht gefunden',
        errormessage: 'Dieser Abonnent existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.subscriber.delete({ where: { id: subscriberId } });
    logger.info(`Subscriber ${subscriber.email} wurde gelöscht.`);
    res.redirect('/dashboard/subscribers');
  } catch (error: any) {
    logger.error('Error deleting subscriber', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen des Abonnenten',
      errormessage: 'Ein interner Fehler ist aufgetreten. Bitte versuche es später erneut.',
      errorstatus: 500,
      errorstack: null,
    });
  }
});

export default router;
