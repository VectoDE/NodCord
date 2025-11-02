import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// Root Index Page
router.get('/', (req: Request, res: Response) => {
  const currentUser = req.user;
  res.render('index/index', {
    isAuthenticated: res.locals['isAuthenticated'] ?? false,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    api: {
      https: process.env['API_HTTPS'],
      baseURL: process.env['API_BASE_URL'],
      port: process.env['API_PORT'],
    },
    currentUser,
  });
});

export default router;
