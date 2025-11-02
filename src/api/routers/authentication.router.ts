import { Router } from 'express';
import passport from 'passport';

import {
  optionalAuth,
  requireAuth,
  startDiscordAuth,
  handleDiscordCallback,
} from '@/middlewares/authentication.middleware';
import { getSession, refreshSession, logout } from '@/api/controllers/authentication.controller';

const router = Router();

// Session inspection and lifecycle
router.get('/session', optionalAuth(), getSession);
router.post('/session/refresh', refreshSession);
router.post('/session/logout', requireAuth(), logout);

// OAuth entrypoints
router.get('/discord', startDiscordAuth());
router.get('/discord/callback', handleDiscordCallback(), getSession);

// Placeholder routes for additional providers (Google, GitHub)
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);
router.get('/google/callback', passport.authenticate('google', { session: false }), getSession);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false }), getSession);

export default router;
