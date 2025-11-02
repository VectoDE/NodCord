import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import authMiddleware from '@/middlewares/authentication.middleware';

import indexIndexRoutes from '@/client/routers/index/index.router';
import userRoutes from '@/client/routers/user/user.router';
import legalRoutes from '@/client/routers/legal/legal.router';
import dashboardRoutes from '@/client/routers/dashboard/dashboard.router';
import maintenanceRoutes from '@/client/routers/maintenance/maintenance.router';

const router = express.Router();

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
router.use(express.urlencoded({ extended: true }));
router.use(authMiddleware(false));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

router.use('/', indexIndexRoutes);
router.use('/user', userRoutes);
router.use('/legal', legalRoutes);
router.use('/dashboard', dashboardRoutes);
router.get('/admin', (_req: Request, res: Response) => {
  res.redirect('/dashboard');
});
router.use('/maintenance', maintenanceRoutes);

export default router;
