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
// 🧩 Kategorie Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: { tenant: true },
    });

    res.render('dashboard/categories/categories', {
      categories,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      errorstack: null,
      currentPage: 'categories',
    });
  } catch (error: any) {
    logger.error('Error fetching categories', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Kategorien',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Kategorie Erstellen
// ------------------------------------------------------------
router.get('/create', async (_req: Request, res: Response) => {
  try {
    res.render('dashboard/categories/createCategory', {
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      errorstack: null,
      currentPage: 'categories',
    });
  } catch (error: any) {
    logger.error('Error rendering category creation form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Erstellungsformulars',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Kategorie Bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const categoryId = (req.params as Record<string, string>)['id'];

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { tenant: true },
    });

    if (!category) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Kategorie nicht gefunden',
        errormessage: 'Die angeforderte Kategorie existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/categories/editCategory', {
      category,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      errorstack: null,
      currentPage: 'categories',
    });
  } catch (error: any) {
    logger.error('Error rendering category edit form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Kategorie',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Kategorie Archivieren (Soft Delete)
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const categoryId = (req.params as Record<string, string>)['id'];

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Kategorie nicht gefunden',
        errormessage: 'Die zu löschende Kategorie existiert nicht.',
        errorstatus: 404,
      });
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { isArchived: true, deletedAt: new Date() },
    });

    logger.info(`Kategorie '${category.title}' wurde archiviert.`);
    res.redirect('/dashboard/categories');
  } catch (error: any) {
    logger.error('Error deleting category', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Archivieren der Kategorie',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
