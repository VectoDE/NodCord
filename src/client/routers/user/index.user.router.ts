import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import authMiddleware from '@/middlewares/authentication.middleware';

const router = express.Router();

router.use(authMiddleware(false));

router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals['user'] = req.user ?? null;
  next();
});

router.get('/', (req: Request, res: Response) => {
  const currentUser = req.user;
  const isAuthenticated = res.locals['isAuthenticated'] ?? false;

  if (isAuthenticated && currentUser) {
    return res.redirect(`/user/${currentUser.username}`);
  }
  return res.redirect('/login');
});

export default router;
