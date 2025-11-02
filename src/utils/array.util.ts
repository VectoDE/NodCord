/**
 * ------------------------------------------------------------
 * Array Utility – Collection Helpers
 * ------------------------------------------------------------
 *
 * Provides:
 * - High-performance, immutable array operations
 * - Type-safe generics with strict-mode compatibility
 * - Zero external dependencies
 * - Optional Winston logger integration for observability
 *
 * Performance Goals:
 * - O(n) complexity for all linear ops
 * - No unnecessary allocations
 * - Defensive input validation
 */

import logger from '@/services/logger.service';

// ============================================================
// Type Definitions
// ============================================================

type Primitive = string | number | boolean | null | undefined;

// ============================================================
// Core Array Utilities
// ============================================================

/**
 * Splits an array into chunks of the given size.
 */
export function chunk<T>(array: readonly T[], size: number): T[][] {
  if (!Array.isArray(array)) throw new TypeError('Input must be an array');
  if (size <= 0) throw new RangeError('Chunk size must be greater than 0');

  const result: T[][] = [];
  for (let i = 0, len = array.length; i < len; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Removes duplicate elements from an array using Set (O(n)).
 */
export function unique<T>(array: readonly T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Removes duplicates based on a key selector function.
 */
export function uniqueBy<T, K>(array: readonly T[], keySelector: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (let i = 0, len = array.length; i < len; i++) {
    const item = array[i]!;
    const key = keySelector(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/**
 * Flattens nested arrays up to the given depth.
 */
export function flatten<T>(array: readonly (T | T[])[], depth = 1): T[] {
  return array.flat(depth) as T[];
}

/**
 * Returns a random element from an array in O(1).
 */
export function sample<T>(array: readonly T[]): T | undefined {
  const len = array.length;
  if (len === 0) return undefined;
  return array[Math.floor(Math.random() * len)];
}

/**
 * Shuffles an array using the Fisher–Yates algorithm.
 * Immutable and optionally deterministic via RNG function.
 */
export function shuffle<T>(array: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * Groups array elements by a derived key.
 * Returns a Map<K, T[]> for fast access.
 */
export function groupBy<T, K>(array: readonly T[], keySelector: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (let i = 0, len = array.length; i < len; i++) {
    const item = array[i]!;
    const key = keySelector(item);
    const group = map.get(key);
    if (group) group.push(item);
    else map.set(key, [item]);
  }
  return map;
}

/**
 * Sorts an array by a derived key.
 * Stable and type-safe for primitive comparables.
 */
export function sortBy<T, K extends Primitive>(
  array: readonly T[],
  keySelector: (item: T) => K,
  descending = false,
): T[] {
  const result = [...array];
  result.sort((a, b) => {
    const ka = keySelector(a);
    const kb = keySelector(b);

    if (ka === kb) return 0;
    if (ka == null) return 1;
    if (kb == null) return -1;

    const comparable =
      (typeof ka === 'number' || typeof ka === 'string' || typeof ka === 'boolean') &&
      (typeof kb === 'number' || typeof kb === 'string' || typeof kb === 'boolean');

    if (!comparable) return 0;
    return descending ? (ka < kb ? 1 : -1) : ka > kb ? 1 : -1;
  });
  return result;
}

/**
 * Ensures the input is always an array.
 * Converts null/undefined to [].
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Checks whether the given array contains the provided value.
 * Supports optional case-insensitive comparison for strings.
 */
export function ensureArrayIncludes<T>(
  array: readonly T[],
  value: T,
  options: { caseInsensitive?: boolean } = {},
): boolean {
  if (!Array.isArray(array)) return false;

  if (options.caseInsensitive && typeof value === 'string') {
    const needle = value.toLowerCase();
    return array.some((item) => typeof item === 'string' && item.toLowerCase() === needle);
  }

  return array.includes(value);
}

/**
 * Returns the intersection of two arrays (O(n)).
 */
export function intersection<T>(a: readonly T[], b: readonly T[]): T[] {
  const setB = new Set(b);
  const result: T[] = [];
  for (let i = 0, len = a.length; i < len; i++) {
    const item = a[i]!;
    if (setB.has(item)) result.push(item);
  }
  return result;
}

/**
 * Returns the difference (elements in A not in B).
 */
export function difference<T>(a: readonly T[], b: readonly T[]): T[] {
  const setB = new Set(b);
  const result: T[] = [];
  for (let i = 0, len = a.length; i < len; i++) {
    const item = a[i]!;
    if (!setB.has(item)) result.push(item);
  }
  return result;
}

/**
 * Returns the element at the specified index.
 * Supports negative indices.
 */
export function at<T>(array: readonly T[], index: number): T | undefined {
  const len = array.length;
  if (len === 0) return undefined;
  const idx = index >= 0 ? index : len + index;
  return idx >= 0 && idx < len ? array[idx] : undefined;
}

// ============================================================
// Debug / Monitoring Helpers
// ============================================================

/**
 * Logs diagnostic stats for arrays.
 */
export function logArrayStats<T>(array: readonly T[], name = 'Array'): void {
  try {
    const count = array.length;
    const memoryKB = (JSON.stringify(array).length / 1024).toFixed(2);
    const sampleItem = array[0] ?? null;

    logger.info(`[ARRAY] Stats for ${name}`, {
      count,
      approxMemoryKB: memoryKB,
      sample: sampleItem,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[ARRAY] Failed to compute array stats', { error: err.message });
  }
}

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  chunk,
  unique,
  uniqueBy,
  flatten,
  sample,
  shuffle,
  groupBy,
  sortBy,
  ensureArray,
  intersection,
  difference,
  at,
  logArrayStats,
  ensureArrayIncludes,
});
