import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import prisma from '@/client/lib/prisma';
import multer from 'multer';
import path from 'path';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger from '@/services/logger.service';
import multerService from '@/services/multer.service';

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
// 📁 Multer Setup (Uploads)
// ------------------------------------------------------------
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'files');
const upload = multerService.init(uploadDir, ['application/pdf', 'image/png', 'image/jpeg']);

// ------------------------------------------------------------
// 🧾 Dateien Übersicht
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const files = await prisma.fileUpload.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, username: true, email: true } },
      },
    });

    res.render('dashboard/files/files', {
      files,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      currentPage: 'files',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error fetching file list', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Dateien',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ➕ Datei hochladen (Formular)
// ------------------------------------------------------------
router.get('/create', (_req: Request, res: Response) => {
  try {
    res.render('dashboard/files/createFile', {
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      currentPage: 'files',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error rendering file upload form', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Öffnen des Upload-Formulars',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 📤 Datei hochladen (POST)
// ------------------------------------------------------------
router.post('/create', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      throw new Error('Keine Datei hochgeladen.');
    }

    const uploader = req.user;

    await prisma.fileUpload.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/files/${file.filename}`,
        uploaderId: uploader?.id ?? null,
      },
    });

    logger.info(`Datei ${file.originalname} wurde hochgeladen.`);
    res.redirect('/dashboard/files');
  } catch (error: any) {
    logger.error('Error uploading file', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Hochladen der Datei',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ✏️ Datei bearbeiten
// ------------------------------------------------------------
router.get('/update/:id', async (req: Request, res: Response) => {
  try {
    const fileId = (req.params as Record<string, string>)['id'];
    const file = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      include: {
        uploader: { select: { username: true, email: true } },
      },
    });

    if (!file) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Datei nicht gefunden',
        errormessage: 'Diese Datei existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/files/editFile', {
      file,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      currentPage: 'files',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: any) {
    logger.error('Error loading file edit view', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Datei',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🗑️ Datei löschen
// ------------------------------------------------------------
router.get('/delete/:id', async (req: Request, res: Response) => {
  try {
    const fileId = (req.params as Record<string, string>)['id'];
    const file = await prisma.fileUpload.findUnique({ where: { id: fileId } });

    if (!file) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Datei nicht gefunden',
        errormessage: 'Diese Datei existiert nicht oder wurde bereits gelöscht.',
        errorstatus: 404,
      });
    }

    await prisma.fileUpload.delete({ where: { id: fileId } });

    logger.info(`Datei ${file.filename} wurde gelöscht.`);
    res.redirect('/dashboard/files');
  } catch (error: any) {
    logger.error('Error deleting file', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen der Datei',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
