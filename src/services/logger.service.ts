/**
 * ------------------------------------------------------------
 * Logger Service
 * ------------------------------------------------------------
 *
 * This service provides a centralized, structured, and highly
 * configurable logging system using Winston and Daily Rotate File.
 *
 * Features:
 * - Supports both console and file rotation logging
 * - Automatically switches levels between development and production
 * - Includes stack traces for errors
 * - Adds trace IDs for request correlation
 * - JSON log output for external log aggregation (e.g., ELK, Loki, Datadog)
 *
 * Environment variables:
 * - NODE_ENV: defines the runtime environment ('development' | 'production')
 * - SERVICE_NAME: optional identifier for microservices or bots
 *
 * Files:
 * - logs/error-YYYY-MM-DD.log → for errors
 * - logs/combined-YYYY-MM-DD.log → for all logs
 */

import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs/promises';

// ============================================================
// Environment Setup
// ============================================================

/**
 * Load environment variables safely with fallback values.
 * Accessing process.env directly with dot-notation causes TS4111 errors
 * due to index signatures, so we use bracket access instead.
 */
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';
const SERVICE_NAME = process.env['SERVICE_NAME'] ?? 'application';

/**
 * Determines if the application runs in production mode.
 * This toggles log verbosity and formatting.
 */
const isProduction = NODE_ENV === 'production';

/**
 * Directory for all log files (e.g., ./logs/combined-2025-10-24.log)
 */
const logDir = path.join(process.cwd(), 'logs');

// ============================================================
// Custom Log Format
// ============================================================

/**
 * Custom log output formatter for console and files.
 * Includes timestamp, log level, message, metadata, and stack traces.
 */
const logFormat = winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
  const base = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const stackTrace = stack ? `\n${stack}` : '';
  return `${base}${metaString}${stackTrace}`;
});

// ============================================================
// Transports (Where logs are written)
// ============================================================

/**
 * Console transport:
 * - Used for development debugging
 * - Colorized and formatted output
 */
const consoleTransport = new winston.transports.Console({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat,
  ),
});

/**
 * File transport for error-level logs only.
 * Rotates daily and compresses old files automatically.
 */
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '30d',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
});

/**
 * File transport for all log levels (info and above).
 * Used for centralized logging or integration with monitoring systems.
 */
const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '30d',
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
});

// ============================================================
// Winston Logger Instance
// ============================================================

/**
 * The main Winston logger instance.
 * All logs (info, warn, error, debug) pass through here.
 */
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  defaultMeta: { service: SERVICE_NAME },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
  ),
  transports: [consoleTransport, errorFileTransport, combinedFileTransport],
  exitOnError: false,
});

// ============================================================
// Log Retrieval Helpers
// ============================================================

export interface LogEntry {
  id: string;
  timestamp: string | null;
  level: string | null;
  message: string;
  meta?: Record<string, unknown>;
  file: string;
  raw?: string;
}

async function readLogFile(
  filePath: string,
  limit: number,
  accumulator: LogEntry[],
): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const fileName = path.basename(filePath);

    for (let index = lines.length - 1; index >= 0; index--) {
      const line = lines[index]!;
      const entryId = `${fileName}:${index}`;
      if (accumulator.length >= limit) return;
      try {
        const parsed = JSON.parse(line) as Record<string, unknown>;
        const entry: LogEntry = {
          id: entryId,
          timestamp:
            typeof parsed['timestamp'] === 'string' ? (parsed['timestamp'] as string) : null,
          level: typeof parsed['level'] === 'string' ? (parsed['level'] as string) : null,
          message: typeof parsed['message'] === 'string' ? (parsed['message'] as string) : line,
          file: fileName,
        };

        if (typeof parsed['meta'] === 'object' && parsed['meta'] !== null) {
          entry.meta = parsed['meta'] as Record<string, unknown>;
        }

        accumulator.push(entry);
      } catch (error) {
        accumulator.push({
          id: entryId,
          timestamp: null,
          level: null,
          message: line,
          raw: line,
          file: fileName,
        });
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[LOGGER] Failed to read log file', { file: filePath, error: err.message });
  }
}

export async function getRecentLogs(limit = 100): Promise<LogEntry[]> {
  if (limit <= 0) return [];

  try {
    const files = await fs.readdir(logDir);
    const logFiles = files
      .filter((file) => file.endsWith('.log'))
      .sort((a, b) => b.localeCompare(a)); // latest files first

    const entries: LogEntry[] = [];
    for (const file of logFiles) {
      await readLogFile(path.join(logDir, file), limit, entries);
      if (entries.length >= limit) break;
    }

    return entries.slice(0, limit);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[LOGGER] Failed to enumerate log files', { error: err.message });
    return [];
  }
}

export async function clearLogs(): Promise<void> {
  try {
    const files = await fs.readdir(logDir);
    const targets = files.filter((file) => file.endsWith('.log'));

    await Promise.all(
      targets.map(async (file) => {
        const filePath = path.join(logDir, file);
        try {
          await fs.rm(filePath, { force: true });
          logger.debug('[LOGGER] Removed log file', { file: filePath });
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.warn('[LOGGER] Failed to remove log file', { file: filePath, error: err.message });
        }
      }),
    );

    logger.info('[LOGGER] Cleared log directory', { count: targets.length });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[LOGGER] Failed to clear logs', { error: err.message });
    throw err;
  }
}

// ============================================================
// Request Context Logger (for API & Bot integration)
// ============================================================

/**
 * Creates a contextual logger for tracing individual requests or jobs.
 *
 * @example
 * ```ts
 * const requestLogger = createRequestLogger(req.id);
 * requestLogger.info("User logged in", { userId: 42 });
 * requestLogger.error("Failed to fetch data", new Error("Timeout"));
 * ```
 *
 * @param traceId Optional unique identifier for tracking (e.g., requestId, spanId)
 * @returns A structured logging interface bound to a trace ID
 */
export const createRequestLogger = (traceId?: string) => {
  return {
    /**
     * Log an informational message.
     */
    info: (message: string, meta?: Record<string, unknown>) =>
      logger.info(message, { ...meta, traceId }),

    /**
     * Log a warning message.
     */
    warn: (message: string, meta?: Record<string, unknown>) =>
      logger.warn(message, { ...meta, traceId }),

    /**
     * Log an error with optional stack trace or Error instance.
     */
    error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
      const err =
        error instanceof Error ? { message: error.message, stack: error.stack } : { error };
      logger.error(message, { ...meta, ...err, traceId });
    },

    /**
     * Log debug information (disabled in production).
     */
    debug: (message: string, meta?: Record<string, unknown>) =>
      logger.debug(message, { ...meta, traceId }),
  };
};

// ============================================================
// Export
// ============================================================

type ExtendedLogger = winston.Logger & {
  getRecentLogs: typeof getRecentLogs;
  clearLogs: typeof clearLogs;
};

const extendedLogger = logger as ExtendedLogger;
extendedLogger.getRecentLogs = getRecentLogs;
extendedLogger.clearLogs = clearLogs;

/**
 * Default logger export.
 *
 * Use this for general logging throughout the application.
 *
 * @example
 * ```ts
 * import logger from '@/services/logger.service';
 *
 * logger.info('Server started successfully');
 * logger.error('Database connection failed', { error });
 * ```
 */
export default extendedLogger;
