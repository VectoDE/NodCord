/**
 * ------------------------------------------------------------
 * Beta Middleware – Enterprise-grade Feature Gate
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Gate (preview/beta) endpoints for approved users/clients
 * - Verify via JWT roles/scopes (+ optional tier) OR via signed beta key
 * - Constant-time key comparison, allocation-light, strict TS5
 *
 * Features:
 * - requireBetaAccess() → hard gate (401/403 on fail)
 * - optionalBetaAccess() → soft attach (continues if absent)
 * - Helpers: requireBetaTier(), requireBetaScope()
 * - Idempotent option normalization, zero-throw happy path
 *
 * Utilities & Services:
 * - logger.service        : structured logs
 * - async.util            : safeAsync
 * - response.util         : standardResponse
 * - sync.util             : Mutex (for any shared state if extended later)
 *
 * Tech:
 * - Node.js 20+, TS 5+ strict + exactOptionalPropertyTypes
 * - Express 5, ESM (NodeNext)
 */

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface BetaOptions {
  /** Header name for beta key. Default: 'x-beta-key' */
  headerName?: string | undefined;
  /** Query param fallback. Default: 'betaKey' */
  queryParam?: string | undefined;
  /** Env var name that stores the expected beta key. Default: 'BETA_ACCESS_KEY' */
  envKeyName?: string | undefined;

  /** Roles allowed via JWT. Default: ['admin','beta','developer'] */
  allowRoles?: readonly string[] | undefined;
  /** Scopes that can grant access (any match). Default: ['beta:access','feature:beta'] */
  requireAnyScope?: readonly string[] | undefined;
  /** Optional beta tiers. If provided, user must match any of these. Default: [] (skip) */
  requireTierAnyOf?: readonly string[] | undefined;

  /** If true, a valid beta key bypasses JWT checks. Default: true */
  keyCanBypassJwt?: boolean | undefined;
  /** Verbose decision logging (without key value). Default: false */
  verboseLog?: boolean | undefined;
}

interface NormalizedBetaOptions {
  headerName: string;
  queryParam: string;
  envKeyName: string;
  allowRoles: readonly string[];
  requireAnyScope: readonly string[];
  requireTierAnyOf: readonly string[];
  keyCanBypassJwt: boolean;
  verboseLog: boolean;
}

declare global {
  namespace Express {
    interface Request {
      /** Populated when beta access is validated (hard or soft). */
      beta?: {
        enabled: boolean;
        /** e.g. "alpha" | "beta" | "ga:preview" */
        tier?: string;
        /** 'jwt' when via roles/scopes; 'key' when via beta key */
        via: 'jwt' | 'key';
        /** Optional note for observability */
        notes?: string;
      };
    }
  }
}

// ------------------------------------------------------------
// Defaults & normalization (allocation-light)
// ------------------------------------------------------------

const DEFAULTS = Object.freeze({
  headerName: 'x-beta-key',
  queryParam: 'betaKey',
  envKeyName: 'BETA_ACCESS_KEY',
  allowRoles: ['admin', 'beta', 'developer'] as const,
  requireAnyScope: ['beta:access', 'feature:beta'] as const,
  requireTierAnyOf: [] as const,
  keyCanBypassJwt: true,
  verboseLog: false,
});

function normalize(opts?: BetaOptions): NormalizedBetaOptions {
  return {
    headerName: opts?.headerName ?? DEFAULTS.headerName,
    queryParam: opts?.queryParam ?? DEFAULTS.queryParam,
    envKeyName: opts?.envKeyName ?? DEFAULTS.envKeyName,
    allowRoles: opts?.allowRoles?.length ? [...opts.allowRoles] : DEFAULTS.allowRoles,
    requireAnyScope: opts?.requireAnyScope?.length
      ? [...opts.requireAnyScope]
      : DEFAULTS.requireAnyScope,
    requireTierAnyOf: opts?.requireTierAnyOf?.length
      ? [...opts.requireTierAnyOf]
      : DEFAULTS.requireTierAnyOf,
    keyCanBypassJwt: opts?.keyCanBypassJwt ?? DEFAULTS.keyCanBypassJwt,
    verboseLog: opts?.verboseLog ?? DEFAULTS.verboseLog,
  };
}

// ------------------------------------------------------------
// Helpers (timing-safe compare, header/query parsing, JWT checks)
// ------------------------------------------------------------

/** constant-time string equality */
function timingSafeEquals(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) {
      // maintain comparable timing
      crypto.timingSafeEqual(ab, ab);
      return false;
    }
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

/** Extract beta key from header or query (no allocations beyond small strings) */
function readBetaKey(req: Request, c: NormalizedBetaOptions): string | null {
  // header first
  const headerVal = c.headerName ? req.header(c.headerName) : undefined;
  if (typeof headerVal === 'string') {
    const s = headerVal.trim();
    if (s) return s;
  }
  // query fallback
  const qp = c.queryParam && req.query ? req.query[c.queryParam] : undefined;
  if (typeof qp === 'string') {
    const s = qp.trim();
    if (s) return s;
  }
  return null;
}

/** Lightweight role check (user or auth payload) */
function hasAnyRole(req: Request, allowed: readonly string[]): boolean {
  // Prefer req.user if present
  const u: unknown = (req as any).user;
  if (u && typeof u === 'object') {
    const role = (u as any).role as string | undefined;
    const roles = (u as any).roles as string[] | undefined;
    if (typeof role === 'string' && allowed.includes(role)) return true;
    if (Array.isArray(roles)) {
      for (const r of roles) if (typeof r === 'string' && allowed.includes(r)) return true;
    }
  }
  // Fallback to raw JWT payload if your auth layer placed it on req.auth.payload
  const p: unknown = (req as any).auth?.payload;
  if (p && typeof p === 'object') {
    const role = (p as any).role as string | undefined;
    const roles = (p as any).roles as string[] | undefined;
    if (typeof role === 'string' && allowed.includes(role)) return true;
    if (Array.isArray(roles)) {
      for (const r of roles) if (typeof r === 'string' && allowed.includes(r)) return true;
    }
  }
  return false;
}

/** Scope check (user scopes, roles-as-scopes, JWT scopes) */
function hasAnyScope(req: Request, required: readonly string[]): boolean {
  if (required.length === 0) return true;

  const bag = new Set<string>();

  const u: unknown = (req as any).user;
  if (u && typeof u === 'object') {
    const scopes = (u as any).scopes as string[] | undefined;
    const roles = (u as any).roles as string[] | undefined;
    if (Array.isArray(scopes)) for (const s of scopes) if (typeof s === 'string') bag.add(s);
    if (Array.isArray(roles)) for (const r of roles) if (typeof r === 'string') bag.add(r);
  }

  const p: unknown = (req as any).auth?.payload;
  if (p && typeof p === 'object') {
    const scopes = (p as any).scopes as string[] | undefined;
    if (Array.isArray(scopes)) for (const s of scopes) if (typeof s === 'string') bag.add(s);
  }

  for (const s of required) if (bag.has(s)) return true;
  return false;
}

/** Extract beta tier from JWT/user (claim dev_tier or role starting with "beta:") */
function extractTier(req: Request): string | undefined {
  const p: unknown = (req as any).auth?.payload;
  if (p && typeof p === 'object') {
    const tierClaim = (p as any).dev_tier as string | undefined;
    if (typeof tierClaim === 'string' && tierClaim) return tierClaim;
  }
  const u: unknown = (req as any).user;
  if (u && typeof u === 'object') {
    const role = (u as any).role as string | undefined;
    const roles = (u as any).roles as string[] | undefined;
    if (typeof role === 'string' && role.startsWith('beta:')) return role.slice(5);
    if (Array.isArray(roles)) {
      for (const r of roles) if (typeof r === 'string' && r.startsWith('beta:')) return r.slice(5);
    }
  }
  return undefined;
}

function tierAllowed(requiredAnyOf: readonly string[], actual?: string): boolean {
  if (requiredAnyOf.length === 0) return true;
  if (!actual) return false;
  return requiredAnyOf.includes(actual);
}

// ------------------------------------------------------------
// Middleware – Hard Gate
// ------------------------------------------------------------

export function requireBetaAccess(options?: BetaOptions) {
  const c = normalize(options);

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1) JWT path
      const viaJwt = hasAnyRole(req, c.allowRoles) || hasAnyScope(req, c.requireAnyScope);

      if (viaJwt) {
        const t = extractTier(req);
        if (!tierAllowed(c.requireTierAnyOf, t)) {
          if (c.verboseLog)
            logger.debug('[BETA] denied (tier mismatch)', {
              need: c.requireTierAnyOf,
              got: t,
              path: req.path,
            });
          return standardResponse(res, 403, 'Beta tier not allowed');
        }
        req.beta = { enabled: true, via: 'jwt', ...(t ? { tier: t } : {}) };
        return next();
      }

      // 2) Beta key path (if enabled)
      if (c.keyCanBypassJwt) {
        const key = readBetaKey(req, c);
        const expectedVar = c.envKeyName;
        const expected = expectedVar ? process.env[expectedVar] : undefined;

        if (key && typeof expected === 'string' && expected) {
          if (timingSafeEquals(key, expected)) {
            req.beta = { enabled: true, via: 'key', notes: 'validated by beta key' };
            return next();
          }
        }
      }

      if (c.verboseLog) {
        logger.debug('[BETA] access denied', {
          path: req.path,
          haveUser: !!(req as any).user,
          roles: (req as any).user?.roles,
          scopes: (req as any).user?.scopes,
          keyProvided: !!readBetaKey(req, c),
        });
      }
      return standardResponse(res, 401, 'Beta access required');
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error('[BETA] gate error', { error: e.message, path: req.path });
      return standardResponse(res, 500, 'Beta gate error');
    }
  });
}

// ------------------------------------------------------------
// Middleware – Soft Attach (non-blocking)
// ------------------------------------------------------------

export function optionalBetaAccess(options?: BetaOptions) {
  const c = normalize(options);

  return safeAsync(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const viaJwt = hasAnyRole(req, c.allowRoles) || hasAnyScope(req, c.requireAnyScope);

      if (viaJwt) {
        const t = extractTier(req);
        if (tierAllowed(c.requireTierAnyOf, t)) {
          req.beta = { enabled: true, via: 'jwt', ...(t ? { tier: t } : {}) };
        }
        return next();
      }

      if (c.keyCanBypassJwt) {
        const key = readBetaKey(req, c);
        const expectedVar = c.envKeyName;
        const expected = expectedVar ? process.env[expectedVar] : undefined;
        if (key && typeof expected === 'string' && expected && timingSafeEquals(key, expected)) {
          req.beta = { enabled: true, via: 'key', notes: 'validated by beta key' };
        }
      }

      return next();
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.warn('[BETA] optional attach failed', { error: e.message, path: (req as any).path });
      return next();
    }
  });
}

// ------------------------------------------------------------
// Fine-grained helpers (post-gate)
// ------------------------------------------------------------

export function requireBetaTier(tiers: readonly string[]) {
  const allowed = new Set(tiers);
  return (req: Request, res: Response, next: NextFunction) => {
    const enabled = !!req.beta?.enabled;
    const tier = req.beta?.tier;
    if (!enabled || !tier || !allowed.has(tier)) {
      return standardResponse(res, 403, 'Required beta tier not satisfied');
    }
    return next();
  };
}

export function requireBetaScope(scopes: readonly string[]) {
  const want = new Set(scopes);
  return (req: Request, res: Response, next: NextFunction) => {
    // Build from user + jwt payload
    const bag = new Set<string>();

    const u: unknown = (req as any).user;
    if (u && typeof u === 'object') {
      const us = (u as any).scopes as string[] | undefined;
      const ur = (u as any).roles as string[] | undefined;
      if (Array.isArray(us)) for (const s of us) if (typeof s === 'string') bag.add(s);
      if (Array.isArray(ur)) for (const r of ur) if (typeof r === 'string') bag.add(r);
    }
    const p: unknown = (req as any).auth?.payload;
    if (p && typeof p === 'object') {
      const ps = (p as any).scopes as string[] | undefined;
      if (Array.isArray(ps)) for (const s of ps) if (typeof s === 'string') bag.add(s);
    }

    for (const s of want) if (bag.has(s)) return next();
    return standardResponse(res, 403, 'Required beta scope not satisfied');
  };
}

// ------------------------------------------------------------
// Default export (frozen)
// ------------------------------------------------------------

export default Object.freeze({
  requireBetaAccess,
  optionalBetaAccess,
  requireBetaTier,
  requireBetaScope,
});
