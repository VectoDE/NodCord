import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  res.render('index/documentation', {
    logoImage: '/assets/img/logo.png',
    isAuthenticated: res.locals['isAuthenticated'] ?? false,
  });
});

export default router;
