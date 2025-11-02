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
// Beta Overview
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const betaSystem = (await prisma.betaSystem.findFirst()) ?? { isActive: false };

    const betaKeys = await prisma.betaKey.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/beta/betaOverview', {
      betaSystem,
      betaKeys,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'beta',
    });
  } catch (error: any) {
    logger.error('Error rendering Beta overview', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Beta Overview Error',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// Beta Keys List
// ------------------------------------------------------------
router.get('/keys', async (_req: Request, res: Response) => {
  try {
    const betaKeys = await prisma.betaKey.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/beta/betaKeys/betaKeys', {
      betaKeys,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'beta/keys',
    });
  } catch (error: any) {
    logger.error('Error rendering Beta keys', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// Create Beta Key Form
// ------------------------------------------------------------
router.get('/keys/create', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/beta/betaKeys/createBetaKey', {
      users,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'beta/keys',
    });
  } catch (error: any) {
    logger.error('Error rendering create Beta key form', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// Edit Beta Key Form
// ------------------------------------------------------------
router.get('/keys/update/:id', async (req: Request, res: Response) => {
  try {
    const keyId = (req.params as Record<string, string>)['id'];
    const betaKey = await prisma.betaKey.findUnique({
      where: { id: keyId },
      include: { user: true },
    });

    if (!betaKey) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Beta Key Not Found',
        errormessage: 'Der angeforderte Beta-Key existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/beta/betaKeys/editBetaKey', {
      betaKey,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'beta/keys',
    });
  } catch (error: any) {
    logger.error('Error rendering edit Beta key form', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// Beta System Settings
// ------------------------------------------------------------
router.get('/system', async (_req: Request, res: Response) => {
  try {
    const betaSystem = (await prisma.betaSystem.findFirst()) ?? { isActive: false };

    res.render('dashboard/beta/system/betaSystem', {
      betaSystem,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'beta/system',
    });
  } catch (error: any) {
    logger.error('Error rendering Beta system', { error });
    res.status(500).send('Internal Server Error');
  }
});

export default router;
