/**
 * ------------------------------------------------------------
 * Base URL Utility – Environment Configuration
 * ------------------------------------------------------------
 *
 * Responsibilities:
 * - Dynamically resolves base URL depending on environment
 * - Uses localhost + port in development
 * - Uses system IP + same port in production (for internal reverse proxies)
 * - Strict validation of environment variables
 * - High-performance caching with zero redundant computation
 *
 * Technologies:
 * - TypeScript (strict mode)
 * - dotenv (auto-loaded only in non-production)
 * - Winston logger for structured observability
 */

import logger from '@/services/logger.service';
import dotenv from 'dotenv';
import os from 'os';

// ============================================================
// Environment Initialization
// ============================================================

// Load dotenv only for non-production to avoid leaking secrets in prod builds
if (process.env['NODE_ENV'] !== 'production') {
  dotenv.config();
  logger.debug('[ENV] dotenv configuration loaded for non-production environment');
}

// ============================================================
// Type Definitions
// ============================================================

interface BaseUrlOptions {
  /** Force HTTPS, overriding CLIENT_HTTPS */
  forceHttps?: boolean;
  /** Manually override host (domain/IP) */
  overrideHost?: string;
  /** Manually override port */
  overridePort?: number | string;
  /** Disable port inclusion in final URL */
  noPort?: boolean;
}

// ============================================================
// Internal Utility Functions
// ============================================================

/**
 * Validates that a required environment variable is defined and non-empty.
 * Throws a descriptive error if validation fails.
 */
function validateEnvVar(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    const msg = `[CONFIG] Missing required environment variable: ${key}`;
    logger.error(msg);
    throw new Error(msg);
  }
  return value.trim();
}

/**
 * Efficiently retrieves the first non-internal IPv4 address of the system.
 * Uses native OS network interfaces for accuracy across platforms.
 */
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const ifaceGroup of Object.values(interfaces)) {
    if (!ifaceGroup) continue;
    for (const iface of ifaceGroup) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// ============================================================
// Core Logic
// ============================================================

/**
 * Constructs a fully qualified base URL.
 *
 * Example behavior:
 * - Development → http://localhost:5173
 * - Production → https://192.168.1.101:5173
 *
 * Always uses the same port across environments for parity.
 */
export function getBaseUrl(options: BaseUrlOptions = {}): string {
  const { forceHttps = false, overrideHost, overridePort, noPort = false } = options;

  // Resolve environment and configuration context
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';
  const isProduction = nodeEnv === 'production';

  // ------------------------------------------------------------
  // Protocol Resolution
  // ------------------------------------------------------------
  const useHttps = forceHttps || process.env['CLIENT_HTTPS'] === 'true';
  const protocol = useHttps ? 'https' : 'http';

  // ------------------------------------------------------------
  // Host Resolution
  // ------------------------------------------------------------
  let host: string;
  if (overrideHost) {
    host = overrideHost;
  } else if (isProduction) {
    // Prefer configured host, else system IP for proxy setups
    const envHost = process.env['CLIENT_BASE_URL'];
    host = envHost && envHost.trim() !== '' ? envHost : getLocalIp();
  } else {
    // Default to localhost during development
    host = process.env['CLIENT_BASE_URL'] ?? 'localhost';
  }

  // ------------------------------------------------------------
  // Port Resolution (same port across all environments)
  // ------------------------------------------------------------
  const rawPort = overridePort ?? process.env['CLIENT_PORT'];
  const normalizedPort = typeof rawPort === 'number' ? String(rawPort) : rawPort;
  const port = validateEnvVar('CLIENT_PORT', normalizedPort);

  // ------------------------------------------------------------
  // Construct Final URL
  // ------------------------------------------------------------
  // Use template concatenation for performance (string ops > URL object here)
  let baseUrl = `${protocol}://${host}`;
  if (!noPort && port) baseUrl += `:${port}`;

  // ------------------------------------------------------------
  // Structured Logging for Observability
  // ------------------------------------------------------------
  logger.info('[BASE_URL] Base URL computed successfully', {
    environment: nodeEnv,
    protocol,
    host,
    port,
    baseUrl,
    https: useHttps,
  });

  return baseUrl;
}

// ============================================================
// High-Performance Singleton Cache
// ============================================================

/**
 * Cached singleton instance for production-grade performance.
 * Ensures zero recomputation across repeated imports or service calls.
 */
let cachedBaseUrl: string | null = null;

export function getCachedBaseUrl(): string {
  if (cachedBaseUrl !== null) return cachedBaseUrl;

  // Lazy initialization
  try {
    cachedBaseUrl = getBaseUrl();
    logger.debug('[BASE_URL] Cached base URL initialized', { baseUrl: cachedBaseUrl });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[BASE_URL] Failed to initialize cached base URL', { error: err.message });
    throw err;
  }

  return cachedBaseUrl;
}

/** Backwards compatible alias for consumers expecting buildBaseUrl. */
export function buildBaseUrl(options?: BaseUrlOptions): string {
  return getBaseUrl(options);
}

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  getBaseUrl,
  getCachedBaseUrl,
  buildBaseUrl,
});
