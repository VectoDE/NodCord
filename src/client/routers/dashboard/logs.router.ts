import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger, { type LogEntry } from '@/services/logger.service';

const router = express.Router();

// ------------------------------------------------------------
// Middleware Setup
// ------------------------------------------------------------
router.use(authMiddleware(true));
router.use(roleMiddleware(['admin']));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

function buildFallbackLogs(): LogEntry[] {
  return [
    {
      id: 'fallback',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'No log data available. Configure external logging to populate this view.',
      file: 'system',
    },
  ];
}

// ------------------------------------------------------------
// Logs Overview
// ------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const logs = await logger.getRecentLogs(100);
    const formattedLogs = logs.length > 0 ? logs : buildFallbackLogs();

    res.render('dashboard/logging/logs', {
      logs: formattedLogs,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'logs',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching logs', { error });
    const message = error instanceof Error ? error.message : 'Failed to load logs.';
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Logs',
      errormessage: message,
      errorstatus: 500,
      errorstack: error instanceof Error ? error.stack : undefined,
    });
  }
});

// ------------------------------------------------------------
// Log Detail View
// ------------------------------------------------------------
router.get('/:logId', async (req: Request, res: Response) => {
  try {
    const { logId } = req.params as { logId: string };
    const logs = await logger.getRecentLogs(200);
    const selectedLog = logs.find((log) => log.id === logId);

    if (!selectedLog) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Log nicht gefunden',
        errormessage: 'Der angeforderte Log-Eintrag existiert nicht.',
        errorstatus: 404,
      });
    }

    res.render('dashboard/logging/logDetail', {
      log: selectedLog,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      currentPage: 'logs',
      errorstack: null,
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching log detail', { error });
    const message = error instanceof Error ? error.message : 'Failed to fetch log detail.';
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Abrufen des Log-Eintrags',
      errormessage: message,
      errorstatus: 500,
      errorstack: error instanceof Error ? error.stack : undefined,
    });
  }
});

// ------------------------------------------------------------
// Clear Logs
// ------------------------------------------------------------
router.get('/clear/all', async (_req: Request, res: Response) => {
  try {
    await logger.clearLogs();
    logger.info('Alle Logs wurden manuell gelöscht.');

    res.redirect('/dashboard/logs');
  } catch (error: unknown) {
    logger.error('Error clearing logs', { error });
    const message = error instanceof Error ? error.message : 'Failed to clear logs.';
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Löschen der Logs',
      errormessage: message,
      errorstatus: 500,
      errorstack: error instanceof Error ? error.stack : undefined,
    });
  }
});

export default router;
