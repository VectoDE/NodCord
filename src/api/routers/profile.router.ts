import { Router } from 'express';

import { requireAuth } from '@/middlewares/authentication.middleware';
import { validationMiddleware, v } from '@/middlewares/validation.middleware';
import { standardResponse } from '@/utils/response.util';

const router = Router();

router.post(
  '/profile',
  requireAuth(),
  validationMiddleware({
    body: { displayName: v.string(2, 100), bio: v.string(0, 250) },
  }),
  (req, res) =>
    standardResponse(
      res,
      200,
      {
        ok: true,
        user: req.user,
      },
      'Profile updated',
    ),
);

export default router;
