import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import logger from '@/services/logger.service';
import authMiddleware from '@/middlewares/authentication.middleware';
import roleMiddleware from '@/middlewares/role.middleware';
import monitorService from '@/services/monitor.service';
import pm2Service from '@/services/pm2.service';

import apiRoutes from '@/client/routers/dashboard/api.router';
import betaRoutes from '@/client/routers/dashboard/beta.router';
import blogRoutes from '@/client/routers/dashboard/blogs.router';
import bugRoutes from '@/client/routers/dashboard/bugs.router';
import categoryRoutes from '@/client/routers/dashboard/categories.router';
import clientRoutes from '@/client/routers/dashboard/client.router';
import cloudnetRoutes from '@/client/routers/dashboard/cloudnet.router';
import commentsRoutes from '@/client/routers/dashboard/comments.router';
import companiesRoutes from '@/client/routers/dashboard/companies.router';
import customersRoutes from '@/client/routers/dashboard/customers.router';
import favoritesRoutes from '@/client/routers/dashboard/favorites.router';
import featuresRoutes from '@/client/routers/dashboard/features.router';
import feedbacksRoutes from '@/client/routers/dashboard/feedbacks.router';
import filesRoutes from '@/client/routers/dashboard/files.router';
import gamesRoutes from '@/client/routers/dashboard/games.router';
import groupsRoutes from '@/client/routers/dashboard/groups.router';
import logsRoutes from '@/client/routers/dashboard/logs.router';
import ordersRoutes from '@/client/routers/dashboard/orders.router';
import paymentsRoutes from '@/client/routers/dashboard/payments.router';
import projectsRoutes from '@/client/routers/dashboard/projects.router';
import returnsRoutes from '@/client/routers/dashboard/returns.router';
import subscribersRoutes from '@/client/routers/dashboard/subscribers.router';
import tagsRoutes from '@/client/routers/dashboard/tags.router';
import tasksRoutes from '@/client/routers/dashboard/tasks.router';
import teamsRoutes from '@/client/routers/dashboard/teams.router';
import ticketsRoutes from '@/client/routers/dashboard/tickets.router';
import tournamentsRoutes from '@/client/routers/dashboard/tournaments.router';
import userRoutes from '@/client/routers/dashboard/users.router';
import versionsRoutes from '@/client/routers/dashboard/versions.router';

const router = express.Router();

// ------------------------------------------------------------
// Dashboard Base Setup
// ------------------------------------------------------------
router.use(authMiddleware(true));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

router.use(roleMiddleware(['admin', 'moderator']));

// ------------------------------------------------------------
// Dashboard Overview Page
// ------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const monitor = await monitorService.getStatusSummary(req.app);
    const pm2Processes = await pm2Service.listProcesses();

    res.render('dashboard/dashboard', {
      monitor,
      pm2Processes,
      isAuthenticated: res.locals['isAuthenticated'] ?? false,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
    });
  } catch (error: any) {
    logger.error('Error loading dashboard overview', { error });
    res.status(500).render('index/error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Dashboard Error',
      errormessage: error.message,
      errorstatus: 500,
      errorstack: error.stack,
    });
  }
});

// ------------------------------------------------------------
// Mount all subroutes
// ------------------------------------------------------------
router.use('/api', apiRoutes);
router.use('/beta', betaRoutes);
router.use('/blogs', blogRoutes);
router.use('/bugs', bugRoutes);
router.use('/categories', categoryRoutes);
router.use('/clients', clientRoutes);
router.use('/cloudnet', cloudnetRoutes);
router.use('/comments', commentsRoutes);
router.use('/companies', companiesRoutes);
router.use('/customers', customersRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/features', featuresRoutes);
router.use('/feedbacks', feedbacksRoutes);
router.use('/files', filesRoutes);
router.use('/games', gamesRoutes);
router.use('/groups', groupsRoutes);
router.use('/logs', logsRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/projects', projectsRoutes);
router.use('/returns', returnsRoutes);
router.use('/subscribers', subscribersRoutes);
router.use('/tags', tagsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/teams', teamsRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/tournaments', tournamentsRoutes);
router.use('/users', userRoutes);
router.use('/versions', versionsRoutes);

export default router;
