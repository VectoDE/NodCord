import type { Request, Response, CookieOptions } from 'express';

import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';
import { handleTokenRefresh, type AuthUser } from '@/middlewares/authentication.middleware';
import type { AccessTokenPayload } from '@/utils/jwt.util';

type MaybeAuthRequest = Request & {
  auth?: { payload?: AccessTokenPayload };
};

const EMPTY_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 0,
};

export const getSession = safeAsync(
  async (req: Request, res: Response) => {
    const user = (req.user as AuthUser | undefined) ?? null;
    const payload = (req as MaybeAuthRequest).auth?.payload ?? null;

    return standardResponse(
      res,
      200,
      {
        authenticated: !!user,
        user,
        payload,
      },
      'Authentication inspected',
    );
  },
  { label: 'auth#getSession' },
);

export const refreshSession = safeAsync(
  async (req: Request, res: Response) => {
    const result = await handleTokenRefresh(req);
    if (!result.ok) {
      logger.warn('[AUTH] Refresh failed', { status: result.status, error: result.error });
      return standardResponse(res, result.status, { error: result.error }, 'Token refresh failed');
    }

    const { accessTokenCookie, refreshTokenCookie, payload } = result;

    res.cookie(
      accessTokenCookie.name,
      accessTokenCookie.value,
      accessTokenCookie.options as CookieOptions,
    );
    res.cookie(
      refreshTokenCookie.name,
      refreshTokenCookie.value,
      refreshTokenCookie.options as CookieOptions,
    );

    return standardResponse(
      res,
      200,
      {
        accessToken: true,
        refreshToken: true,
        payload,
      },
      'Session refreshed',
    );
  },
  { label: 'auth#refreshSession' },
);

export const logout = safeAsync(
  async (_req: Request, res: Response) => {
    res.cookie('access_token', '', EMPTY_COOKIE_OPTIONS);
    res.cookie('refresh_token', '', { ...EMPTY_COOKIE_OPTIONS, sameSite: 'lax' as const });
    return standardResponse(res, 200, { ok: true }, 'Logged out');
  },
  { label: 'auth#logout' },
);

export default Object.freeze({
  getSession,
  refreshSession,
  logout,
});
