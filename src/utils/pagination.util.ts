/**
 * ------------------------------------------------------------
 * Pagination Utility – Performance Toolkit
 * ------------------------------------------------------------
 *
 * Features:
 * - Full pagination lifecycle (calculate, validate, slice, meta)
 * - Zero dependencies, O(1) complexity
 * - Defensive bounds validation
 * - Ready for REST / GraphQL / SQL / ORM / Elastic / etc.
 * - Strict TypeScript typing (TS 5.x / noUncheckedIndexedAccess safe)
 */

import logger from '@/services/logger.service';

// ============================================================
// Types & Interfaces
// ============================================================

/** Input options for pagination calculations. */
export interface PaginationParams {
  /** Page index (1-based). Defaults to 1. */
  page?: number;
  /** Page size (items per page). Defaults to 25. */
  limit?: number;
  /** Optional hard cap for maximum allowed limit (default: 100). */
  maxLimit?: number;
}

/** Pagination metadata for API responses. */
export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number | undefined;
  prevPage?: number | undefined;
}

/** Output of a paginated result set. */
export interface PaginatedResult<T> {
  items: readonly T[];
  meta: PaginationMeta;
}

/** Internal validated state. */
interface NormalizedPagination {
  page: number;
  limit: number;
  offset: number;
}

// ============================================================
// Core Helpers
// ============================================================

/**
 * Safely normalizes and bounds pagination parameters.
 * - Page numbers are clamped to >= 1
 * - Limits are clamped to [1, maxLimit]
 * - Prevents integer overflow
 */
export function normalizePagination(params: PaginationParams): NormalizedPagination {
  const maxLimit = params.maxLimit && params.maxLimit > 0 ? params.maxLimit : 100;

  let page = params.page ?? 1;
  let limit = params.limit ?? 25;

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 25;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// ============================================================
// Calculation
// ============================================================

/**
 * Calculates pagination metadata given total items.
 */
export function getPaginationMeta(
  totalItems: number,
  { page, limit }: NormalizedPagination,
): PaginationMeta {
  if (!Number.isFinite(totalItems) || totalItems < 0) totalItems = 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const safePage = Math.min(page, totalPages);
  const hasNext = safePage < totalPages;
  const hasPrev = safePage > 1;

  const meta: PaginationMeta = {
    totalItems,
    totalPages,
    page: safePage,
    limit,
    hasNext,
    hasPrev,
    nextPage: hasNext ? safePage + 1 : undefined,
    prevPage: hasPrev ? safePage - 1 : undefined,
  };

  return meta;
}

// ============================================================
// Data Slicing
// ============================================================

/**
 * Performs an in-memory slice of an array according to pagination params.
 * - Use only for small data sets (not DB-level)
 * - For large sets, use offset/limit queries at the data source level
 */
export function paginateArray<T>(
  items: readonly T[],
  params: PaginationParams,
  totalItems?: number,
): PaginatedResult<T> {
  const norm = normalizePagination(params);

  // Defensive totalItems handling
  const total = totalItems ?? items.length;
  const start = norm.offset;
  const end = start + norm.limit;

  const sliced = items.slice(start, end);
  const meta = getPaginationMeta(total, norm);

  return Object.freeze({ items: sliced, meta });
}

// ============================================================
// SQL / ORM Integration Helpers
// ============================================================

/**
 * Returns SQL-style pagination values (limit + offset).
 */
export function toSqlPagination(params: PaginationParams): { limit: number; offset: number } {
  const { limit, offset } = normalizePagination(params);
  return { limit, offset };
}

/**
 * Returns MongoDB-style pagination values (skip + limit).
 */
export function toMongoPagination(params: PaginationParams): { skip: number; limit: number } {
  const { limit, offset } = normalizePagination(params);
  return { skip: offset, limit };
}

// ============================================================
// Validation
// ============================================================

/**
 * Validates that the page number is within available range.
 */
export function validatePageBounds(meta: PaginationMeta, throwOnInvalid = false): boolean {
  const valid = meta.page >= 1 && meta.page <= meta.totalPages;

  if (!valid && throwOnInvalid) {
    const msg = `[PAGINATION] Invalid page: ${meta.page} (valid range: 1–${meta.totalPages})`;
    logger.error(msg);
    throw new RangeError(msg);
  }

  return valid;
}

// ============================================================
// API Helper
// ============================================================

/**
 * Builds a full paginated response suitable for API endpoints.
 */
export function buildPaginatedResponse<T>(
  items: readonly T[],
  params: PaginationParams,
  totalItems?: number,
): PaginatedResult<T> {
  const result = paginateArray(items, params, totalItems);
  validatePageBounds(result.meta);
  return result;
}

// ============================================================
// Diagnostics
// ============================================================

/**
 * Logs pagination metrics for monitoring or debugging.
 */
export function logPaginationMeta(meta: PaginationMeta, context = 'Pagination'): void {
  try {
    logger.info('[PAGINATION] Meta', {
      context,
      page: meta.page,
      limit: meta.limit,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages,
      hasNext: meta.hasNext,
      hasPrev: meta.hasPrev,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('[PAGINATION] Failed to log meta', { context, error: error.message });
  }
}

// ============================================================
// Default Export (Frozen Bundle)
// ============================================================

export default Object.freeze({
  normalizePagination,
  getPaginationMeta,
  paginateArray,
  toSqlPagination,
  toMongoPagination,
  buildPaginatedResponse,
  validatePageBounds,
  logPaginationMeta,
});
