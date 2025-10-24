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
    logFormat
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
    winston.format.json()
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
    winston.format.json()
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
    winston.format.errors({ stack: true })
  ),
  transports: [consoleTransport, errorFileTransport, combinedFileTransport],
  exitOnError: false,
});

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
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error };
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
export default logger;
