import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import logger from '@/services/logger.service';
import monitorService from '@/services/monitor.service';
import pm2Service from '@/services/pm2.service';

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
// ☁️ CloudNet Übersicht
// ------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    // Holen von aktuellen CloudNet-Infos (z. B. aus monitorService)
    const cloudnetStatus = await monitorService.getCloudNetStatus();
    const monitor = await monitorService.getStatusSummary(req.app);
    const processes = await pm2Service.listProcesses();

    res.render('dashboard/cloudnet/overviewCloudNet', {
      cloudnetStatus,
      monitor,
      processes,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      errorstack: null,
      currentPage: 'cloudnet',
    });
  } catch (error: any) {
    logger.error('Error loading CloudNet overview', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'CloudNet Übersicht Fehler',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// ⚙️ CloudNet Nodes anzeigen
// ------------------------------------------------------------
router.get('/nodes', async (req: Request, res: Response) => {
  try {
    const cloudnetNodes = await monitorService.getCloudNetNodes();
    const monitor = await monitorService.getStatusSummary(req.app);

    res.render('dashboard/cloudnet/nodes', {
      nodes: cloudnetNodes,
      monitor,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      errorstack: null,
      currentPage: 'cloudnet-nodes',
    });
  } catch (error: any) {
    logger.error('Error loading CloudNet nodes', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der CloudNet-Nodes',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🧩 CloudNet Services anzeigen
// ------------------------------------------------------------
router.get('/services', async (req: Request, res: Response) => {
  try {
    const cloudnetServices = await monitorService.getCloudNetServices();
    const monitor = await monitorService.getStatusSummary(req.app);

    res.render('dashboard/cloudnet/services', {
      services: cloudnetServices,
      monitor,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      errorstack: null,
      currentPage: 'cloudnet-services',
    });
  } catch (error: any) {
    logger.error('Error loading CloudNet services', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der CloudNet-Services',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// 🔍 CloudNet Service Details
// ------------------------------------------------------------
router.get('/services/:name', async (req: Request, res: Response) => {
  try {
    const { name: serviceName } = req.params as { name?: string };
    if (!serviceName) {
      return res.status(400).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Ungültige Anfrage',
        errormessage: 'Es wurde kein Service-Name angegeben.',
        errorstatus: 400,
      });
    }

    const serviceDetails = await monitorService.getCloudNetServiceByName(serviceName);

    if (!serviceDetails) {
      return res.status(404).render('index/error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'CloudNet Service nicht gefunden',
        errormessage: `Kein CloudNet Service mit dem Namen "${serviceName}" gefunden.`,
        errorstatus: 404,
      });
    }

    res.render('dashboard/cloudnet/serviceDetails', {
      service: serviceDetails,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env['API_HTTPS'],
        baseURL: process.env['API_BASE_URL'],
        port: process.env['API_PORT'],
      },
      errorstack: null,
      currentPage: 'cloudnet-services',
    });
  } catch (error: any) {
    logger.error('Error loading CloudNet service details', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Fehler beim Laden der Service-Details',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

export default router;
