/**
 * ------------------------------------------------------------
 * Security Header Middleware – Protection Layer
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Add industry-standard HTTP security headers with zero dependencies
 * - Enforce browser hardening, XSS protection, and framing isolation
 * - Integrate with internal logger + async-safe init
 *
 * Features:
 * - High-performance static header injection
 * - Customizable CSP and Permissions Policy
 * - Zero reallocation (headers precomputed)
 * - Async-safe (Once-initialized)
 * - HSTS + Referrer-Policy + COOP/CORP/Cross-Origin headers
 *
 * Utilities & Services:
 * - logger.service  : structured logs
 * - async.util      : safeAsync
 * - sync.util       : Once
 *
 * Tech:
 * - Node.js 20+, Express 5, TypeScript 5 strict
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

export interface SecurityHeaderOptions {
  /** Enable Content Security Policy (CSP). Default: true */
  csp?: boolean | undefined;

  /** CSP directives (only if CSP enabled). */
  cspDirectives?: Record<string, string> | undefined;

  /** Enable HTTP Strict-Transport-Security (HSTS). Default: true */
  hsts?: boolean | undefined;

  /** Max age for HSTS (in seconds). Default: 31536000 (1 year) */
  hstsMaxAge?: number | undefined;

  /** Include subdomains in HSTS. Default: true */
  hstsIncludeSubDomains?: boolean | undefined;

  /** Enable cross-origin isolation headers (COOP, CORP, COEP). Default: true */
  crossOriginIsolation?: boolean | undefined;

  /** Enable Referrer Policy. Default: 'strict-origin-when-cross-origin' */
  referrerPolicy?: string | undefined;

  /** Enable X-Frame-Options header. Default: 'DENY' */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | undefined;

  /** Enable Permissions Policy (Feature Policy successor). Default: true */
  permissionsPolicy?: boolean | undefined;

  /** Permissions Policy directives. */
  permissionsDirectives?: Record<string, string> | undefined;

  /** Log initialization (info-level). Default: true */
  logInit?: boolean | undefined;

  /** Log per-request debug info. Default: false */
  verboseLog?: boolean | undefined;
}

interface NormalizedSecurityOptions {
  csp: boolean;
  cspDirectives: Record<string, string>;
  hsts: boolean;
  hstsMaxAge: number;
  hstsIncludeSubDomains: boolean;
  crossOriginIsolation: boolean;
  referrerPolicy: string;
  frameOptions: 'DENY' | 'SAMEORIGIN';
  permissionsPolicy: boolean;
  permissionsDirectives: Record<string, string>;
  logInit: boolean;
  verboseLog: boolean;
}

// ============================================================
// Defaults
// ============================================================

const DEFAULTS: NormalizedSecurityOptions = {
  csp: true,
  cspDirectives: {
    'default-src': "'self'",
    'script-src': "'self'",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data:",
    'connect-src': "'self'",
    'font-src': "'self'",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'",
  },
  hsts: true,
  hstsMaxAge: 31536000, // 1 year
  hstsIncludeSubDomains: true,
  crossOriginIsolation: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  frameOptions: 'DENY',
  permissionsPolicy: true,
  permissionsDirectives: {
    geolocation: '()',
    camera: '()',
    microphone: '()',
    fullscreen: '*',
    payment: '()',
  },
  logInit: true,
  verboseLog: false,
};

// ============================================================
// Helpers
// ============================================================

function normalize(opts?: SecurityHeaderOptions): NormalizedSecurityOptions {
  return {
    csp: opts?.csp ?? DEFAULTS.csp,
    cspDirectives: opts?.cspDirectives ?? DEFAULTS.cspDirectives,
    hsts: opts?.hsts ?? DEFAULTS.hsts,
    hstsMaxAge: opts?.hstsMaxAge ?? DEFAULTS.hstsMaxAge,
    hstsIncludeSubDomains: opts?.hstsIncludeSubDomains ?? DEFAULTS.hstsIncludeSubDomains,
    crossOriginIsolation: opts?.crossOriginIsolation ?? DEFAULTS.crossOriginIsolation,
    referrerPolicy: opts?.referrerPolicy ?? DEFAULTS.referrerPolicy,
    frameOptions: opts?.frameOptions ?? DEFAULTS.frameOptions,
    permissionsPolicy: opts?.permissionsPolicy ?? DEFAULTS.permissionsPolicy,
    permissionsDirectives: opts?.permissionsDirectives ?? DEFAULTS.permissionsDirectives,
    logInit: opts?.logInit ?? DEFAULTS.logInit,
    verboseLog: opts?.verboseLog ?? DEFAULTS.verboseLog,
  };
}

function buildHeaderValue(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k} ${v}`)
    .join('; ');
}

// ============================================================
// Middleware
// ============================================================

export function securityHeaderMiddleware(options?: SecurityHeaderOptions) {
  const opts = normalize(options);
  const onceInit = new Once<void>();

  const cspHeader = opts.csp ? buildHeaderValue(opts.cspDirectives) : undefined;
  const permissionsHeader = opts.permissionsPolicy
    ? buildHeaderValue(opts.permissionsDirectives)
    : undefined;
  const hstsValue = opts.hsts
    ? `max-age=${opts.hstsMaxAge}${opts.hstsIncludeSubDomains ? '; includeSubDomains' : ''}`
    : undefined;

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    await onceInit.run(async () => {
      if (opts.logInit) {
        logger.info('[SECURITY] Initialized Security Header Middleware', {
          csp: opts.csp,
          hsts: opts.hsts,
          crossOrigin: opts.crossOriginIsolation,
          frameOptions: opts.frameOptions,
          referrerPolicy: opts.referrerPolicy,
          permissionsPolicy: opts.permissionsPolicy,
        });
      }
    });

    const t0 = performance.now();

    // CSP
    if (opts.csp && cspHeader) res.setHeader('Content-Security-Policy', cspHeader);

    // HSTS
    if (opts.hsts && req.secure && hstsValue) res.setHeader('Strict-Transport-Security', hstsValue);

    // Referrer Policy
    res.setHeader('Referrer-Policy', opts.referrerPolicy);

    // Frame control
    res.setHeader('X-Frame-Options', opts.frameOptions);

    // Cross-Origin Isolation (COOP + COEP + CORP)
    if (opts.crossOriginIsolation) {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    }

    // Permissions Policy
    if (opts.permissionsPolicy && permissionsHeader)
      res.setHeader('Permissions-Policy', permissionsHeader);

    if (opts.verboseLog) {
      const dur = Math.round(performance.now() - t0);
      logger.debug('[SECURITY] Headers set', {
        ms: dur,
        path: req.originalUrl,
        secure: req.secure,
      });
    }

    return next();
  });
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  securityHeaderMiddleware,
});
