/**
 * ------------------------------------------------------------
 * Role Middleware – Authorization Guards
 * ------------------------------------------------------------
 *
 * Features:
 * - Ultra-fast, allocation-light role/scope guards (any/all/min)
 * - Works with `req.user` (from passport) and optional `req.auth.payload`
 * - Optional role hierarchy (e.g., admin > moderator > user)
 * - Configurable deny behavior & status codes
 * - Safe, strict TypeScript (TS 5+, exactOptionalPropertyTypes-safe)
 *
 * Utilities & Services:
 * - logger.service       : structured diagnostics
 * - async.util           : safeAsync
 * - response.util        : standardResponse
 * - sync.util            : Once (memoized hierarchy map)
 *
 * Usage:
 *   app.get('/admin', requireAnyRole(['admin']));
 *   app.post('/manage', requireAllRoles(['editor','publisher']));
 *   app.get('/mod', requireMinRole('moderator', ['guest','user','moderator','admin']));
 *   app.get('/scoped', requireAllScopes(['orders:read']));
 */

import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';

import type { Request, Response, NextFunction } from 'express';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

/** Minimal principal; align with your auth middleware’s AuthUser. */
export interface Principal {
  id: string;
  email?: string | undefined;
  role?: string | undefined;
  roles?: readonly string[] | undefined;
  scopes?: readonly string[] | undefined;
  [key: string]: unknown;
}

export interface GuardOptions {
  /** Use scopes as roles fallback (default: true). */
  allowScopes?: boolean | undefined;
  /** Called on deny; if provided, you must end the response yourself. */
  onDeny?: ((req: Request, res: Response) => void) | undefined;
  /** HTTP codes (default 401 for unauthenticated, 403 for forbidden). */
  unauthorizedStatus?: number | undefined; // default 401
  forbiddenStatus?: number | undefined; // default 403
  /** Extra logging (default true in non-production). */
  log?: boolean | undefined;
}

/** Role hierarchy: from lowest to highest privilege. */
export type RoleHierarchy = readonly string[];

// ------------------------------------------------------------
// Internals
// ------------------------------------------------------------

const isProd = process.env['NODE_ENV'] === 'production';

function getStatuses(opts?: GuardOptions) {
  return {
    unauth: opts?.unauthorizedStatus ?? 401,
    forbid: opts?.forbiddenStatus ?? 403,
  };
}

function logDeny(enabled: boolean | undefined, msg: string, ctx?: Record<string, unknown>) {
  if (enabled ?? !isProd) {
    logger.warn(`[ROLE] ${msg}`, ctx ?? {});
  }
}

/** Collect a normalized, deduped set of role-like strings for a request. */
function collectRoleBag(req: Request, allowScopes: boolean): Set<string> {
  const bag = new Set<string>();

  const u = req.user as Principal | undefined;
  if (u?.role) bag.add(String(u.role));
  if (u?.roles) for (const r of u.roles) if (r) bag.add(String(r));
  if (allowScopes) {
    if (u?.scopes) for (const s of u.scopes) if (s) bag.add(String(s));
  }

  const p = req.auth?.payload;
  if (p) {
    if (p.role) bag.add(String(p.role));
    const payloadRoles = (p as Record<string, unknown>)['roles'];
    if (Array.isArray(payloadRoles)) {
      for (const r of payloadRoles) if (typeof r === 'string' && r.length > 0) bag.add(r);
    }
    if (allowScopes) {
      const payloadScopes = (p as Record<string, unknown>)['scopes'];
      if (Array.isArray(payloadScopes)) {
        for (const s of payloadScopes) if (typeof s === 'string' && s.length > 0) bag.add(s);
      }
    }
  }

  return bag;
}

/** Quick membership checks. */
function hasAny(bag: Set<string>, required: readonly string[]): boolean {
  for (const r of required) if (bag.has(r)) return true;
  return false;
}
function hasAll(bag: Set<string>, required: readonly string[]): boolean {
  for (const r of required) if (!bag.has(r)) return false;
  return true;
}

/** Build a rank map for hierarchy (memoized per array instance). */
const rankMapCache = new WeakMap<RoleHierarchy, Map<string, number>>();
function getRankMap(h: RoleHierarchy): Map<string, number> {
  const existing = rankMapCache.get(h);
  if (existing) return existing;

  const map = new Map<string, number>();
  for (let i = 0; i < h.length; i++) {
    const role = h[i];
    if (typeof role === 'string' && role.length > 0) {
      map.set(role, i);
    }
  }

  rankMapCache.set(h, map);
  return map;
}

/** Resolve principal’s max rank given a hierarchy. */
function principalRank(bag: Set<string>, hierarchy: RoleHierarchy): number | null {
  const ranks = getRankMap(hierarchy);
  let best: number | null = null;
  for (const r of bag) {
    const v = ranks.get(r);
    if (typeof v === 'number') {
      if (best === null || v > best) best = v;
    }
  }
  return best;
}

/** Common deny responder. */
function deny(req: Request, res: Response, reason: 'unauth' | 'forbid', opts?: GuardOptions) {
  const { unauth, forbid } = getStatuses(opts);
  const code = reason === 'unauth' ? unauth : forbid;

  if (typeof opts?.onDeny === 'function') {
    opts.onDeny(req, res);
    return;
  }

  const payload = reason === 'unauth' ? { error: 'Unauthorized' } : { error: 'Forbidden' };

  standardResponse(res, code, payload);
}

// ------------------------------------------------------------
// Public Guards
// ------------------------------------------------------------

/** Require that the principal is authenticated (i.e., req.user exists). */
export function requireAuthenticated(opts?: GuardOptions) {
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logDeny(opts?.log, 'Unauthenticated access', { path: req.path });
      return deny(req, res, 'unauth', opts);
    }
    return next();
  });
}

/** Require at least one role from the provided list. */
export function requireAnyRole(roles: readonly string[], opts?: GuardOptions) {
  const allowScopes = opts?.allowScopes ?? true;
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logDeny(opts?.log, 'Unauthenticated (requireAnyRole)', { path: req.path });
      return deny(req, res, 'unauth', opts);
    }

    const bag = collectRoleBag(req, allowScopes);
    if (hasAny(bag, roles)) return next();

    logDeny(opts?.log, 'Missing required role (any)', { path: req.path, required: roles });
    return deny(req, res, 'forbid', opts);
  });
}

/** Require all roles from the provided list. */
export function requireAllRoles(roles: readonly string[], opts?: GuardOptions) {
  const allowScopes = opts?.allowScopes ?? true;
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logDeny(opts?.log, 'Unauthenticated (requireAllRoles)', { path: req.path });
      return deny(req, res, 'unauth', opts);
    }

    const bag = collectRoleBag(req, allowScopes);
    if (hasAll(bag, roles)) return next();

    logDeny(opts?.log, 'Missing required role (all)', { path: req.path, required: roles });
    return deny(req, res, 'forbid', opts);
  });
}

/**
 * Require a minimum role based on a hierarchy (ascending order).
 * Example: hierarchy = ['guest','user','moderator','admin']
 * requireMinRole('moderator', hierarchy) allows {moderator, admin}
 */
export function requireMinRole(minRole: string, hierarchy: RoleHierarchy, opts?: GuardOptions) {
  const allowScopes = opts?.allowScopes ?? true;
  const ranks = getRankMap(hierarchy);
  const minRank = ranks.get(minRole);

  if (typeof minRank !== 'number') {
    logger.error('[ROLE] requireMinRole: minRole not found in hierarchy', { minRole, hierarchy });
    // Hard-fail at configuration time.
    throw new RangeError(`minRole "${minRole}" not present in provided hierarchy`);
  }

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logDeny(opts?.log, 'Unauthenticated (requireMinRole)', { path: req.path });
      return deny(req, res, 'unauth', opts);
    }

    const bag = collectRoleBag(req, allowScopes);
    const rank = principalRank(bag, hierarchy);

    if (rank !== null && rank >= minRank) return next();

    logDeny(opts?.log, 'Insufficient role (min)', { path: req.path, minRole, hierarchy });
    return deny(req, res, 'forbid', opts);
  });
}

/** Require at least one scope. */
export function requireAnyScope(scopes: readonly string[], opts?: GuardOptions) {
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logDeny(opts?.log, 'Unauthenticated (requireAnyScope)', { path: req.path });
      return deny(req, res, 'unauth', opts);
    }
    const bag = collectRoleBag(req, /* allowScopes */ true);
    if (hasAny(bag, scopes)) return next();

    logDeny(opts?.log, 'Missing required scope (any)', { path: req.path, required: scopes });
    return deny(req, res, 'forbid', opts);
  });
}

/** Require all scopes. */
export function requireAllScopes(scopes: readonly string[], opts?: GuardOptions) {
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logDeny(opts?.log, 'Unauthenticated (requireAllScopes)', { path: req.path });
      return deny(req, res, 'unauth', opts);
    }
    const bag = collectRoleBag(req, /* allowScopes */ true);
    if (hasAll(bag, scopes)) return next();

    logDeny(opts?.log, 'Missing required scope (all)', { path: req.path, required: scopes });
    return deny(req, res, 'forbid', opts);
  });
}

/**
 * Require user to be the resource owner or have any of the fallback roles.
 * `owner` resolves from request and returns the owner id to compare with req.user.id.
 */
export function requireOwnerOrRoles(
  owner: (req: Request) => string | null,
  roles: readonly string[],
  opts?: GuardOptions,
) {
  const allowScopes = opts?.allowScopes ?? true;
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as Principal | undefined;
    if (!user) {
      logDeny(opts?.log, 'Unauthenticated (requireOwnerOrRoles)', { path: req.path });
      return deny(req, res, 'unauth', opts);
    }

    const ownerId = owner(req);
    if (ownerId && user.id === ownerId) return next();

    const bag = collectRoleBag(req, allowScopes);
    if (hasAny(bag, roles)) return next();

    logDeny(opts?.log, 'Not owner and missing fallback roles', {
      path: req.path,
      required: roles,
      ownerId,
      userId: user.id,
    });
    return deny(req, res, 'forbid', opts);
  });
}

// ------------------------------------------------------------
// Default Export (Frozen)
// ------------------------------------------------------------

type LegacyRoleMiddleware = {
  (roles: readonly string[], opts?: GuardOptions): ReturnType<typeof requireAnyRole>;
  requireAuthenticated: typeof requireAuthenticated;
  requireAnyRole: typeof requireAnyRole;
  requireAllRoles: typeof requireAllRoles;
  requireMinRole: typeof requireMinRole;
  requireAnyScope: typeof requireAnyScope;
  requireAllScopes: typeof requireAllScopes;
  requireOwnerOrRoles: typeof requireOwnerOrRoles;
};

const legacyRoleMiddleware = Object.assign(
  (roles: readonly string[], opts?: GuardOptions) => requireAnyRole(roles, opts),
  {
    requireAuthenticated,
    requireAnyRole,
    requireAllRoles,
    requireMinRole,
    requireAnyScope,
    requireAllScopes,
    requireOwnerOrRoles,
  },
) satisfies LegacyRoleMiddleware;

export default legacyRoleMiddleware;
