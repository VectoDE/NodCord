/**
 * ------------------------------------------------------------
 * Response Utility – API Response Toolkit
 * ------------------------------------------------------------
 *
 * Features:
 * - Standardized API response formatting
 * - High-performance JSON serialization
 * - Success / Error / Paginated / Validation responses
 * - Strict TypeScript typing (TS 5.x, exactOptionalPropertyTypes)
 * - Immutable structures (Object.freeze)
 * - Optional metadata and debug tracing
 * - Zero dependencies, O(1) runtime cost
 *
 * Ideal for:
 * - RESTful APIs (Express, Fastify, NestJS, etc.)
 * - GraphQL or gRPC wrapper responses
 * - Consistent backend <-> frontend API contracts
 */

import logger from '@/services/logger.service';

// ============================================================
// Types
// ============================================================

export type StatusType = 'success' | 'error' | 'fail' | 'warning';

export interface ApiResponseMeta {
  /** Unique request or correlation ID for tracing. */
  requestId?: string;
  /** Optional debug or diagnostic info. */
  debug?: Record<string, unknown>;
  /** Optional pagination or context metadata. */
  meta?: Record<string, unknown>;
  /** Response timestamp (ISO 8601). */
  timestamp?: string;
}

export interface ApiResponse<T = unknown> {
  status: StatusType;
  code: number;
  message: string;
  data?: T;
  meta: ApiResponseMeta;
}

type ExpressLikeResponse = {
  status(code: number): ExpressLikeResponse;
  json(body: unknown): unknown;
};

// ============================================================
// Helpers
// ============================================================

/**
 * Generates a high-resolution timestamp (ISO string, pre-formatted)
 */
function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Safely serialize arbitrary data to JSON string (non-blocking, O(1))
 */
export function safeJson<T>(data: T): string {
  try {
    return JSON.stringify(data);
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[Response] JSON serialization failed', { error: e.message });
    return '{"error":"serialization_failed"}';
  }
}

/**
 * Builds a unified response body with strict typing.
 */
function buildResponse<T>(
  status: StatusType,
  code: number,
  message: string,
  data?: T,
  meta?: ApiResponseMeta,
): ApiResponse<T> {
  return Object.freeze({
    status,
    code,
    message,
    ...(data !== undefined ? { data } : {}),
    meta: {
      ...(meta ?? {}),
      timestamp: meta?.timestamp ?? nowIso(),
    },
  });
}

// ============================================================
// Core Response Builders
// ============================================================

/**
 * Standard success response.
 */
export function success<T>(
  data?: T,
  message = 'Success',
  code = 200,
  meta?: ApiResponseMeta,
): ApiResponse<T> {
  return buildResponse('success', code, message, data, meta);
}

/**
 * Standard fail response (e.g., validation error, user input issue).
 */
export function fail(
  message = 'Bad Request',
  code = 400,
  meta?: ApiResponseMeta,
): ApiResponse<null> {
  return buildResponse('fail', code, message, null, meta);
}

/**
 * Standard error response (for exceptions, server errors).
 */
export function error(
  message = 'Internal Server Error',
  code = 500,
  meta?: ApiResponseMeta,
): ApiResponse<null> {
  return buildResponse('error', code, message, null, meta);
}

/**
 * Warning response (e.g., deprecated endpoint or non-critical anomaly).
 */
export function warning<T>(
  message = 'Warning',
  data?: T,
  code = 299,
  meta?: ApiResponseMeta,
): ApiResponse<T> {
  return buildResponse('warning', code, message, data, meta);
}

/**
 * Build a paginated response format.
 */
export function paginated<T>(
  items: readonly T[],
  totalItems: number,
  page: number,
  limit: number,
  message = 'Paginated result',
  meta?: ApiResponseMeta,
): ApiResponse<{ items: readonly T[]; pagination: Record<string, number> }> {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const pagination = { totalItems, totalPages, page, limit };

  return buildResponse('success', 200, message, { items, pagination }, meta);
}

// ============================================================
// Express / NestJS Integration Helpers
// ============================================================

/**
 * Sends a unified API response via an Express-like response object.
 * Automatically sets content-type and status.
 */
export function sendExpressResponse<T>(res: ExpressLikeResponse, response: ApiResponse<T>): void {
  try {
    res.status(response.code).json(response);
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[Response] Failed to send Express response', { error: e.message });
  }
}

/**
 * Builds a consistent HTTP error payload (e.g., for Axios, NestJS filters)
 */
export function toHttpError(
  error: unknown,
  code = 500,
  meta?: ApiResponseMeta,
): ApiResponse<{ error: string }> {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
  return buildResponse('error', code, message, { error: message }, meta);
}

// ============================================================
// Advanced Diagnostics
// ============================================================

/**
 * Attaches debug info safely (without mutating the original response).
 */
export function attachDebug<T>(
  response: ApiResponse<T>,
  debug: Record<string, unknown>,
): ApiResponse<T> {
  const meta = {
    ...(response.meta ?? {}),
    debug: { ...(response.meta?.debug ?? {}), ...debug },
  };
  return Object.freeze({ ...response, meta });
}

/**
 * Logs the structured response (non-blocking).
 */
export function logResponse<T>(response: ApiResponse<T>, context = 'Response'): void {
  try {
    logger.info(`[${context}] ${response.status.toUpperCase()} ${response.code}`, {
      message: response.message,
      hasData: !!response.data,
      meta: response.meta,
    });
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[Response] Failed to log response', { error: e.message });
  }
}

/**
 * Convenience helper to send a standard success JSON response.
 */
export function standardResponse<T>(
  res: ExpressLikeResponse,
  code: number,
  data: T,
  message = 'Success',
  meta?: ApiResponseMeta,
): void {
  const payload = success(data, message, code, meta);
  sendExpressResponse(res, payload);
}

// ============================================================
// Default Export (Immutable)
// ============================================================

export default Object.freeze({
  success,
  fail,
  error,
  warning,
  paginated,
  safeJson,
  sendExpressResponse,
  standardResponse,
  toHttpError,
  attachDebug,
  logResponse,
});
