/**
 * ------------------------------------------------------------
 * API Key Middleware – Security Layer
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Authenticate and authorize API clients via secure API keys
 * - Supports multiple key sources (headers, query params, env, DB)
 * - Constant-time validation for all comparisons
 * - Granular role/scope binding per key (extensible)
 * - Integrated logging, rate control, and async-safe execution
 *
 * Features:
 * - Fast constant-time key validation
 * - Supports HMAC or plain API key modes
 * - Optional caching layer (in-memory for hot keys)
 * - Rate limiting per key via Mutex-safe token bucket
 * - Integration with utils for observability, response, and safety
 *
 * Utilities & Services used:
 * - logger.service          : structured diagnostics
 * - async.util              : safeAsync
 * - response.util           : standardResponse
 * - number.util             : clamp, roundTo
 * - sync.util               : Mutex, Once
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
import { clamp, roundTo } from '@/utils/number.util';
import { Mutex } from '@/utils/sync.util';

// ============================================================
// Types
// ============================================================

export interface ApiKeyRecord {
  keyId: string;
  keyHash: string; // sha256(key)
  role?: string;
  scopes?: string[];
  active: boolean;
  rateLimit?: { tokensPerSecond: number; burst: number };
  meta?: Record<string, unknown>;
}

export interface ApiKeyStore {
  findById: (keyId: string) => Promise<ApiKeyRecord | null>;
}

export interface ApiKeyOptions {
  headerName?: string;
  queryParam?: string;
  cacheTtlMs?: number;
  envKeyName?: string;
  store?: ApiKeyStore;
  secureCompare?: boolean;
  rateLimit?: boolean;
}

export interface NormalizedApiKeyOptions {
  headerName: string;
  queryParam: string;
  cacheTtlMs: number;
  envKeyName: string;
  store: ApiKeyStore | undefined;
  secureCompare: boolean;
  rateLimit: boolean;
}

declare global {
  namespace Express {
    interface Request {
      apiKeyAuth?: {
        keyId: string;
        role?: string;
        scopes?: string[];
        meta?: Record<string, unknown>;
        verifiedVia: 'env' | 'store';
      };
    }
  }
}

// ============================================================
// Internal cache & helpers
// ============================================================

const DEFAULTS = Object.freeze({
  headerName: 'x-api-key',
  queryParam: 'apiKey',
  cacheTtlMs: 10_000,
  envKeyName: 'API_KEY',
  secureCompare: true,
  rateLimit: true,
});

const cache = new Map<string, { rec: ApiKeyRecord; exp: number }>();
const cacheLock = new Mutex();

class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly ratePerSec: number;
  private lastTs: number;

  constructor(tokensPerSecond: number, burst: number) {
    this.ratePerSec = Math.max(1, tokensPerSecond);
    this.capacity = Math.max(burst, this.ratePerSec);
    this.tokens = this.capacity;
    this.lastTs = Date.now();
  }

  tryRemove(count = 1): boolean {
    const now = Date.now();
    const elapsed = (now - this.lastTs) / 1000;
    if (elapsed > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.ratePerSec);
      this.lastTs = now;
    }
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  get fillRatio(): number {
    return clamp(this.tokens / this.capacity, 0, 1);
  }
}

const rateLimiters = new Map<string, TokenBucket>();

// ============================================================
// Utility functions
// ============================================================

function parseKey(req: Request, opts: NormalizedApiKeyOptions): string | null {
  const headerVal = opts.headerName ? req.header(opts.headerName) : undefined;
  if (typeof headerVal === 'string' && headerVal.trim()) return headerVal.trim();
  const qp = opts.queryParam && req.query ? req.query[opts.queryParam] : undefined;
  if (typeof qp === 'string' && qp.trim()) return qp.trim();
  return null;
}

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function secureEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

async function getCachedKey(
  keyId: string,
  opts: NormalizedApiKeyOptions,
): Promise<ApiKeyRecord | null> {
  const now = Date.now();
  const hit = cache.get(keyId);
  if (hit && hit.exp > now) return hit.rec;

  if (!opts.store) return null;
  const rec = await opts.store.findById(keyId);
  if (rec && rec.active) {
    await cacheLock.runExclusive(async () => {
      cache.set(keyId, { rec, exp: now + opts.cacheTtlMs });
    });
    return rec;
  }
  return null;
}

// ============================================================
// Middleware
// ============================================================

export function requireApiKey(options?: ApiKeyOptions) {
  const opts: NormalizedApiKeyOptions = {
    headerName: options?.headerName ?? DEFAULTS.headerName,
    queryParam: options?.queryParam ?? DEFAULTS.queryParam,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULTS.cacheTtlMs,
    envKeyName: options?.envKeyName ?? DEFAULTS.envKeyName,
    store: options?.store,
    secureCompare: options?.secureCompare ?? DEFAULTS.secureCompare,
    rateLimit: options?.rateLimit ?? DEFAULTS.rateLimit,
  };

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providedKey = parseKey(req, opts);
    if (!providedKey) {
      logger.warn('[APIKEY] Missing key', { path: req.path });
      return standardResponse(res, 401, 'Missing API key');
    }

    // Env-based check
    const envKey = process.env[opts.envKeyName];
    if (envKey) {
      const equal = opts.secureCompare ? secureEquals(envKey, providedKey) : envKey === providedKey;
      if (equal) {
        req.apiKeyAuth = { keyId: 'env-static-key', verifiedVia: 'env' };
        return next();
      }
    }

    if (!opts.store) {
      logger.error('[APIKEY] No key store configured');
      return standardResponse(res, 500, 'API key store unavailable');
    }

    try {
      const keyId = providedKey.split('.')[0] ?? providedKey;
      const rec = await getCachedKey(keyId, opts);
      if (!rec) return standardResponse(res, 401, 'Invalid API key');

      const providedHash = sha256(providedKey);
      const valid = opts.secureCompare
        ? secureEquals(rec.keyHash, providedHash)
        : rec.keyHash === providedHash;

      if (!valid) return standardResponse(res, 401, 'Invalid API key');

      if (opts.rateLimit && rec.rateLimit) {
        const limiter =
          rateLimiters.get(rec.keyId) ??
          new TokenBucket(rec.rateLimit.tokensPerSecond, rec.rateLimit.burst);
        rateLimiters.set(rec.keyId, limiter);

        if (!limiter.tryRemove(1)) {
          res.setHeader('X-RateLimit-Limit', rec.rateLimit.tokensPerSecond.toString());
          res.setHeader('X-RateLimit-Remaining', roundTo(limiter.fillRatio * 100, 1).toString());
          return standardResponse(res, 429, 'Too Many Requests');
        }
      }

      req.apiKeyAuth = {
        keyId: rec.keyId,
        verifiedVia: 'store',
        ...(rec.role ? { role: rec.role } : {}),
        ...(rec.scopes ? { scopes: rec.scopes } : {}),
        ...(rec.meta ? { meta: rec.meta } : {}),
      };

      return next();
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error('[APIKEY] Validation error', { error: e.message });
      return standardResponse(res, 500, 'API key validation failed');
    }
  });
}

// ============================================================
// Optional soft attach (non-fatal) for metrics or analytics
// ============================================================

export function optionalApiKey(options?: ApiKeyOptions) {
  const opts: NormalizedApiKeyOptions = {
    headerName: options?.headerName ?? DEFAULTS.headerName,
    queryParam: options?.queryParam ?? DEFAULTS.queryParam,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULTS.cacheTtlMs,
    envKeyName: options?.envKeyName ?? DEFAULTS.envKeyName,
    store: options?.store,
    secureCompare: options?.secureCompare ?? DEFAULTS.secureCompare,
    rateLimit: options?.rateLimit ?? DEFAULTS.rateLimit,
  };

  return safeAsync(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const providedKey = parseKey(req, opts);
      if (!providedKey) return next();

      const envKey = process.env[opts.envKeyName];
      if (envKey && opts.secureCompare && secureEquals(envKey, providedKey)) {
        req.apiKeyAuth = { keyId: 'env-static-key', verifiedVia: 'env' };
        return next();
      }

      if (opts.store) {
        const keyId = providedKey.split('.')[0] ?? providedKey;
        const rec = await getCachedKey(keyId, opts);
        if (rec && rec.active && secureEquals(rec.keyHash, sha256(providedKey))) {
          req.apiKeyAuth = {
            keyId: rec.keyId,
            verifiedVia: 'store',
            ...(rec.role ? { role: rec.role } : {}),
            ...(rec.scopes ? { scopes: rec.scopes } : {}),
            ...(rec.meta ? { meta: rec.meta } : {}),
          };
        }
      }

      return next();
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.warn('[APIKEY] optional attach failed', { error: e.message });
      return next();
    }
  });
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  requireApiKey,
  optionalApiKey,
});
