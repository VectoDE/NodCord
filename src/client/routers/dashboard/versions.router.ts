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
router.use(roleMiddleware(['admin', 'developer', 'release_manager']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

// ------------------------------------------------------------
// 🧾 Versionsübersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const versions = await prisma.version.findMany({
      orderBy: { releasedAt: 'desc' },
      include: {
        versionTag: true,
        featureRecords: true,
        additionRecords: true,
        fixRecords: true,
        bugRecords: true,
        developerRecords: true,
      },
    });

    res.render('dashboard/versions/versions', {
      versions,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'versions',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching versions', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Versionen',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Neue Version erstellen (Formular)
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    const versionTags = await prisma.versionTag.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    });

    res.render('dashboard/versions/createVersion', {
      versionTags,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'versions',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering create version form', { error });
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
// ✏️ Version bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const versionId = (req.params as Record<string, string>)['id'];
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        versionTag: true,
        featureRecords: true,
        additionRecords: true,
        fixRecords: true,
        bugRecords: true,
        developerRecords: true,
      },
    });

    if (!version) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Version nicht gefunden',
        errormessage: 'Diese Version existiert nicht.',
        errorstatus: 404,
      });
    }

    const versionTags = await prisma.versionTag.findMany({
      select: { id: true, title: true },
    });

    res.render('dashboard/versions/editVersion', {
      version,
      versionTags,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'versions',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading version edit form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Version',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Version löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const versionId = (req.params as Record<string, string>)['id'];
    const version = await prisma.version.findUnique({ where: { id: versionId } });

    if (!version) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Version nicht gefunden',
        errormessage: 'Diese Version existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.version.delete({ where: { id: versionId } });
    logger.info(`Version "${version.title}" wurde gelöscht.`);
    res.redirect('/dashboard/versions');
  } catch (error: any) {
    logger.error('Error deleting version', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen der Version',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🏷️ Version Tags
// ------------------------------------------------------------
router.get('/tags', async (_req: Request, res: Response) => {
  try {
    const versionTags = await prisma.versionTag.findMany({
      orderBy: { createdAt: 'desc' },
      include: { versions: true },
    });

    res.render('dashboard/versions/tags/versionTags', {
      versionTags,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'versions/tags',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching version tags', { error });
    res.status(500).send('Internal Server Error');
  }
});

// ------------------------------------------------------------
// 🧑‍💻 Entwicklerübersicht (aus VersionDeveloper)
// ------------------------------------------------------------
router.get('/developers', async (_req: Request, res: Response) => {
  try {
    const developers = await prisma.versionDeveloper.findMany({
      include: {
        version: { select: { id: true, title: true, releasedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.render('dashboard/versions/developers/versionDevelopers', {
      developers,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'versions/developers',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching version developers', { error });
    res.status(500).send('Internal Server Error');
  }
});

export default router;
