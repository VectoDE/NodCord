/**
 * ------------------------------------------------------------
 * Developer Program Middleware
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Gate feature flags / preview endpoints for approved developers
 * - Verify via JWT scopes/roles OR a signed program key (header/query)
 * - Constant-time key comparison, zero deps, strict TypeScript
 *
 * Features:
 * - requireDeveloperProgram() → hard gate (401/403 on fail)
 * - optionalDeveloperProgram() → soft attach (continues if absent)
 * - Helpers for tier/role/scope checks
 * - Idempotent config normalization
 *
 * Utilities & Services:
 * - logger.service           : structured logs
 * - response.util            : standardResponse
 * - async.util               : safeAsync
 * - jwt.util (optional)      : read req.auth.payload (if set by your auth layer)
 *
 * Tech:
 * - Node.js 20+, TS 5+ (strict), Express 5
 */

import crypto from 'crypto';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';

// Type-only imports (NodeNext + verbatimModuleSyntax)
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      /** Populated when developer access is validated. */
      developer?: {
        enabled: boolean;
        /** Developer tier, e.g., "alpha" | "beta" | "ga:preview" */
        tier?: string | undefined;
        /** Origin of validation. */
        via: 'jwt' | 'key';
        /** Snapshot of reasons/notes for observability. */
        notes?: string | undefined;
      };
    }
  }
}

// ============================================================
// Options & normalization
// ============================================================

export interface DeveloperProgramOptions {
  /** HTTP header name for program key. Default: 'x-dev-program-key' */
  headerName?: string | undefined;
  /** Query param fallback for program key. Default: 'devKey' */
  queryParam?: string | undefined;
  /** Env var name that stores the expected program key. Default: 'DEV_PROGRAM_KEY' */
  envKeyName?: string | undefined;

  /** Roles allowed via JWT. Default: ['admin','developer'] */
  allowRoles?: readonly string[] | undefined;
  /** Scopes required via JWT (any match). Default: ['dev:access','developer'] */
  requireAnyScope?: readonly string[] | undefined;

  /** Optional required developer tier. If set, user must match one of these. */
  requireTierAnyOf?: readonly string[] | undefined;

  /** If true, a valid key bypasses JWT checks. Default: true */
  keyCanBypassJwt?: boolean | undefined;

  /** If true, log sensitive decision details (not the key). Default: false */
  verboseLog?: boolean | undefined;
}

const DEFAULTS = {
  headerName: 'x-dev-program-key',
  queryParam: 'devKey',
  envKeyName: 'DEV_PROGRAM_KEY',
  allowRoles: ['admin', 'developer'] as const,
  requireAnyScope: ['dev:access', 'developer'] as const,
  requireTierAnyOf: [] as const,
  keyCanBypassJwt: true,
  verboseLog: false,
};

interface NormalizedDeveloperProgramOptions {
  headerName: string;
  queryParam: string;
  envKeyName: string;
  allowRoles: readonly string[];
  requireAnyScope: readonly string[];
  requireTierAnyOf: readonly string[];
  keyCanBypassJwt: boolean;
  verboseLog: boolean;
}

function cfg(opts?: DeveloperProgramOptions): NormalizedDeveloperProgramOptions {
  return {
    headerName: opts?.headerName ?? DEFAULTS.headerName,
    queryParam: opts?.queryParam ?? DEFAULTS.queryParam,
    envKeyName: opts?.envKeyName ?? DEFAULTS.envKeyName,
    allowRoles: opts?.allowRoles?.length ? [...opts.allowRoles] : [...DEFAULTS.allowRoles],
    requireAnyScope: opts?.requireAnyScope?.length
      ? [...opts.requireAnyScope]
      : [...DEFAULTS.requireAnyScope],
    requireTierAnyOf: opts?.requireTierAnyOf?.length
      ? [...opts.requireTierAnyOf]
      : [...DEFAULTS.requireTierAnyOf],
    keyCanBypassJwt: opts?.keyCanBypassJwt ?? DEFAULTS.keyCanBypassJwt,
    verboseLog: opts?.verboseLog ?? DEFAULTS.verboseLog,
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry === 'string' && entry.length > 0) out.push(entry);
  }
  return out;
}

function readAuthPayload(auth: Request['auth'] | undefined): Record<string, unknown> | undefined {
  if (!auth?.payload) return undefined;
  return auth.payload as Record<string, unknown>;
}

function readAuthScopes(auth: Request['auth'] | undefined): string[] | undefined {
  const payload = readAuthPayload(auth);
  const rawScopes = payload?.['scopes'];
  const scopes = toStringArray(rawScopes);
  return scopes.length ? scopes : undefined;
}

// ============================================================
// Core helpers
// ============================================================

function timingSafeEquals(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) {
      // Keep timing comparable: compare against itself
      crypto.timingSafeEqual(ab, ab);
      return false;
    }
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

function readProgramKey(req: Request, c: NormalizedDeveloperProgramOptions): string | null {
  const headerName = c.headerName ?? '';
  const headerValRaw = headerName ? req.header(headerName) : undefined;
  if (typeof headerValRaw === 'string' && headerValRaw.trim()) return headerValRaw.trim();

  const qpKey = c.queryParam ?? '';
  const qp = qpKey && req.query ? req.query[qpKey] : undefined;
  if (typeof qp === 'string' && qp.trim()) return qp.trim();
  return null;
}

function checkKey(req: Request, c: NormalizedDeveloperProgramOptions): boolean {
  const provided = readProgramKey(req, c);
  const envKeyName = c.envKeyName ?? '';
  const expected = envKeyName ? process.env[envKeyName] : undefined;

  if (!expected || !provided) return false;
  const ok = timingSafeEquals(provided, expected);
  if (c.verboseLog) {
    logger.debug('[DEVPROG] key check', {
      ok,
      header: !!req.header(c.headerName),
      query: !!req.query?.[c.queryParam],
    });
  }
  return ok;
}

function hasAnyRole(u: Request['user'], allowed: readonly string[]): boolean {
  if (!u) return false;
  const bag = new Set<string>([u.role, ...(u.roles ?? [])].filter(Boolean) as string[]);
  for (const r of allowed) if (bag.has(r)) return true;
  return false;
}

function hasAnyScope(
  u: Request['user'] | undefined,
  authScopes: readonly string[] | undefined,
  required: readonly string[],
): boolean {
  const bag = new Set<string>([
    ...((u?.scopes ?? []) as string[]),
    ...((u?.roles ?? []) as string[]),
    ...(authScopes ?? []),
  ]);
  for (const s of required) if (bag.has(s)) return true;
  return false;
}

function extractTier(u: Request['user'], auth: Request['auth'] | undefined): string | undefined {
  // Prefer explicit claim in payload (e.g., dev_tier), fallback to role naming like "dev:alpha"
  const payload = readAuthPayload(auth);
  const tierClaim = payload?.['dev_tier'];
  if (typeof tierClaim === 'string' && tierClaim.trim().length > 0) {
    return tierClaim.trim();
  }

  const roles = new Set<string>([u?.role, ...(u?.roles ?? [])].filter(Boolean) as string[]);
  for (const r of roles) {
    if (r.startsWith('dev:')) return r.slice(4);
  }
  return undefined;
}

function tierAllowed(requiredAnyOf: readonly string[], actual?: string): boolean {
  if (!requiredAnyOf.length) return true;
  if (!actual) return false;
  return requiredAnyOf.includes(actual);
}

// ============================================================
// Middlewares
// ============================================================

/**
 * Hard gate: requires either
 * - JWT roles/scopes (+ optional tier) OR
 * - Valid program key (if keyCanBypassJwt=true)
 */
export function requireDeveloperProgram(options?: DeveloperProgramOptions) {
  const c = cfg(options);

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const authScopes = readAuthScopes(req.auth);

      const viaJwt =
        hasAnyRole(user, c.allowRoles) || hasAnyScope(user, authScopes, c.requireAnyScope);

      if (viaJwt) {
        const tier = extractTier(user, req.auth);
        if (!tierAllowed(c.requireTierAnyOf, tier)) {
          if (c.verboseLog)
            logger.debug('[DEVPROG] denied (tier mismatch)', {
              need: c.requireTierAnyOf,
              got: tier,
            });
          return standardResponse(res, 403, 'Developer tier not allowed');
        }
        req.developer = { enabled: true, tier, via: 'jwt' };
        return next();
      }

      if (c.keyCanBypassJwt && checkKey(req, c)) {
        req.developer = { enabled: true, via: 'key', notes: 'validated by program key' };
        return next();
      }

      if (c.verboseLog) {
        logger.debug('[DEVPROG] denied', {
          haveUser: !!user,
          role: user?.role,
          roles: user?.roles,
          jwtScopes: user?.scopes,
          authScopes,
          keyProvided: !!readProgramKey(req, c),
        });
      }
      return standardResponse(res, 401, 'Developer access required');
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error('[DEVPROG] require failed', { error: e.message });
      return standardResponse(res, 500, 'Developer gate error');
    }
  });
}

/**
 * Soft attach: marks req.developer if access is present, otherwise continues silently.
 * Useful for enabling previews without blocking public endpoints.
 */
export function optionalDeveloperProgram(options?: DeveloperProgramOptions) {
  const c = cfg(options);

  return safeAsync(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const authScopes = readAuthScopes(req.auth);

      const viaJwt =
        hasAnyRole(user, c.allowRoles) || hasAnyScope(user, authScopes, c.requireAnyScope);

      if (viaJwt) {
        const tier = extractTier(user, req.auth);
        if (tierAllowed(c.requireTierAnyOf, tier)) {
          req.developer = { enabled: true, tier, via: 'jwt' };
        }
        return next();
      }

      if (c.keyCanBypassJwt && checkKey(req, c)) {
        req.developer = { enabled: true, via: 'key', notes: 'validated by program key' };
      }
      return next();
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error('[DEVPROG] optional attach failed', { error: e.message });
      return next();
    }
  });
}

// ============================================================
// Fine-grained helpers
// ============================================================

/** Require specific developer tier(s) after developer gate. */
export function requireDeveloperTier(tiers: readonly string[]) {
  const allowed = new Set(tiers);
  return (req: Request, res: Response, next: NextFunction) => {
    const tier = req.developer?.tier;
    if (!req.developer?.enabled || !tier || !allowed.has(tier)) {
      return standardResponse(res, 403, 'Developer tier required');
    }
    return next();
  };
}

/** Require one of the provided scopes (when using JWT path). */
export function requireDeveloperScope(scopes: readonly string[]) {
  const want = new Set(scopes);
  return (req: Request, res: Response, next: NextFunction) => {
    const userScopes = new Set<string>([
      ...(((req.user?.scopes ?? []) as string[]) ?? []),
      ...(((req.user?.roles ?? []) as string[]) ?? []),
      ...(readAuthScopes(req.auth) ?? []),
    ]);
    for (const s of want) if (userScopes.has(s)) return next();
    return standardResponse(res, 403, 'Developer scope required');
  };
}

// ============================================================
// Default export (frozen)
// ============================================================

export default Object.freeze({
  requireDeveloperProgram,
  optionalDeveloperProgram,
  requireDeveloperTier,
  requireDeveloperScope,
});
