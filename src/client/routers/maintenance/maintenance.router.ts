import express from 'express';

import newSiteRouter from '@/client/routers/maintenance/new-site.maintenance.router';
import changeRouter from '@/client/routers/maintenance/change.maintenance.router';
import updateRouter from '@/client/routers/maintenance/update.maintenance.router';
import releaseRouter from '@/client/routers/maintenance/release.maintenance.router';
import createRouter from '@/client/routers/maintenance/create.maintenance.router';

const router = express.Router();

// Alle Maintenance-Unterrouten einbinden
router.use('/new-site', newSiteRouter);
router.use('/change', changeRouter);
router.use('/update', updateRouter);
router.use('/release', releaseRouter);
router.use('/create', createRouter);

// Standardweiterleitung (z. B. auf die "new-site"-Seite)
router.get('/', (_req, res) => res.redirect('/maintenance/new-site'));

export default router;
