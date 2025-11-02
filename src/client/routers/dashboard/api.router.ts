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
// API Overview
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const apiSystem = await prisma.apiSystem.findFirst();
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/api/overviewApi', {
      apiSystem,
      apiKeys,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'api',
    });
  } catch (error: any) {
    logger.error('Error rendering API overview', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'API Overview Error',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// API Keys List
// ------------------------------------------------------------
router.get('/keys', async (_req: Request, res: Response) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/api/apiKey/apiKeys', {
      apiKeys,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'api/keys',
    });
  } catch (error: any) {
    logger.error('Error rendering API keys list', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// Create API Key Form
// ------------------------------------------------------------
router.get('/keys/create', async (_req: Request, res: Response) => {
  try {
    res.render('dashboard/api/apiKey/createApiKey', {
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'api/keys',
    });
  } catch (error: any) {
    logger.error('Error rendering create API key form', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// Edit API Key
// ------------------------------------------------------------
router.get('/keys/update/:id', async (req: Request, res: Response) => {
  try {
    const apiKeyId = (req.params as Record<string, string>)['id'];
    const apiKey = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });

    if (!apiKey) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'API Key Not Found',
        errormessage: 'Der angeforderte API-Schlüssel existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/api/apiKey/editApiKey', {
      apiKey,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'api/keys',
    });
  } catch (error: any) {
    logger.error('Error rendering edit API key form', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// API System Settings
// ------------------------------------------------------------
router.get('/system', async (_req: Request, res: Response) => {
  try {
    const apiSystem = await prisma.apiSystem.findFirst();

    res.render('dashboard/api/system/apiSystem', {
      apiSystem,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      currentPage: 'api/system',
    });
  } catch (error: any) {
    logger.error('Error rendering API system', { error });
    res.status(500).send('Internal Server Error');
  }
});

export default router;
