/**
 * ------------------------------------------------------------
 * CSRF Middleware – High-Performance
 * ------------------------------------------------------------
 *
 * Model:
 * - Double-Submit Cookie with HMAC integrity (no server storage)
 * - Strict Same-Origin checks (Origin/Referer) for cookie-auth requests
 * - Fast path for safe methods (GET/HEAD/OPTIONS/TRACE)
 * - Token auto-issue/rotate via lightweight preflight middleware
 * - Fail-closed verification for state-changing requests
 *
 * Utilities & Services:
 * - logger.service       (Winston): structured logging
 * - async.util           : safeAsync
 * - response.util        : standardResponse
 * - sync.util            : Once, Mutex (secret init & rotation safety)
 * - baseUrl.util (opt.)  : getBaseUrl() for domain scoping
 *
 * Usage (Express 5):
 *   app.use(csrfIssueToken());              // sets/refreshes CSRF cookie & exposes res.locals.csrfToken
 *   app.use(csrfVerify({ exclude: [/^\/webhooks\//] }));  // verify on mutating methods
 *
 *   // Optional endpoint to fetch current token safely (e.g., for SPA bootstrap)
 *   app.get('/csrf-token', sendCsrfToken());
 *
 * Security Notes:
 * - Cookie name: "csrf_token" (NOT httpOnly, SameSite=Strict/Lax, Secure in prod)
 * - Header name: "x-csrf-token" (case-insensitive)
 * - Token: base64url(random|timestamp|hmac) -> 16|8|32 bytes
 * - HMAC binds token to ua+salt+ts; expiration enforced (default 2 hours)
 */

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import logger from '@/services/logger.service';

import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';
import { Once, Mutex } from '@/utils/sync.util';

// Optional base URL util (best-effort)
let getBaseUrlSafe: (() => string) | null = null;
try {
  const mod = require('@/utils/baseUrl.util');
  if (typeof mod.getBaseUrl === 'function') getBaseUrlSafe = mod.getBaseUrl as () => string;
} catch {
  /* noop */
}

// ============================================================
// Constants & Config
// ============================================================

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

const DEFAULT_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2h
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

const secretInitOnce = new Once<void>();
const secretLock = new Mutex(); // rotation safety if ever exposed
let CSRF_SECRET: Buffer = Buffer.alloc(0);

// ============================================================
// Helpers
// ============================================================

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function unbase64url(s: string): Buffer | null {
  if (!s || typeof s !== 'string') return null;
  const pad = s.length % 4 === 2 ? '==' : s.length % 4 === 3 ? '=' : '';
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  try {
    return Buffer.from(b64, 'base64');
  } catch {
    return null;
  }
}

function timingSafeEq(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function getBaseHost(): string | null {
  try {
    if (getBaseUrlSafe) {
      const u = new URL(getBaseUrlSafe());
      return u.host.toLowerCase();
    }
    const envUrl = process.env['BASE_URL'];
    if (envUrl) {
      const u = new URL(envUrl);
      return u.host.toLowerCase();
    }
    const h = process.env['CLIENT_BASE_URL'] ?? 'localhost';
    const p = process.env['CLIENT_PORT'] ?? '3000';
    return `${h}${p ? `:${p}` : ''}`.toLowerCase();
  } catch {
    return null;
  }
}

/** Strict same-origin check for cookie-credentialed requests. */
function isSameOrigin(req: Request): boolean {
  const origin = (req.headers['origin'] as string | undefined)?.toLowerCase();
  const referer = (req.headers['referer'] as string | undefined)?.toLowerCase();
  const hostHdr = (req.headers['host'] as string | undefined)?.toLowerCase();
  const baseHost = getBaseHost();

  // If no Origin/Referer, we can't prove cross-origin; allow by host match (server-to-server)
  if (!origin && !referer) return !baseHost || (hostHdr ? hostHdr === baseHost : true);

  const ref =
    origin ??
    (referer
      ? (() => {
          try {
            return new URL(referer).host.toLowerCase();
          } catch {
            return '';
          }
        })()
      : '');
  if (!ref) return false;
  return !baseHost || ref === baseHost;
}

// ============================================================
// Secret initialization / rotation
// ============================================================

async function initSecret(): Promise<void> {
  await secretInitOnce.run(async () => {
    const fromEnv = process.env['CSRF_SECRET'];
    if (fromEnv && fromEnv.length >= 32) {
      CSRF_SECRET = crypto.createHash('sha256').update(fromEnv).digest();
      logger.info('[CSRF] Using CSRF_SECRET from env (hashed).');
      return;
    }
    const fallback = process.env['JWT_SECRET'] ?? process.env['ACCESS_TOKEN_SECRET'] ?? '';
    if (fallback && fallback.length >= 32) {
      CSRF_SECRET = crypto.createHash('sha256').update(`csrf:${fallback}`).digest();
      logger.warn('[CSRF] Using derived secret from JWT secret.');
      return;
    }
    // Last resort: ephemeral secret (rotates on process restart)
    CSRF_SECRET = crypto.randomBytes(32);
    logger.warn('[CSRF] Using ephemeral in-memory secret (set CSRF_SECRET in env!).');
  });
}

function hmac(data: Buffer): Buffer {
  return crypto.createHmac('sha256', CSRF_SECRET).update(data).digest();
}

/**
 * Token layout:  | 16 bytes random | 8 bytes BE unixms | 32 bytes HMAC |
 * Encoded as base64url: rand|ts|mac
 * HMAC input = rand|ts|uaHash (bind to UA for extra friction)
 */
function makeToken(userAgent: string | undefined): string {
  const rand = crypto.randomBytes(16);
  const ts = Buffer.alloc(8);
  ts.writeBigInt64BE(BigInt(Date.now()));
  const uaHash = crypto
    .createHash('sha256')
    .update(String(userAgent ?? ''))
    .digest();

  const data = Buffer.concat([rand, ts, uaHash]);
  const mac = hmac(data);
  return base64url(Buffer.concat([rand, ts, mac]));
}

function verifyToken(token: string, userAgent: string | undefined, maxAgeMs: number): boolean {
  const raw = unbase64url(token);
  if (!raw || raw.length !== 16 + 8 + 32) return false;

  const rand = raw.subarray(0, 16);
  const ts = raw.subarray(16, 24);
  const mac = raw.subarray(24, 56);

  const issuedMs = Number(ts.readBigInt64BE());
  if (!Number.isFinite(issuedMs) || issuedMs <= 0) return false;
  if (Date.now() - issuedMs > maxAgeMs) return false;

  const uaHash = crypto
    .createHash('sha256')
    .update(String(userAgent ?? ''))
    .digest();
  const data = Buffer.concat([rand, ts, uaHash]);
  const calc = hmac(data);

  return timingSafeEq(mac, calc);
}

// ============================================================
// Cookie options
// ============================================================

function cookieOptions() {
  const prod = process.env['NODE_ENV'] === 'production';
  // Not httpOnly (double-submit requires client to read or send via header),
  // Consider pairing with a /csrf-token endpoint if you prefer httpOnly.
  return {
    httpOnly: false,
    secure: prod,
    sameSite: prod ? ('strict' as const) : ('lax' as const),
    path: '/',
    // No Max-Age -> session cookie; token embeds its own expiry
  };
}

// ============================================================
// Public API – Middlewares
// ============================================================

export interface CsrfVerifyOptions {
  /** Exclude absolute paths or RegExp (e.g., [/^\/webhooks\//]) */
  exclude?: readonly (string | RegExp)[] | undefined;
  /** Token max age in ms (default 2h) */
  maxAgeMs?: number | undefined;
  /** Enforce Origin/Referer same-origin for cookie credentialed requests (default true) */
  enforceSameOrigin?: boolean | undefined;
  /** Header override (default x-csrf-token) */
  headerName?: string | undefined;
  /** Cookie override (default csrf_token) */
  cookieName?: string | undefined;
}

/**
 * Preflight middleware – issues CSRF cookie when missing or invalid.
 * Lightweight and idempotent (runs for all requests).
 */
export function csrfIssueToken(cookieName = CSRF_COOKIE) {
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    await initSecret();

    // we fallback to raw header parse if needed
    const cookieVal = req.cookies?.[cookieName] as string | undefined;
    const ua = (req.headers['user-agent'] as string | undefined) ?? '';

    let issue = true;
    if (cookieVal && verifyToken(cookieVal, ua, DEFAULT_MAX_AGE_MS)) {
      issue = false;
    }

    if (issue) {
      const tok = makeToken(ua);
      res.cookie(cookieName, tok, cookieOptions());
      // expose to views / downstream (optional)
      (res.locals as any).csrfToken = tok;
      logger.debug('[CSRF] Token (re)issued.');
    } else {
      (res.locals as any).csrfToken = cookieVal;
    }

    next();
  });
}

/**
 * Verification middleware – protects mutating requests.
 * Validates:
 *  - Method is protected (POST/PUT/PATCH/DELETE by default)
 *  - Token exists in both cookie and header and is valid & fresh
 *  - (optional) Same-origin via Origin/Referer vs server host
 */
export function csrfVerify(opts?: CsrfVerifyOptions) {
  const exclude = opts?.exclude ?? [];
  const maxAge = opts?.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  const enforceSO = opts?.enforceSameOrigin ?? true;
  const headerName = (opts?.headerName ?? CSRF_HEADER).toLowerCase();
  const cookieName = opts?.cookieName ?? CSRF_COOKIE;

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Fast path: safe methods skip verification but still require token issuance upstream
    if (SAFE_METHODS.has(req.method)) return next();

    // Exclusions
    const path = req.path || req.url || '';
    for (const rule of exclude) {
      if (typeof rule === 'string') {
        if (rule === path) return next();
      } else if (rule instanceof RegExp) {
        if (rule.test(path)) return next();
      }
    }

    // Same-origin (defense-in-depth when cookies are involved)
    if (enforceSO && !isSameOrigin(req)) {
      logger.warn('[CSRF] Same-origin check failed.', {
        path,
        origin: req.headers['origin'],
        referer: req.headers['referer'],
      });
      return standardResponse(res, 403, { error: 'CSRF origin check failed' });
    }

    await initSecret();

    // Extract cookie + header
    const cookieTok = req.cookies?.[cookieName] as string | undefined;
    const headerTok =
      (req.headers[headerName] as string | undefined) ??
      (req.headers[headerName.toLowerCase()] as string | undefined);

    if (!cookieTok || !headerTok) {
      logger.warn('[CSRF] Missing token', { hasCookie: !!cookieTok, hasHeader: !!headerTok });
      return standardResponse(res, 403, { error: 'CSRF token missing' });
    }

    // Double-submit equality check (quick reject)
    if (cookieTok !== headerTok) {
      logger.warn('[CSRF] Token mismatch (cookie vs header).');
      return standardResponse(res, 403, { error: 'CSRF token mismatch' });
    }

    // Cryptographic verification (integrity + age + UA-binding)
    const ua = (req.headers['user-agent'] as string | undefined) ?? '';
    if (!verifyToken(headerTok, ua, maxAge)) {
      logger.warn('[CSRF] Token invalid or expired.');
      return standardResponse(res, 403, { error: 'Invalid or expired CSRF token' });
    }

    // Passed
    return next();
  });
}

/**
 * Small helper endpoint to return the current token (for SPAs).
 * If token is invalid/missing, it issues a new one and returns it.
 */
export function sendCsrfToken(cookieName = CSRF_COOKIE) {
  return safeAsync(async (req: Request, res: Response) => {
    await initSecret();
    let token = req.cookies?.[cookieName] as string | undefined;
    const ua = (req.headers['user-agent'] as string | undefined) ?? '';
    if (!token || !verifyToken(token, ua, DEFAULT_MAX_AGE_MS)) {
      token = makeToken(ua);
      res.cookie(cookieName, token, cookieOptions());
    }
    return standardResponse(res, 200, { csrfToken: token });
  });
}

// ============================================================
// Optional: Manual rotation API (rarely needed)
// ============================================================

export async function rotateCsrfSecret(): Promise<void> {
  await initSecret(); // ensure exists
  await secretLock.runExclusive(async () => {
    CSRF_SECRET = crypto.randomBytes(32);
    logger.warn('[CSRF] Secret rotated. Existing tokens will become invalid.');
  });
}

// ============================================================
// Default export (frozen)
// ============================================================

export default Object.freeze({
  csrfIssueToken,
  csrfVerify,
  sendCsrfToken,
  rotateCsrfSecret,
});
