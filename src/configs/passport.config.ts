/**
 * ------------------------------------------------------------
 * Passport Configuration – JWT & Discord Strategies
 * ------------------------------------------------------------
 *
 * - Idempotent setup via Once (no duplicate registrations)
 * - Strict typing, attaches JWT payload to requests when desired
 * - Optional Discord OAuth integration with pluggable resolvers
 */

import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { Strategy as DiscordStrategy } from 'passport-discord';
import type { Express, Request } from 'express';
import type { Profile as DiscordProfile } from 'passport-discord';

import logger from '@/services/logger.service';
import { Once } from '@/utils/sync.util';
import { safeAsync } from '@/utils/async.util';
import { verifyAccessToken, extractBearer, type AccessTokenPayload } from '@/utils/jwt.util';
import { getBaseUrl as computeBaseUrl } from '@/utils/baseUrl.util';

/** Domain user shape expected throughout the app. */
export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  roles?: string[];
  scopes?: string[];
  username?: string;
  provider?: string;
  [key: string]: unknown;
}

export interface PassportInitOptions {
  /** Lookup user by identifier contained in JWT subject. */
  getUserById: (id: string) => Promise<AuthUser | null>;

  /** Optional resolver for Discord OAuth logins. */
  resolveUserFromDiscord?: (
    profile: DiscordProfile,
    tokens: { accessToken: string; refreshToken?: string },
  ) => Promise<AuthUser | null>;

  /** Override base URL for callback construction. */
  baseUrl?: string;
  discordCallbackPath?: string;
  discordScopes?: readonly string[];

  /** Behaviour toggles. */
  attachJwtPayloadToReq?: boolean;
  cookieFallback?: boolean;
  enableSessions?: boolean;

  /** Custom (de-)serialisers when sessions are enabled. */
  serializeUser?: (user: AuthUser, done: (err: unknown, id?: string | null) => void) => void;
  deserializeUser?: (
    id: string,
    done: (err: unknown, user?: AuthUser | false | null) => void,
  ) => void;
}

export const STRATEGY_JWT = 'jwt-util';
export const STRATEGY_DISCORD = 'discord';

const initOnce = new Once<void>();

type RequestWithCookies = Request & { cookies?: Record<string, unknown> };

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      auth?: { payload?: AccessTokenPayload };
    }
  }
}

// -------------------------------------------------------------
// Helper utilities
// -------------------------------------------------------------

function resolveBaseUrl(opts?: PassportInitOptions): string {
  if (opts?.baseUrl) return opts.baseUrl;
  try {
    const computed = computeBaseUrl();
    if (computed) return computed;
  } catch {
    // fall through to environment hints
  }

  const envUrl = process.env['BASE_URL'];
  if (envUrl) return envUrl;

  const host = process.env['CLIENT_BASE_URL'] ?? 'localhost';
  const port = process.env['CLIENT_PORT'] ?? '3000';
  const proto = process.env['NODE_ENV'] === 'production' ? 'https' : 'http';
  return `${proto}://${host}${port ? `:${port}` : ''}`;
}

function buildDiscordCallbackURL(opts?: PassportInitOptions): string {
  const base = resolveBaseUrl(opts).replace(/\/+$/, '');
  const cbPath = opts?.discordCallbackPath ?? '/auth/discord/callback';
  return `${base}${cbPath.startsWith('/') ? cbPath : `/${cbPath}`}`;
}

// -------------------------------------------------------------
// JWT Strategy (custom)
// -------------------------------------------------------------

function registerJwtStrategy(
  getUserById: PassportInitOptions['getUserById'],
  attachPayloadToReq: boolean,
  cookieFallback: boolean,
): void {
  passport.use(
    STRATEGY_JWT,
    new CustomStrategy(
      safeAsync(async (req: Request, done: (error: unknown, user?: AuthUser | false) => void) => {
        try {
          const headerToken = extractBearer(req.headers?.['authorization'] as string | undefined);
          let cookieToken: string | null = null;

          if (cookieFallback) {
            const cookieSource = (req as RequestWithCookies).cookies?.['access_token'];
            cookieToken = typeof cookieSource === 'string' ? cookieSource : null;
          }

          const token = headerToken ?? cookieToken;
          if (!token) return done(null, false);

          const payload = verifyAccessToken(token);
          if (attachPayloadToReq) {
            req.auth = { payload };
          }

          const subject = payload.sub;
          if (typeof subject !== 'string' || subject.length === 0) {
            logger.warn('[PASSPORT] JWT payload missing subject', { payload });
            return done(null, false);
          }

          const user = await getUserById(subject);
          if (!user) {
            logger.warn('[PASSPORT] JWT subject not found', { sub: subject });
            return done(null, false);
          }

          const payloadRecord = payload as Record<string, unknown>;

          const rawRole = payloadRecord['role'];
          const derivedRole = typeof rawRole === 'string' ? rawRole : undefined;

          const rawRoles = payloadRecord['roles'];
          const derivedRoles = Array.isArray(rawRoles)
            ? rawRoles.filter((entry): entry is string => typeof entry === 'string')
            : undefined;

          const rawScopes = payloadRecord['scopes'];
          const derivedScopes = Array.isArray(rawScopes)
            ? rawScopes.filter((entry): entry is string => typeof entry === 'string')
            : undefined;

          const merged: AuthUser = { ...user };

          if (!merged.role && derivedRole) merged.role = derivedRole;
          if (!merged.roles && derivedRoles) merged.roles = derivedRoles;
          if (!merged.scopes && derivedScopes) merged.scopes = derivedScopes;

          return done(null, merged);
        } catch (error) {
          const e = error instanceof Error ? error : new Error(String(error));
          logger.warn('[PASSPORT] JWT verify failed', { error: e.message });
          return done(null, false);
        }
      }),
    ),
  );

  logger.info('[PASSPORT] Registered strategy', { name: STRATEGY_JWT });
}

// -------------------------------------------------------------
// Discord Strategy (OAuth2)
// -------------------------------------------------------------

function registerDiscordStrategy(opts: PassportInitOptions): void {
  const clientID = process.env['DISCORD_CLIENT_ID'] ?? '';
  const clientSecret = process.env['DISCORD_CLIENT_SECRET'] ?? '';

  if (!clientID || !clientSecret) {
    logger.warn('[PASSPORT] Discord credentials missing - strategy not registered');
    return;
  }

  const callbackURL = buildDiscordCallbackURL(opts);
  const scope = opts.discordScopes?.length ? [...opts.discordScopes] : ['identify', 'email'];

  passport.use(
    STRATEGY_DISCORD,
    new DiscordStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope,
        passReqToCallback: false,
      },
      safeAsync(
        async (
          accessToken: string,
          refreshToken: string | undefined,
          profile: DiscordProfile,
          done,
        ) => {
          try {
            const resolver = opts.resolveUserFromDiscord;
            let user: AuthUser | null = null;

            if (typeof resolver === 'function') {
              const resolverTokens: { accessToken: string; refreshToken?: string } = {
                accessToken,
              };
              if (typeof refreshToken === 'string' && refreshToken.length > 0) {
                resolverTokens.refreshToken = refreshToken;
              }
              user = await resolver(profile, resolverTokens);
            } else {
              const emailsArray = Array.isArray(profile.emails) ? profile.emails : undefined;
              const emailEntry = emailsArray?.find(
                (entry) =>
                  entry &&
                  typeof (entry as Record<string, unknown>)['value'] === 'string' &&
                  ((entry as Record<string, unknown>)['value'] as string).length > 0,
              );
              const emailFromArray =
                emailEntry && typeof (emailEntry as Record<string, unknown>)['value'] === 'string'
                  ? ((emailEntry as Record<string, unknown>)['value'] as string)
                  : undefined;

              const emailCandidate =
                typeof profile.email === 'string' ? profile.email : emailFromArray;
              const usernameCandidate =
                typeof profile.username === 'string'
                  ? profile.username
                  : typeof profile.displayName === 'string'
                    ? profile.displayName
                    : undefined;

              const derived: AuthUser = {
                id: profile.id,
                scopes: ['discord:login'],
                provider: 'discord',
              };

              if (emailCandidate) derived.email = emailCandidate;
              if (usernameCandidate) derived.username = usernameCandidate;

              user = derived;
            }

            if (!user) return done(null, false);
            return done(null, user);
          } catch (error) {
            const e = error instanceof Error ? error : new Error(String(error));
            logger.error('[PASSPORT] Discord verify failed', { error: e.message });
            return done(null, false);
          }
        },
      ),
    ),
  );

  logger.info('[PASSPORT] Registered strategy', { name: STRATEGY_DISCORD, callbackURL, scope });
}

// -------------------------------------------------------------
// Public API
// -------------------------------------------------------------

export async function initPassport(_app: Express, options: PassportInitOptions): Promise<void> {
  await initOnce.run(async () => {
    const attach = options.attachJwtPayloadToReq ?? true;
    const cookieFallback = options.cookieFallback ?? true;

    registerJwtStrategy(options.getUserById, attach, cookieFallback);
    registerDiscordStrategy(options);

    if (options.enableSessions) {
      if (options.serializeUser && options.deserializeUser) {
        passport.serializeUser((user: Express.User, done) => {
          try {
            options.serializeUser!(user as AuthUser, done);
          } catch (error) {
            done(error, null);
          }
        });

        passport.deserializeUser((id: unknown, done) => {
          if (typeof id !== 'string' || id.length === 0) {
            done(null, false);
            return;
          }
          try {
            options.deserializeUser!(
              id,
              done as (err: unknown, user?: AuthUser | false | null) => void,
            );
          } catch (error) {
            done(error, false);
          }
        });
      } else {
        passport.serializeUser((user: Express.User, done) => {
          try {
            const authUser = user as AuthUser | undefined;
            done(null, authUser?.id ?? null);
          } catch (error) {
            done(error, null);
          }
        });

        passport.deserializeUser(async (id: unknown, done) => {
          try {
            if (typeof id !== 'string' || id.length === 0) {
              done(null, false);
              return;
            }
            const user = await options.getUserById(id);
            done(null, user ?? false);
          } catch (error) {
            done(error, false);
          }
        });
      }
      logger.info('[PASSPORT] Session (de)serialization enabled');
    }

    logger.info('[PASSPORT] Initialization complete');
  });
}

export { passport };

export default Object.freeze({
  initPassport,
  passport,
  STRATEGY_JWT,
  STRATEGY_DISCORD,
});
