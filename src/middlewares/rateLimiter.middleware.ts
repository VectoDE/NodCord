/**
 * ------------------------------------------------------------
 * Rate Limiter Middleware – Performance Layer
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Per-client token-bucket rate limiting (GC-light, O(1) hot paths)
 * - Works with IP / user / API key (auto-detect or custom keyFn)
 * - Accurate headers: X-RateLimit-Limit/Remaining/Reset + Retry-After
 *
 * Features:
 * - Ultra-fast refill-on-access token buckets
 * - Pluggable key resolution (apiKeyAuth -> user -> IP)
 * - Dynamic cost function (per path/method/payload)
 * - Allowlist / bypass keys
 * - Background sweeper (LRU-ish) with Once guard
 * - Safe with strict TS 5 + exactOptionalPropertyTypes
 *
 * Utilities & Services:
 * - logger.service : structured logs
 * - async.util     : safeAsync
 * - number.util    : clamp
 * - sync.util      : Once
 *
 * Tech:
 * - Node.js 20+, Express 5, TS 5 strict
 * - exactOptionalPropertyTypes: true
 * - ESM (NodeNext)
 */

import type { Request, Response, NextFunction } from 'express';
import { performance } from 'node:perf_hooks';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { Once } from '@/utils/sync.util';

// ============================================================
// Types
// ============================================================

export interface RateLimiterOptions {
  /** Tokens replenished per second (>=1). Default: 10 */
  tokensPerSecond?: number | undefined;
  /** Maximum burst (>= tokensPerSecond). Default: 30 */
  burst?: number | undefined;

  /**
   * Derive a limiter key from the request.
   * Default: apiKeyAuth.keyId -> user.id/sub -> client IP (X-Forwarded-For first hop -> remoteAddress)
   */
  keyFn?: ((req: Request) => string | null | undefined) | undefined;

  /** Bypass keys (no limiting). Exact match on resolved key. Default: [] */
  allowlist?: readonly string[] | undefined;

  /**
   * Cost per request (tokens to remove). Can vary by route/method/payload.
   * Return a positive integer; default: 1
   */
  costFn?: ((req: Request) => number | Promise<number>) | undefined;

  /** Include standard headers (X-RateLimit-*) on responses. Default: true */
  headers?: boolean | undefined;

  /** Whether to include Retry-After on 429. Default: true */
  retryAfterHeader?: boolean | undefined;

  /** Log decisions (debug level). Default: false */
  verboseLog?: boolean | undefined;

  /** Background GC: sweep idle buckets older than this many seconds. Default: 900 (15m) */
  idleSecondsForGC?: number | undefined;

  /** Background GC cadence in seconds. Default: 60 */
  sweepIntervalSeconds?: number | undefined;

  /** Namespace label (for logs/metrics separation). Default: 'global' */
  namespace?: string | undefined;
}

interface NormalizedRateLimiterOptions {
  tokensPerSecond: number;
  burst: number;
  keyFn: (req: Request) => string | null | undefined;
  allowlist: readonly string[];
  costFn: (req: Request) => number | Promise<number>;
  headers: boolean;
  retryAfterHeader: boolean;
  verboseLog: boolean;
  idleSecondsForGC: number;
  sweepIntervalSeconds: number;
  namespace: string;
}

// ============================================================
// Token bucket & registry
// ============================================================

class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly ratePerSec: number;
  private lastTs: number; // epoch ms
  lastSeen: number; // epoch ms (for GC)

  constructor(tokensPerSecond: number, burst: number) {
    this.ratePerSec = Math.max(1, tokensPerSecond | 0);
    this.capacity = Math.max(this.ratePerSec, burst | 0);
    this.tokens = this.capacity;
    const now = Date.now();
    this.lastTs = now;
    this.lastSeen = now;
  }

  /** Try to spend `cost` tokens; refills on access. Returns accepted + waitSeconds (if rejected). */
  tryConsume(cost: number): { ok: boolean; waitSeconds: number } {
    const now = Date.now();
    const elapsed = Math.max(0, now - this.lastTs) / 1000;
    if (elapsed > 0) {
      // Refill linearly; clamp to capacity
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.ratePerSec);
      this.lastTs = now;
    }

    this.lastSeen = now;

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return { ok: true, waitSeconds: 0 };
    }

    // Compute seconds to wait for enough tokens for this cost
    const deficit = cost - this.tokens;
    const waitSeconds = deficit / this.ratePerSec;
    return { ok: false, waitSeconds };
  }

  /** Remaining fractional tokens (useful for diagnostics). */
  remaining(): number {
    return this.tokens;
  }

  /** Absolute capacity (burst). */
  limit(): number {
    return this.capacity;
  }

  /** Rate per second (for headers or metrics). */
  rate(): number {
    return this.ratePerSec;
  }
}

// Global registry per namespace
const registries = new Map<string, Map<string, TokenBucket>>();
const sweepers = new Map<string, NodeJS.Timeout>();
const initOnce = new Once<void>();

// ============================================================
// Helpers
// ============================================================

function normalize(opts?: RateLimiterOptions): NormalizedRateLimiterOptions {
  const tokensPerSecond = Math.max(1, (opts?.tokensPerSecond ?? 10) | 0);
  const burst = Math.max(tokensPerSecond, (opts?.burst ?? 30) | 0);

  return {
    tokensPerSecond,
    burst,
    keyFn: opts?.keyFn ?? defaultKeyFn,
    allowlist: opts?.allowlist?.length ? opts.allowlist : [],
    costFn: opts?.costFn ?? (() => 1),
    headers: opts?.headers ?? true,
    retryAfterHeader: opts?.retryAfterHeader ?? true,
    verboseLog: opts?.verboseLog ?? false,
    idleSecondsForGC: Math.max(60, (opts?.idleSecondsForGC ?? 900) | 0),
    sweepIntervalSeconds: Math.max(10, (opts?.sweepIntervalSeconds ?? 60) | 0),
    namespace: opts?.namespace ?? 'global',
  };
}

function defaultKeyFn(req: Request): string | null | undefined {
  // 1) API key
  const apiKeyId = (req as any).apiKeyAuth?.keyId as string | undefined;
  if (apiKeyId) return `k:${apiKeyId}`;

  // 2) Auth user
  const user = (req as any).user as { id?: string; email?: string } | undefined;
  if (user?.id) return `u:${user.id}`;
  const sub = (req as any).auth?.payload?.sub as string | undefined;
  if (sub) return `u:${sub}`;

  // 3) IP (trust first XFF hop if present)
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return `ip:${first}`;
  }
  const ip = req.socket.remoteAddress;
  if (ip) return `ip:${ip}`;

  // 4) Fallback (should not happen)
  return null;
}

function getRegistry(ns: string): Map<string, TokenBucket> {
  let reg = registries.get(ns);
  if (!reg) {
    reg = new Map<string, TokenBucket>();
    registries.set(ns, reg);
  }
  return reg;
}

function startSweeper(
  ns: string,
  reg: Map<string, TokenBucket>,
  idleSec: number,
  cadenceSec: number,
  verbose: boolean,
): void {
  if (sweepers.has(ns)) return;
  const timer = setInterval(() => {
    const now = Date.now();
    const cutoff = now - idleSec * 1000;
    let removed = 0;
    for (const [k, b] of reg) {
      if (b.lastSeen < cutoff) {
        reg.delete(k);
        removed++;
      }
    }
    if (verbose && removed > 0) {
      logger.debug('[RATE] GC', { ns, removed, size: reg.size });
    }
  }, cadenceSec * 1000);
  // Node won't keep process alive for active interval by default in Node >= 11
  sweepers.set(ns, timer);
}

function headersIfEnabled(
  res: Response,
  enabled: boolean,
  limit: number,
  remaining: number,
  resetSeconds: number,
): void {
  if (!enabled) return;
  res.setHeader('X-RateLimit-Limit', String(limit));
  // RFC-ish: Remaining rounded down to int for client-friendly semantics
  const remInt = Math.max(0, Math.floor(remaining));
  res.setHeader('X-RateLimit-Remaining', String(remInt));
  // Reset: seconds to full burst; we expose as integer seconds
  res.setHeader('X-RateLimit-Reset', String(Math.max(0, Math.ceil(resetSeconds))));
}

// ============================================================
// Middleware
// ============================================================

export function rateLimiterMiddleware(options?: RateLimiterOptions) {
  const cfg = normalize(options);
  const reg = getRegistry(cfg.namespace);

  // Initialize sweeper once per process (first middleware creation anywhere)
  // and per-namespace sweeper (lightweight)
  void initOnce.run(async () => {
    // no-op global init hook if needed later
  });
  startSweeper(cfg.namespace, reg, cfg.idleSecondsForGC, cfg.sweepIntervalSeconds, cfg.verboseLog);

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    const t0 = performance.now();

    const key = cfg.keyFn(req) ?? null;
    if (!key) {
      // If no key determinable → allow, but log once in verbose
      if (cfg.verboseLog)
        logger.debug('[RATE] no key resolvable; skipping', { ns: cfg.namespace, path: req.path });
      return next();
    }

    if (cfg.allowlist.length && cfg.allowlist.includes(key)) {
      if (cfg.verboseLog) logger.debug('[RATE] allowlisted', { ns: cfg.namespace, key });
      return next();
    }

    const costRaw = await cfg.costFn(req);
    const cost = Math.max(1, costRaw | 0);

    let bucket = reg.get(key);
    if (!bucket) {
      bucket = new TokenBucket(cfg.tokensPerSecond, cfg.burst);
      reg.set(key, bucket);
    }

    const { ok, waitSeconds } = bucket.tryConsume(cost);

    // Fill headers (best-effort)
    const remaining = bucket.remaining();
    const limit = bucket.limit();
    // Approximate reset time to reach full burst again
    const resetSeconds = (limit - remaining) / bucket.rate();
    headersIfEnabled(res, cfg.headers, limit, remaining, resetSeconds);

    if (ok) {
      if (cfg.verboseLog) {
        const dur = Math.round(performance.now() - t0);
        logger.debug('[RATE] OK', {
          ns: cfg.namespace,
          key,
          cost,
          rem: Math.floor(remaining),
          ms: dur,
        });
      }
      return next();
    }

    // Too many requests
    if (cfg.retryAfterHeader) {
      // Retry-After in seconds (integer)
      const retry = Math.max(1, Math.ceil(waitSeconds));
      res.setHeader('Retry-After', String(retry));
    }

    if (cfg.verboseLog) {
      const dur = Math.round(performance.now() - t0);
      logger.debug('[RATE] THROTTLE', {
        ns: cfg.namespace,
        key,
        cost,
        wait: waitSeconds.toFixed(2),
        ms: dur,
      });
    }

    res.status(429).json({ error: 'Too Many Requests' });
  });
}

// ============================================================
// Control helpers (optional)
// ============================================================

/** Clear all buckets in a namespace (hot-reload safe). */
export function resetRateLimiter(namespace = 'global'): void {
  registries.get(namespace)?.clear();
}

/** Stop background sweeper for a namespace (e.g., on shutdown tests). */
export function stopRateLimiterSweeper(namespace = 'global'): void {
  const t = sweepers.get(namespace);
  if (t) {
    clearInterval(t);
    sweepers.delete(namespace);
  }
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  rateLimiterMiddleware,
  resetRateLimiter,
  stopRateLimiterSweeper,
});
