/**
 * ------------------------------------------------------------
 * Authentication Middleware – Passport + JWT + Discord
 * ------------------------------------------------------------
 *
 * Features:
 * - Integrates with Passport strategies from configs/passport.ts
 * - Uses JWT verification via jwt.util (verifyAccessToken / verifyRefreshToken)
 * - Supports Bearer header + cookie fallback
 * - Optional and required authentication guards
 * - Role & scope guards
 * - Refresh & logout routes (token rotation)
 * - Concurrency safety (Mutex)
 * - Unified responses via response.util
 * - Strict TS (verbatimModuleSyntax, exactOptionalPropertyTypes)
 *
 * Utilities used:
 * - async.util:        safeAsync
 * - response.util:     standardResponse
 * - sync.util:         Once, Mutex
 * - jwt.util:          verifyAccessToken, verifyRefreshToken, rotateRefreshToken,
 *                      signAccessToken, buildAccessTokenCookie, buildRefreshTokenCookie,
 *                      extractBearer
 * - passport.config:   passport, STRATEGY_JWT, STRATEGY_DISCORD
 */

import type { Request, Response, NextFunction, Express } from 'express';
import logger from '@/services/logger.service';

import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';
import { Mutex, Once } from '@/utils/sync.util';

import {
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  buildAccessTokenCookie,
  buildRefreshTokenCookie,
  extractBearer,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from '@/utils/jwt.util';

import {
  STRATEGY_JWT,
  STRATEGY_DISCORD,
  passport as sharedPassport,
} from '@/configs/passport.config';

// ============================================================
// Types
// ============================================================

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  roles?: string[];
  scopes?: string[];
  [key: string]: unknown;
}

export interface AuthInitOptions {
  /** User loader from DB */
  getUserById: (id: string) => Promise<AuthUser | null>;
  /** Attach JWT payload to req.auth */
  attachPayloadToReq?: boolean;
  /** Mount refresh + logout routes */
  mountTokenRoutes?: boolean;
  /** Base path for token endpoints */
  routeBase?: string;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      auth?: { payload?: AccessTokenPayload };
    }
  }
}

type RequestWithCookies = Request & { cookies?: Record<string, unknown> };

// ============================================================
// Internal state
// ============================================================

const initOnce = new Once<void>();
const refreshLock = new Mutex();

// ============================================================
// Initialization
// ============================================================

/**
 * Initializes authentication middleware and mounts refresh/logout routes.
 * Requires passport strategies to be initialized in configs/passport.ts.
 */
export async function initAuthentication(app: Express, opts: AuthInitOptions): Promise<void> {
  await initOnce.run(async () => {
    const base = opts.routeBase ?? '/auth';

    app.use(sharedPassport.initialize());

    // Optionally mount refresh/logout
    if (opts.mountTokenRoutes ?? true) {
      app.post(
        `${base}/refresh`,
        safeAsync(async (req: Request, res: Response) => {
          const result = await handleTokenRefresh(req);
          if (!result.ok) return standardResponse(res, result.status, { error: result.error });

          const { accessTokenCookie, refreshTokenCookie, payload } = result;

          res.cookie(
            accessTokenCookie.name,
            accessTokenCookie.value,
            accessTokenCookie.options as any,
          );
          res.cookie(
            refreshTokenCookie.name,
            refreshTokenCookie.value,
            refreshTokenCookie.options as any,
          );

          return standardResponse(res, 200, {
            ok: true,
            sub: payload.sub,
            role: (payload as any).role,
          });
        }),
      );

      app.post(
        `${base}/logout`,
        safeAsync(async (_req: Request, res: Response) => {
          res.cookie('access_token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 0,
          });
          res.cookie('refresh_token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 0,
          });
          return standardResponse(res, 200, { ok: true });
        }),
      );
    }

    logger.info('[AUTH] Middleware initialized', {
      routes: opts.mountTokenRoutes ?? true,
    });
  });
}

// ============================================================
// Middleware – JWT Required
// ============================================================

/**
 * Hard authentication: Rejects if invalid or missing JWT.
 */
export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    sharedPassport.authenticate(
      STRATEGY_JWT,
      { session: false },
      (err: unknown, user: AuthUser | false | null) => {
        if (err) {
          const e = err instanceof Error ? err : new Error(String(err));
          logger.error('[AUTH] requireAuth error', { error: e.message });
          return standardResponse(res, 500, 'Authentication error');
        }
        if (!user) {
          res.locals['isAuthenticated'] = false;
          return standardResponse(res, 401, 'Unauthorized');
        }
        req.user = user;
        res.locals['isAuthenticated'] = true;
        return next();
      },
    )(req, res, next);
  };
}

/**
 * Optional authentication: attaches req.user if valid, continues otherwise.
 */
export function optionalAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals['isAuthenticated'] = false;
    sharedPassport.authenticate(
      STRATEGY_JWT,
      { session: false },
      (_err: unknown, user: AuthUser | false | null) => {
        if (user) {
          req.user = user;
          res.locals['isAuthenticated'] = true;
        }
        return next();
      },
    )(req, res, next);
  };
}

// ============================================================
// Middleware – Discord Auth
// ============================================================

/**
 * Passport middleware to start Discord OAuth2 login.
 */
export function startDiscordAuth() {
  return sharedPassport.authenticate(STRATEGY_DISCORD, {
    session: false,
    scope: ['identify', 'email'],
  });
}

/**
 * Discord OAuth2 callback route middleware.
 */
export function handleDiscordCallback() {
  return sharedPassport.authenticate(STRATEGY_DISCORD, {
    session: false,
    failureRedirect: '/login',
  });
}

// ============================================================
// Role / Scope Guards
// ============================================================

/** Require at least one matching role */
export function requireRole(roles: readonly string[]) {
  const set = new Set(roles);
  return (req: Request, res: Response, next: NextFunction) => {
    const u = req.user as AuthUser | undefined;
    const all = new Set([u?.role, ...(u?.roles ?? [])].filter(Boolean) as string[]);
    for (const r of set) if (all.has(r)) return next();
    return standardResponse(res, 403, 'Forbidden');
  };
}

/** Require all given scopes */
export function requireScopes(scopes: readonly string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = req.user as AuthUser | undefined;
    const have = new Set([...(u?.scopes ?? []), ...(u?.roles ?? [])].filter(Boolean) as string[]);
    for (const s of scopes) if (!have.has(s)) return standardResponse(res, 403, 'Forbidden');
    return next();
  };
}

// ============================================================
// Token Refresh Helper
// ============================================================

export async function handleTokenRefresh(req: Request): Promise<
  | {
      ok: true;
      status: 200;
      accessTokenCookie: ReturnType<typeof buildAccessTokenCookie>;
      refreshTokenCookie: ReturnType<typeof buildRefreshTokenCookie>;
      payload: AccessTokenPayload;
    }
  | { ok: false; status: number; error: string }
> {
  return refreshLock.runExclusive(async () => {
    try {
      // Prefer cookie, fallback header
      const cookies = (req as RequestWithCookies).cookies;
      const cookieToken =
        typeof cookies?.['refresh_token'] === 'string'
          ? (cookies['refresh_token'] as string)
          : null;
      const headerSource = req.get?.('authorization');
      const headerToken = extractBearer(headerSource ?? undefined);
      const refreshToken = cookieToken ?? headerToken ?? null;
      if (!refreshToken) return { ok: false, status: 401, error: 'Missing refresh token' };

      const payload: RefreshTokenPayload = verifyRefreshToken(refreshToken);
      const { newRefreshToken, sub } = rotateRefreshToken(refreshToken);

      const accessPayload: AccessTokenPayload = { sub };
      const payloadRole = payload?.['role'];
      if (typeof payloadRole === 'string') {
        accessPayload.role = payloadRole;
      }
      const payloadScopes = payload?.['scopes'];
      if (Array.isArray(payloadScopes)) {
        accessPayload.scopes = payloadScopes.filter(
          (scope): scope is string => typeof scope === 'string',
        );
      }

      const newAccessToken = signAccessToken(accessPayload);
      const accessTokenCookie = buildAccessTokenCookie(newAccessToken);
      const refreshTokenCookie = buildRefreshTokenCookie(newRefreshToken);

      return {
        ok: true,
        status: 200,
        accessTokenCookie,
        refreshTokenCookie,
        payload: accessPayload,
      };
    } catch (error) {
      const e = error instanceof Error ? error : new Error(String(error));
      logger.warn('[AUTH] Token refresh failed', { error: e.message });
      return { ok: false, status: 401, error: 'Invalid refresh token' };
    }
  });
}

// ============================================================
// Default Export
// ============================================================

type LegacyAuthMiddleware = {
  (required?: boolean): (req: Request, res: Response, next: NextFunction) => void;
  initAuthentication: typeof initAuthentication;
  requireAuth: typeof requireAuth;
  optionalAuth: typeof optionalAuth;
  requireRole: typeof requireRole;
  requireScopes: typeof requireScopes;
  startDiscordAuth: typeof startDiscordAuth;
  handleDiscordCallback: typeof handleDiscordCallback;
  handleTokenRefresh: typeof handleTokenRefresh;
};

const legacyAuthMiddleware = Object.assign(
  (required = true) => (required ? requireAuth() : optionalAuth()),
  {
    initAuthentication,
    requireAuth,
    optionalAuth,
    requireRole,
    requireScopes,
    startDiscordAuth,
    handleDiscordCallback,
    handleTokenRefresh,
  },
) satisfies LegacyAuthMiddleware;

export default legacyAuthMiddleware;
