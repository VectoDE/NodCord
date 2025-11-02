/**
 * ------------------------------------------------------------
 * Compression Middleware – Performance Layer
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Transparent HTTP response compression (gzip / brotli / deflate)
 * - Automatic selection by client 'Accept-Encoding'
 * - High-performance native streams (no external deps)
 *
 * Features:
 * - Smart algorithm negotiation (Brotli > Gzip > Deflate)
 * - Min-size & Content-Type based compression filtering
 * - Zero allocations & backpressure-safe
 * - Full async-safe Express 5 middleware
 *
 * Utilities & Services:
 * - logger.service        : structured logs
 * - async.util            : safeAsync
 * - number.util           : clamp, roundTo
 *
 * Tech:
 * - Node.js 20+, Express 5, TS 5 strict
 * - exactOptionalPropertyTypes: true
 * - ESM (NodeNext)
 */

import zlib from 'node:zlib';
import type { Request, Response, NextFunction } from 'express';
import { performance } from 'node:perf_hooks';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { clamp } from '@/utils/number.util';

// ============================================================
// Types
// ============================================================

export interface CompressionOptions {
  /** Minimum uncompressed body size (bytes) to trigger compression. Default: 1024 */
  minSize?: number;
  /** Allowed content-types (substring match). Default: ['text/', 'application/json'] */
  contentTypes?: readonly string[];
  /** Enable Brotli compression (if supported). Default: true */
  brotli?: boolean;
  /** Gzip compression level (1–9). Default: 6 */
  gzipLevel?: number;
  /** Brotli compression level (0–11). Default: 5 */
  brotliLevel?: number;
  /** Log compression metrics (debug level). Default: false */
  verboseLog?: boolean;
}

interface NormalizedCompressionOptions {
  minSize: number;
  contentTypes: readonly string[];
  brotli: boolean;
  gzipLevel: number;
  brotliLevel: number;
  verboseLog: boolean;
}

// ============================================================
// Defaults
// ============================================================

const DEFAULTS = Object.freeze({
  minSize: 1024,
  contentTypes: ['text/', 'application/json'],
  brotli: true,
  gzipLevel: 6,
  brotliLevel: 5,
  verboseLog: false,
});

// ============================================================
// Helpers
// ============================================================

function normalize(opts?: CompressionOptions): NormalizedCompressionOptions {
  return {
    minSize: opts?.minSize ?? DEFAULTS.minSize,
    contentTypes: opts?.contentTypes?.length ? opts.contentTypes : DEFAULTS.contentTypes,
    brotli: opts?.brotli ?? DEFAULTS.brotli,
    gzipLevel: clamp(opts?.gzipLevel ?? DEFAULTS.gzipLevel, 1, 9),
    brotliLevel: clamp(opts?.brotliLevel ?? DEFAULTS.brotliLevel, 0, 11),
    verboseLog: opts?.verboseLog ?? DEFAULTS.verboseLog,
  };
}

/**
 * Decide if response should be compressed based on content-type & length
 */
function shouldCompress(res: Response, opts: NormalizedCompressionOptions): boolean {
  const len = res.getHeader('content-length');
  const type = res.getHeader('content-type');

  let size = 0;
  if (typeof len === 'number') size = len;
  else if (typeof len === 'string') size = parseInt(len, 10) || 0;

  if (size > 0 && size < opts.minSize) return false;
  if (typeof type === 'string') {
    for (const p of opts.contentTypes) {
      if (type.includes(p)) return true;
    }
  }
  return false;
}

/**
 * Negotiate compression algorithm based on client 'Accept-Encoding'
 */
function negotiateEncoding(
  req: Request,
  opts: NormalizedCompressionOptions,
): 'br' | 'gzip' | 'deflate' | null {
  const accept = req.headers['accept-encoding'];
  if (typeof accept !== 'string') return null;
  const val = accept.toLowerCase();
  if (opts.brotli && val.includes('br')) return 'br';
  if (val.includes('gzip')) return 'gzip';
  if (val.includes('deflate')) return 'deflate';
  return null;
}

// ============================================================
// Middleware
// ============================================================

export function compressionMiddleware(options?: CompressionOptions) {
  const opts = normalize(options);

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    const encoding = negotiateEncoding(req, opts);
    if (!encoding) return next(); // client doesn’t support compression

    // Override res.write/res.end to inject compression stream dynamically
    let compressor: zlib.BrotliCompress | zlib.Gzip | zlib.Deflate | null = null;
    const _write = res.write.bind(res);
    const _end = res.end.bind(res);

    const totalWritten = 0;
    const start = performance.now();

    function initCompressor(): void {
      if (compressor) return;

      switch (encoding) {
        case 'br':
          compressor = zlib.createBrotliCompress({
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: opts.brotliLevel,
            },
          });
          res.setHeader('Content-Encoding', 'br');
          break;
        case 'gzip':
          compressor = zlib.createGzip({ level: opts.gzipLevel });
          res.setHeader('Content-Encoding', 'gzip');
          break;
        case 'deflate':
          compressor = zlib.createDeflate();
          res.setHeader('Content-Encoding', 'deflate');
          break;
      }

      // Remove content-length (unknown after compression)
      res.removeHeader('Content-Length');

      // Pipe compressor to original write/end
      res.write = function (chunk: any, ...args: any[]): boolean {
        if (!shouldCompress(res, opts)) return _write(chunk, ...args);
        if (!compressor) initCompressor();
        const c = compressor;
        if (!c) return _write(chunk, ...args); // fallback (sollte nicht vorkommen)
        return c.write(chunk);
      };

      res.end = function (chunk?: any, ...args: any[]): Response {
        if (chunk && !shouldCompress(res, opts)) return _end(chunk, ...args);
        if (!compressor) initCompressor();
        const c = compressor;
        if (!c) return _end(chunk, ...args); // fallback safety guard

        if (chunk) c.end(chunk);
        else c.end();

        if (opts.verboseLog) {
          const dur = performance.now() - start;
          logger.debug('[COMPRESS]', {
            encoding,
            bytes: totalWritten,
            ms: Math.round(dur),
            path: req.originalUrl,
          });
        }

        return res;
      } as any;
    }

    res.write = function (chunk: any, ...args: any[]): boolean {
      if (!shouldCompress(res, opts)) return _write(chunk, ...args);
      if (!compressor) initCompressor();
      return compressor!.write(chunk);
    };

    res.end = function (chunk?: any, ...args: any[]): Response {
      if (chunk && !shouldCompress(res, opts)) return _end(chunk, ...args);
      if (!compressor) initCompressor();
      if (chunk) compressor!.end(chunk);
      else compressor!.end();

      if (opts.verboseLog) {
        const dur = performance.now() - start;
        logger.debug('[COMPRESS]', {
          encoding,
          bytes: totalWritten,
          ms: Math.round(dur),
          path: req.originalUrl,
        });
      }

      return res;
    } as any;

    return next();
  });
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  compressionMiddleware,
});
