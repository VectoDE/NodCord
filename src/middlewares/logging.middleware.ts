/**
 * ------------------------------------------------------------
 * Logging Middleware – Observability Layer
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Central structured request logging for diagnostics & analytics
 * - Capture latency, status, route, method, and correlation id
 * - Auto-detect user / API key / beta access context
 * - Production-safe, allocation-light, non-blocking
 *
 * Features:
 * - Structured log start + finish events
 * - Intelligent log levels (info / warn / error)
 * - Latency and size metrics (ms, bytes)
 * - Correlation ID propagation via headers
 * - Unified async-safe execution
 *
 * Utilities:
 * - logger.service        : structured logging backend
 * - async.util            : safeAsync
 * - number.util           : roundTo
 * - sync.util             : Mutex (for shared state if extended)
 *
 * Tech:
 * - Node.js 20+, Express 5+, TS 5+ strict
 * - exactOptionalPropertyTypes: true
 * - ESM (NodeNext)
 */

import type { Request, Response, NextFunction } from 'express';
import { performance } from 'node:perf_hooks';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { roundTo } from '@/utils/number.util';

// ============================================================
// Internal helpers
// ============================================================

/**
 * Generate ultra-fast correlation ID (avoids UUID libs)
 * 16 chars base36 → ~2^80 entropy (good enough for request tracing)
 */
function fastId(): string {
  return (
    Date.now().toString(36) +
    Math.floor(Math.random() * 36 ** 8)
      .toString(36)
      .padStart(8, '0')
  );
}

/** Extract or assign correlation ID */
function getOrCreateCorrelationId(req: Request): string {
  const header =
    req.headers['x-correlation-id'] || req.headers['x-request-id'] || req.headers['x-trace-id'];
  if (typeof header === 'string' && header.trim().length > 0) {
    return header.trim();
  }
  const id = fastId();
  req.headers['x-correlation-id'] = id;
  return id;
}

/** Determine logging level by status */
function levelByStatus(status: number): 'debug' | 'info' | 'warn' | 'error' {
  if (status < 300) return 'info';
  if (status < 400) return 'debug';
  if (status < 500) return 'warn';
  return 'error';
}

/** Safely extract basic client/user info */
function extractClientMeta(req: Request): Record<string, unknown> {
  const user = (req as any).user ?? (req as any).auth?.payload ?? null;
  const apiKey = (req as any).apiKeyAuth?.keyId;
  const beta = (req as any).beta;
  const u = user && typeof user === 'object' ? (user as Record<string, unknown>) : {};

  return {
    uid: u['sub'] ?? u['id'] ?? undefined,
    role: (u['role'] as string | undefined) ?? undefined,
    scopes: (u['scopes'] as string[] | undefined)?.slice(0, 5),
    apiKey,
    beta: beta?.enabled ? beta.via : undefined,
  };
}

/** Estimate response size if known (fallbacks to headers) */
function getResponseSize(res: Response): number | undefined {
  const len = res.getHeader('content-length');
  if (typeof len === 'string') {
    return parseInt(len, 10) || undefined;
  }
  if (Array.isArray(len)) {
    const first = len[0];
    if (typeof first === 'string') return parseInt(first, 10) || undefined;
  }
  return undefined;
}

// ============================================================
// Middleware
// ============================================================

export function loggingMiddleware() {
  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    const correlationId = getOrCreateCorrelationId(req);
    const method = req.method;
    const path = req.originalUrl || req.url;
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      undefined;

    // minimal structured entry log
    logger.debug('[REQ]', {
      id: correlationId,
      method,
      path,
      ip: clientIp,
      ua: req.headers['user-agent'],
    });

    let finished = false;

    const onFinish = () => {
      if (finished) return;
      finished = true;

      const duration = roundTo(performance.now() - start, 2);
      const status = res.statusCode;
      const size = getResponseSize(res);
      const lvl = levelByStatus(status);
      const meta = extractClientMeta(req);

      const entry = {
        id: correlationId,
        method,
        path,
        status,
        ms: duration,
        bytes: size,
        ip: clientIp,
        ...meta,
      };

      switch (lvl) {
        case 'error':
          logger.error('[RES]', entry);
          break;
        case 'warn':
          logger.warn('[RES]', entry);
          break;
        case 'info':
          logger.info('[RES]', entry);
          break;
        default:
          logger.debug('[RES]', entry);
      }
    };

    res.once('finish', onFinish);
    res.once('close', onFinish);
    res.once('error', onFinish);

    return next();
  });
}

// ============================================================
// Advanced variant: log errors in centralized catch
// ============================================================

export function errorLoggingMiddleware() {
  return safeAsync(async (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const correlationId = getOrCreateCorrelationId(req);
    const method = req.method;
    const path = req.originalUrl || req.url;
    const clientIp = req.socket.remoteAddress;
    const e = err instanceof Error ? err : new Error(String(err));

    logger.error('[ERR]', {
      id: correlationId,
      method,
      path,
      ip: clientIp,
      message: e.message,
      stack: e.stack?.split('\n').slice(0, 3).join(' | '),
    });

    // Ensure a response if none sent
    if (!res.headersSent) {
      res.status(500);
      return res.json({ error: 'Internal Server Error', traceId: correlationId });
    }

    return next(err);
  });
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  loggingMiddleware,
  errorLoggingMiddleware,
});
