/**
 * ------------------------------------------------------------
 * QR Code Utility – High-Performance Toolkit
 * ------------------------------------------------------------
 *
 * Features:
 * - PNG / SVG / Data URL / Terminal rendering
 * - Input normalization & validation
 * - Configurable error correction (L, M, Q, H)
 * - Timeout safety & caching (LRU)
 * - File system writing helpers
 * - Safe SVG logo overlay
 * - Winston logger integration
 *
 * Tech Stack:
 * - TypeScript 5.x (strict, exactOptionalPropertyTypes safe)
 * - qrcode@^1.5
 * - Node.js 20+
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';
import logger from '@/services/logger.service';
import type { QRCodeToBufferOptions, QRCodeToStringOptions, QRCodeToDataURLOptions } from 'qrcode';

// ============================================================
// Types
// ============================================================

export type QRErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QRCommonOptions {
  errorCorrectionLevel?: QRErrorCorrection | undefined;
  margin?: number | undefined;
  scale?: number | undefined;
  width?: number | undefined;
  colorDark?: string | undefined;
  colorLight?: string | undefined;
  timeoutMs?: number | undefined;
}

export interface QRPNGOptions extends QRCommonOptions {
  rendererOpts?: { quality?: number | undefined } | undefined;
}

export interface QRWriteFileOptions extends QRPNGOptions {
  ensureDir?: boolean | undefined;
}

export interface QRStringOptions extends QRCommonOptions {}

export type QRDataUrlOptions = QRPNGOptions;

// ============================================================
// Constants
// ============================================================

const DEFAULTS = Object.freeze({
  errorCorrectionLevel: 'M' as QRErrorCorrection,
  margin: 4,
  scale: 4,
  timeoutMs: 5000,
  colorDark: '#000000',
  colorLight: '#ffffff',
});

const CACHE_MAX = 128;
const svgCache = new Map<string, string>();
const dataUrlCache = new Map<string, string>();
const pngCache = new Map<string, Buffer>();

// ============================================================
// Utility Helpers
// ============================================================

function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    const msg = '[QR] Input must be a string';
    logger.error(msg, { type: typeof input });
    throw new TypeError(msg);
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    const msg = '[QR] Input must be a non-empty string';
    logger.error(msg);
    throw new TypeError(msg);
  }

  if (trimmed.length > 8192) {
    const msg = '[QR] Input exceeds 8KB limit';
    logger.error(msg, { length: trimmed.length });
    throw new RangeError(msg);
  }

  return trimmed;
}

function normalizeOptions<T extends QRCommonOptions>(
  opts?: T,
): Required<QRCommonOptions> & Omit<T, keyof QRCommonOptions> {
  const o = opts ?? ({} as T);
  return {
    ...o,
    errorCorrectionLevel: o.errorCorrectionLevel ?? DEFAULTS.errorCorrectionLevel,
    margin: Number.isFinite(o.margin) ? (o.margin as number) : DEFAULTS.margin,
    scale: Number.isFinite(o.scale) ? (o.scale as number) : DEFAULTS.scale,
    width: Number.isFinite(o.width) ? (o.width as number) : undefined,
    timeoutMs:
      Number.isFinite(o.timeoutMs) && o.timeoutMs !== undefined
        ? (o.timeoutMs as number)
        : DEFAULTS.timeoutMs,
    colorDark: o.colorDark ?? DEFAULTS.colorDark,
    colorLight: o.colorLight ?? DEFAULTS.colorLight,
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  if (!(timeoutMs > 0)) return promise;
  let timer: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`[QR] Operation timed out (${timeoutMs}ms): ${label}`);
      (err as any).code = 'ETIMEDOUT';
      reject(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// ==================== Options Builders ======================

function buildBufferOptions(opts: Required<QRCommonOptions> & QRPNGOptions): QRCodeToBufferOptions {
  return {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    scale: opts.width ? undefined : opts.scale,
    width: opts.width,
    color: {
      dark: opts.colorDark,
      light: opts.colorLight,
    },
    rendererOpts: opts.rendererOpts
      ? {
          deflateLevel: Math.max(0, Math.min(9, Math.round(opts.rendererOpts.quality ?? 6))),
          deflateStrategy: 0,
        }
      : undefined,
    type: 'png',
  };
}

function buildStringOptions(
  opts: Required<QRCommonOptions> & QRStringOptions,
  type: 'svg' | 'terminal',
): QRCodeToStringOptions {
  return {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    scale: opts.width ? undefined : opts.scale,
    width: opts.width,
    color: {
      dark: opts.colorDark,
      light: opts.colorLight,
    },
    type,
  };
}

function buildDataURLOptions(
  opts: Required<QRCommonOptions> & QRDataUrlOptions,
): QRCodeToDataURLOptions {
  return {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    scale: opts.width ? undefined : opts.scale,
    width: opts.width,
    color: {
      dark: opts.colorDark,
      light: opts.colorLight,
    },
    type: 'image/png',
  };
}

function stableKey(text: string, opts?: Record<string, unknown>): string {
  const hash = crypto.createHash('sha1');
  hash.update(text);
  if (opts) hash.update(JSON.stringify(opts));
  return hash.digest('hex');
}

function cacheSet<K, V>(map: Map<K, V>, key: K, val: V): void {
  if (map.size >= CACHE_MAX) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, val);
}

// ============================================================
// Public API
// ============================================================

export async function generateQRCodePNG(text: unknown, options?: QRPNGOptions): Promise<Buffer> {
  const payload = sanitizeText(text);
  const opts = normalizeOptions(options);
  const key = stableKey(payload, opts);

  const cached = pngCache.get(key);
  if (cached) return cached;

  try {
    const buffer = await withTimeout(
      QRCode.toBuffer(payload, buildBufferOptions(opts)),
      opts.timeoutMs ?? DEFAULTS.timeoutMs,
      'PNG',
    );
    cacheSet(pngCache, key, buffer);
    return buffer;
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[QR] Failed to generate PNG', { error: e.message });
    throw e;
  }
}

export async function generateQRCodeSVG(text: unknown, options?: QRStringOptions): Promise<string> {
  const payload = sanitizeText(text);
  const opts = normalizeOptions(options);
  const key = stableKey(payload, { ...(opts as Record<string, unknown>), format: 'svg' });

  const cached = svgCache.get(key);
  if (cached) return cached;

  try {
    const svg = await withTimeout(
      QRCode.toString(payload, buildStringOptions(opts, 'svg')),
      opts.timeoutMs ?? DEFAULTS.timeoutMs,
      'SVG',
    );
    cacheSet(svgCache, key, svg);
    return svg;
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[QR] Failed to generate SVG', { error: e.message });
    throw e;
  }
}

export async function generateQRCodeDataURL(
  text: unknown,
  options?: QRDataUrlOptions,
): Promise<string> {
  const payload = sanitizeText(text);
  const opts = normalizeOptions(options);
  const key = stableKey(payload, { ...(opts as Record<string, unknown>), format: 'dataurl' });

  const cached = dataUrlCache.get(key);
  if (cached) return cached;

  try {
    const dataUrl = await withTimeout(
      QRCode.toDataURL(payload, buildDataURLOptions(opts)),
      opts.timeoutMs ?? DEFAULTS.timeoutMs,
      'DataURL',
    );
    cacheSet(dataUrlCache, key, dataUrl);
    return dataUrl;
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[QR] Failed to generate DataURL', { error: e.message });
    throw e;
  }
}

export async function generateQRCodeTerminal(
  text: unknown,
  options?: QRStringOptions,
): Promise<string> {
  const payload = sanitizeText(text);
  const opts = normalizeOptions(options);

  try {
    return await withTimeout(
      QRCode.toString(payload, buildStringOptions(opts, 'terminal')),
      opts.timeoutMs ?? DEFAULTS.timeoutMs,
      'Terminal',
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[QR] Failed to render terminal QR', { error: e.message });
    throw e;
  }
}

export async function writeQRCodePNGFile(
  filePath: string,
  text: unknown,
  options?: QRWriteFileOptions,
): Promise<{ path: string; bytes: number }> {
  const payload = sanitizeText(text);
  const opts = normalizeOptions(options);
  const ensureDir = options?.ensureDir ?? true;

  const buf = await generateQRCodePNG(payload, opts);
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

  if (ensureDir) await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, buf);

  logger.info('[QR] Wrote PNG file', { path: abs, bytes: buf.byteLength });
  return { path: abs, bytes: buf.byteLength };
}

/**
 * Overlays a centered logo into an SVG QR.
 */
export function overlayLogoInSVG(svg: string, logoHref: string, sizeRatio = 0.2): string {
  try {
    if (!svg.startsWith('<svg')) return svg;

    const viewBoxMatch = svg.match(/viewBox="([\d.\s-]+)"/);
    if (!viewBoxMatch?.[1]) return svg;

    const parts = viewBoxMatch[1].trim().split(/\s+/);
    const w = Number(parts[2] ?? 0);
    const h = Number(parts[3] ?? 0);
    const boxSize = Math.min(w, h);

    if (!Number.isFinite(boxSize) || boxSize <= 0) return svg;

    const logoSize = Math.max(4, Math.floor(boxSize * sizeRatio));
    const x = (boxSize - logoSize) / 2;
    const y = (boxSize - logoSize) / 2;

    const imageTag = `<image href="${logoHref}" x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`;
    return svg.replace('</svg>', `${imageTag}</svg>`);
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.warn('[QR] overlayLogoInSVG failed', { error: e.message });
    return svg;
  }
}

export function logQRDebugSummary(
  kind: 'png' | 'svg' | 'dataurl' | 'terminal',
  textSample: string,
  opts?: QRCommonOptions,
): void {
  try {
    const sample = textSample.length > 64 ? textSample.slice(0, 64) + '…' : textSample;
    logger.info(`[QR] Generated ${kind}`, {
      sample,
      opts: { ...opts, timeoutMs: opts?.timeoutMs },
    });
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[QR] logQRDebugSummary failed', { error: e.message });
  }
}

// ============================================================
// Default Export (Immutable)
// ============================================================

export default Object.freeze({
  generateQRCodePNG,
  generateQRCodeSVG,
  generateQRCodeDataURL,
  generateQRCodeTerminal,
  writeQRCodePNGFile,
  overlayLogoInSVG,
  logQRDebugSummary,
});
