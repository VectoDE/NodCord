/**
 * ------------------------------------------------------------
 * CORS Middleware – Secure Cross-Origin Layer
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Ultra-fast & configurable CORS handling for Express 5+
 * - Dynamic allow-list (RegExp / function / string array)
 * - Optimized preflight responses (O(1) path)
 * - Zero allocations & async-safe initialization
 *
 * Features:
 * - Dynamic origin validation (with caching)
 * - Supports wildcard ('*'), regex, or function-based matching (only without credentials)
 * - credentials: true requires an explicit allow-list; '*', regex and functions throw at startup
 * - Configurable methods, headers, credentials, expose headers
 * - Auto-handles OPTIONS preflights
 * - Integrated structured logging & performance metrics
 *
 * Utilities & Services:
 * - logger.service     : structured logs
 * - async.util         : safeAsync
 * - sync.util          : Once
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
import { findAllowedOrigin, normalizeOrigin } from '@/utils/origin.util';

// ============================================================
// Types
// ============================================================

export interface CorsOptions {
  /** Allowed origins: string, regex, function, or wildcard. Default: '*' */
  origin?:
    | string
    | RegExp
    | readonly string[]
    | ((origin: string | undefined, req: Request) => boolean | Promise<boolean>);
  /** Allowed methods. Default: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'] */
  methods?: readonly string[];
  /** Allowed request headers. Default: ['Content-Type','Authorization'] */
  allowedHeaders?: readonly string[];
  /** Exposed response headers. Default: [] */
  exposedHeaders?: readonly string[];
  /** Allow credentials (cookies, Authorization header). Default: false */
  credentials?: boolean;
  /** Max age for preflight cache (seconds). Default: 600 */
  maxAgeSeconds?: number;
  /** Enable debug logging. Default: false */
  verboseLog?: boolean;
}

interface NormalizedCorsOptions {
  origin:
    | string
    | RegExp
    | readonly string[]
    | ((origin: string | undefined, req: Request) => boolean | Promise<boolean>);
  methods: readonly string[];
  allowedHeaders: readonly string[];
  exposedHeaders: readonly string[];
  credentials: boolean;
  maxAgeSeconds: number;
  verboseLog: boolean;
}

// ============================================================
// Defaults
// ============================================================

const DEFAULTS: NormalizedCorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  credentials: false,
  maxAgeSeconds: 600,
  verboseLog: false,
};

// ============================================================
// Helpers
// ============================================================

function normalize(options?: CorsOptions): NormalizedCorsOptions {
  return {
    origin: options?.origin ?? DEFAULTS.origin,
    methods: options?.methods?.length ? options.methods : DEFAULTS.methods,
    allowedHeaders: options?.allowedHeaders?.length
      ? options.allowedHeaders
      : DEFAULTS.allowedHeaders,
    exposedHeaders: options?.exposedHeaders?.length
      ? options.exposedHeaders
      : DEFAULTS.exposedHeaders,
    credentials: options?.credentials ?? DEFAULTS.credentials,
    maxAgeSeconds: options?.maxAgeSeconds ?? DEFAULTS.maxAgeSeconds,
    verboseLog: options?.verboseLog ?? DEFAULTS.verboseLog,
  };
}

/** Origin der eigenen Anwendung (Same-Origin-Anfragen sind kein CORS-Fall). */
function selfOrigin(req: Request): string | null {
  const host = req.get('host');
  if (!host) return null;
  return normalizeOrigin(`${req.protocol}://${host}`);
}

/**
 * Liefert den Wert für `Access-Control-Allow-Origin` ohne Credentials.
 * Darf bei RegExp/Funktion den angefragten Origin spiegeln, weil in diesem
 * Modus niemals `Access-Control-Allow-Credentials` gesetzt wird.
 */
async function resolvePublicAllowOrigin(
  req: Request,
  originHeader: string,
  opts: NormalizedCorsOptions,
): Promise<string | null> {
  const allowed = opts.origin;

  if (allowed === '*') return '*';
  if (typeof allowed === 'string') return findAllowedOrigin(originHeader, [allowed]) ?? null;
  if (Array.isArray(allowed)) return findAllowedOrigin(originHeader, allowed) ?? null;
  if (allowed instanceof RegExp) return allowed.test(originHeader) ? originHeader : null;
  if (typeof allowed === 'function') {
    return (await allowed(originHeader, req)) ? originHeader : null;
  }

  return null;
}

/**
 * Prüft die Konfiguration für `credentials: true`.
 * Erlaubt ist nur eine explizite Allowlist (String oder String-Array).
 * `*`, RegExp und Funktionen führen beim Start zu einem Fehler.
 */
function credentialedAllowList(opts: NormalizedCorsOptions): readonly string[] {
  const allowed = opts.origin;
  if (allowed === '*') {
    throw new Error(
      "[CORS] Fehlkonfiguration: origin '*' ist zusammen mit credentials: true nicht erlaubt. " +
        'Bitte eine explizite Origin-Allowlist angeben.',
    );
  }
  if (typeof allowed === 'string') return [allowed];
  if (Array.isArray(allowed)) {
    if (allowed.includes('*')) {
      throw new Error(
        "[CORS] Fehlkonfiguration: '*' in der Allowlist ist zusammen mit credentials: true nicht erlaubt.",
      );
    }
    return [...allowed];
  }
  throw new Error(
    '[CORS] Fehlkonfiguration: Bei credentials: true sind nur explizite Origin-Allowlists ' +
      '(String oder String-Array) erlaubt, keine RegExp oder Funktionen.',
  );
}

function logInit(opts: NormalizedCorsOptions): void {
  logger.info('[CORS] Middleware initialized', {
    origins:
      typeof opts.origin === 'string'
        ? opts.origin
        : Array.isArray(opts.origin)
          ? `[${opts.origin.length} origins]`
          : typeof opts.origin === 'function'
            ? 'dynamic-function'
            : 'regex',
    credentials: opts.credentials,
    methods: opts.methods,
  });
}

function finishPreflight(
  res: Response,
  opts: NormalizedCorsOptions,
  originHeader: string,
  start: number,
): void {
  res.setHeader('Access-Control-Allow-Methods', opts.methods.join(','));
  res.setHeader('Access-Control-Allow-Headers', opts.allowedHeaders.join(','));
  if (opts.exposedHeaders.length)
    res.setHeader('Access-Control-Expose-Headers', opts.exposedHeaders.join(','));
  res.setHeader('Access-Control-Max-Age', opts.maxAgeSeconds.toString());
  res.status(204).end();
  if (opts.verboseLog) {
    const dur = performance.now() - start;
    logger.debug('[CORS] Preflight OK', { origin: originHeader, ms: dur.toFixed(1) });
  }
}

function finishSimple(
  req: Request,
  res: Response,
  next: NextFunction,
  opts: NormalizedCorsOptions,
  originHeader: string,
  start: number,
): void {
  if (opts.exposedHeaders.length)
    res.setHeader('Access-Control-Expose-Headers', opts.exposedHeaders.join(','));

  if (opts.verboseLog) {
    const dur = performance.now() - start;
    logger.debug('[CORS] Allowed', {
      origin: originHeader,
      path: req.originalUrl,
      ms: dur.toFixed(1),
    });
  }
  next();
}

// ============================================================
// Middleware
// ============================================================

export function corsMiddleware(options?: CorsOptions) {
  const opts = normalize(options);
  const initOnce = new Once<void>();

  // ----------------------------------------------------------
  // Modus mit Credentials: nur explizite Allowlist. Der Header-Wert
  // stammt immer aus der Allowlist, nie aus dem Request.
  // ----------------------------------------------------------
  if (opts.credentials) {
    const allowList = credentialedAllowList(opts);
    // Normalisierter Origin -> Allowlist-Eintrag. Der gesetzte Header-Wert
    // kommt so nachweislich aus der Konfiguration, nie aus dem Request.
    const allowMap = new Map<string, string>();
    for (const entry of allowList) {
      const normalized = normalizeOrigin(entry);
      if (normalized && normalized !== 'null') allowMap.set(normalized, normalized);
    }

    return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
      const start = performance.now();
      const originHeader = req.headers.origin as string | undefined;

      if (!originHeader) return next();
      // Same-Origin-Anfragen (Browser senden Origin auch bei eigenen POSTs) sind kein CORS-Fall.
      if (normalizeOrigin(originHeader) === selfOrigin(req)) return next();

      await initOnce.run(async () => logInit(opts));

      const requested = normalizeOrigin(originHeader);
      const allowOrigin = requested ? allowMap.get(requested) : undefined;
      res.setHeader('Vary', 'Origin');
      if (!allowOrigin) {
        if (opts.verboseLog) logger.debug('[CORS] Blocked origin', { origin: originHeader });
        return res.status(403).send('CORS: Origin not allowed');
      }

      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      if (req.method === 'OPTIONS') return finishPreflight(res, opts, originHeader, start);
      return finishSimple(req, res, next, opts, originHeader, start);
    });
  }

  // ----------------------------------------------------------
  // Modus ohne Credentials
  // ----------------------------------------------------------
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    const originHeader = req.headers.origin as string | undefined;

    // Early exit for requests without Origin header
    if (!originHeader) return next();

    await initOnce.run(async () => logInit(opts));

    const allowOrigin = await resolvePublicAllowOrigin(req, originHeader, opts);
    if (allowOrigin !== '*') res.setHeader('Vary', 'Origin');
    if (!allowOrigin) {
      if (opts.verboseLog) logger.debug('[CORS] Blocked origin', { origin: originHeader });
      return res.status(403).send('CORS: Origin not allowed');
    }

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);

    if (req.method === 'OPTIONS') return finishPreflight(res, opts, originHeader, start);
    return finishSimple(req, res, next, opts, originHeader, start);
  });
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  corsMiddleware,
});
