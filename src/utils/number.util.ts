/**
 * ------------------------------------------------------------
 * Number Utility – High-Performance, Enterprise-Grade Toolkit
 * ------------------------------------------------------------
 *
 * Goals:
 * - Maximum performance (tight loops, zero unnecessary allocations)
 * - Strict typing (TS strict, exactOptionalPropertyTypes, noUncheckedIndexedAccess compatible)
 * - Safe operations (NaN / Infinity handling, safe divide)
 * - Internationalization support (Intl.NumberFormat / Currency)
 * - Zero external dependencies
 */

import logger from '@/services/logger.service';

// ============================================================
// Constants & Types
// ============================================================

/** Default tolerance for floating-point comparisons. */
export const DEFAULT_EPSILON = 1e-10;

/** Configuration for number and currency formatting. */
export interface NumberFormatOptions {
  locale?: string;
  options?: Intl.NumberFormatOptions;
}

// ============================================================
// Validation & Conversion
// ============================================================

/** Strictly checks if a value is a finite number (no NaN, no Infinity). */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Converts any value to a number safely (trims strings, returns fallback on failure). */
export function toNumber(value: unknown, fallback = NaN): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/** Divides safely, avoiding division by zero or invalid operands. */
export function safeDivide(a: number, b: number, fallback = 0): number {
  if (!isFiniteNumber(a) || !isFiniteNumber(b) || b === 0) return fallback;
  const result = a / b;
  return Number.isFinite(result) ? result : fallback;
}

/** Compares two floating-point numbers with relative and absolute epsilon tolerance. */
export function nearlyEqual(a: number, b: number, epsilon = DEFAULT_EPSILON): boolean {
  if (a === b) return true;
  const diff = Math.abs(a - b);
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return diff <= epsilon * scale;
}

// ============================================================
// Clamping, Range & Rounding
// ============================================================

/** Returns a value clamped to the [min, max] interval. */
export function clamp(n: number, min: number, max: number): number {
  if (min > max) [min, max] = [max, min];
  return n < min ? min : n > max ? max : n;
}

/** Clamps a percentage to the inclusive range [0, 100]. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 100) return 100;
  return value;
}

/** Checks whether n is within the [min, max] range (inclusive). */
export function inRange(n: number, min: number, max: number): boolean {
  if (min > max) [min, max] = [max, min];
  return n >= min && n <= max;
}

/** Rounds to a given number of decimal places (handles FP artifacts safely). */
export function roundTo(n: number, decimals = 0): number {
  if (!isFiniteNumber(n)) return NaN;
  if (decimals <= 0) return Math.round(n);
  const p = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * p) / p;
}

/** Floors to a given number of decimal places. */
export function floorTo(n: number, decimals = 0): number {
  if (!isFiniteNumber(n)) return NaN;
  if (decimals <= 0) return Math.floor(n);
  const p = 10 ** decimals;
  return Math.floor(n * p) / p;
}

/** Ceils to a given number of decimal places. */
export function ceilTo(n: number, decimals = 0): number {
  if (!isFiniteNumber(n)) return NaN;
  if (decimals <= 0) return Math.ceil(n);
  const p = 10 ** decimals;
  return Math.ceil(n * p) / p;
}

// ============================================================
// Interpolation, Mapping & Percentages
// ============================================================

/** Performs linear interpolation between a and b (t in [0, 1]). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Maps x from [inMin, inMax] to [outMin, outMax] (optionally clamped). */
export function mapRange(
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clampResult = false,
): number {
  if (inMin === inMax) return outMin;
  const t = (x - inMin) / (inMax - inMin);
  const y = outMin + (outMax - outMin) * t;
  return clampResult ? (outMin < outMax ? clamp(y, outMin, outMax) : clamp(y, outMax, outMin)) : y;
}

/** Computes the percentage (0–100) of a part relative to a whole, using a fallback when whole is invalid. */
export function percent(part: number, whole: number, fallback = 0): number {
  return safeDivide(part * 100, whole, fallback);
}

// ============================================================
// Random Numbers
// ============================================================

/** Generates a random integer in [min, max] inclusive. */
export function randomInt(min: number, max: number, rng: () => number = Math.random): number {
  if (min > max) [min, max] = [max, min];
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Generates a random float in [min, max). */
export function randomFloat(min: number, max: number, rng: () => number = Math.random): number {
  if (min > max) [min, max] = [max, min];
  return rng() * (max - min) + min;
}

// ============================================================
// Statistics
// ============================================================

/** Sum of array elements using a tight loop. */
export function sum(array: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < array.length; i++) {
    const v = array[i];
    if (v !== undefined) s += v;
  }
  return s;
}

/** Arithmetic mean. */
export function mean(array: readonly number[]): number {
  const len = array.length;
  if (len === 0) return NaN;
  return sum(array) / len;
}

/** Median (numeric sort, strict-mode safe). */
export function median(array: readonly number[]): number {
  if (array.length === 0) return NaN;

  // Filter out undefined or non-numeric values
  const a = Array.from(array).filter(
    (x): x is number => typeof x === 'number' && Number.isFinite(x),
  );

  if (a.length === 0) return NaN;

  a.sort((x, y) => x - y);

  const mid = a.length >> 1;

  // Safe: we have checked that a.length > 0
  if (a.length % 2 !== 0) {
    return a[mid]!; // non-null assertion is safe
  }

  const left = a[mid - 1]!;
  const right = a[mid]!;

  return (left + right) / 2;
}

/** Variance using Welford’s algorithm. */
export function variance(array: readonly number[], sample = false): number {
  let mean = 0;
  let m2 = 0;
  let n = 0;

  for (let i = 0; i < array.length; i++) {
    const x = array[i];
    if (x === undefined) continue;
    n++;
    const delta = x - mean;
    mean += delta / n;
    m2 += delta * (x - mean);
  }

  if (n < (sample ? 2 : 1)) return NaN;
  return m2 / (sample ? n - 1 : n);
}

/** Standard deviation. */
export function stddev(array: readonly number[], sample = false): number {
  const v = variance(array, sample);
  return Number.isFinite(v) ? Math.sqrt(v) : NaN;
}

/** Computes both min and max in a single pass. */
export function minMax(array: readonly number[]): { min: number; max: number } {
  const len = array.length;
  if (len === 0) return { min: NaN, max: NaN };

  const first = array[0];
  if (first === undefined) return { min: NaN, max: NaN };

  let minVal = first;
  let maxVal = first;

  for (let i = 1; i < len; i++) {
    const v = array[i];
    if (v === undefined) continue;
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }

  return { min: minVal, max: maxVal };
}

/** Quantile p ∈ [0, 1] (linearly interpolated, strict-mode safe). */
export function quantile(array: readonly number[], p: number): number {
  if (p < 0 || p > 1) return NaN;

  // Filter out invalid entries
  const filtered = array.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));

  if (filtered.length === 0) return NaN;
  if (filtered.length === 1) return filtered[0]!;

  const a = filtered.slice().sort((x, y) => x - y);
  const idx = (a.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);

  // Safe after length checks
  if (lo === hi) return a[lo]!;

  const t = idx - lo;
  const loVal = a[lo]!;
  const hiVal = a[hi]!;

  return loVal + (hiVal - loVal) * t;
}

// ============================================================
// Arithmetic
// ============================================================

/** Euclidean algorithm for greatest common divisor. */
export function gcd(a: number, b: number): number {
  a = Math.trunc(Math.abs(a));
  b = Math.trunc(Math.abs(b));
  if (a === 0) return b;
  if (b === 0) return a;
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/** Least common multiple. */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

/** Simple deterministic primality test up to sqrt(n). */
export function isPrime(n: number): boolean {
  n = Math.trunc(n);
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/** Factorial as BigInt (overflow-safe). */
export function factorialBigInt(n: number): bigint {
  n = Math.trunc(n);
  if (n < 0) throw new RangeError('factorialBigInt requires n >= 0');
  let res = 1n;
  for (let i = 2n; i <= BigInt(n); i++) res *= i;
  return res;
}

// ============================================================
// Formatting & Humanization
// ============================================================

/** Formats a number using Intl.NumberFormat. */
export function formatNumber(value: number, cfg: NumberFormatOptions = {}): string {
  const { locale, options } = cfg;
  return new Intl.NumberFormat(locale, options).format(value);
}

/** Formats a currency amount using Intl.NumberFormat. */
export function formatCurrency(
  amount: number,
  currency: string,
  cfg: NumberFormatOptions = {},
): string {
  const { locale, options } = cfg;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...(options ?? {}),
  }).format(amount);
}

/** Convenience helper with sensible defaults for currency formatting. */
export function toCurrency(
  amount: number,
  currency = 'USD',
  cfg: NumberFormatOptions = {},
): string {
  return formatCurrency(amount, currency, cfg);
}

/** Adds thousand separators based on locale. */
export function formatWithSeparators(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Converts bytes to human-readable units (SI or IEC). */
export function humanizeBytes(bytes: number, decimals = 1, binary = false): string {
  if (!Number.isFinite(bytes)) return 'NaN';
  const base = binary ? 1024 : 1000;
  if (Math.abs(bytes) < base) return `${bytes} B`;
  const units = binary ? ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'] : ['KB', 'MB', 'GB', 'TB', 'PB'];
  let i = -1;
  let v = bytes;
  do {
    v /= base;
    i++;
  } while (Math.abs(v) >= base && i < units.length - 1);
  return `${roundTo(v, decimals)} ${units[i]}`;
}

/** Converts bytes into gigabytes (GB) with optional precision. */
export function bytesToGB(bytes: number, decimals = 2): number {
  if (!Number.isFinite(bytes)) return 0;
  const gb = bytes / 1_073_741_824;
  return Number(gb.toFixed(decimals));
}

/** Converts large numbers into compact representations (e.g. 1.2K, 3.4M). */
export function humanizeNumber(n: number, decimals = 1): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const D = decimals;

  if (abs < 1_000) return `${n}`;
  if (abs < 1_000_000) return `${sign}${roundTo(abs / 1_000, D)}K`;
  if (abs < 1_000_000_000) return `${sign}${roundTo(abs / 1_000_000, D)}M`;
  if (abs < 1_000_000_000_000) return `${sign}${roundTo(abs / 1_000_000_000, D)}B`;
  return `${sign}${roundTo(abs / 1_000_000_000_000, D)}T`;
}

// ============================================================
// Diagnostics
// ============================================================

/** Logs compact metrics for a list of numeric values. */
export function logNumberStats(values: readonly number[], name = 'Numbers'): void {
  try {
    const count = values.length;
    const { min, max } = minMax(values);
    const m = mean(values);
    const sd = stddev(values);
    logger.info('[NUMBER] Stats', { name, count, min, max, mean: m, stddev: sd });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error('[NUMBER] Stats failed', { name, error: err.message });
  }
}

// ============================================================
// Default Export (Frozen Bundle)
// ============================================================

export default Object.freeze({
  isFiniteNumber,
  toNumber,
  safeDivide,
  nearlyEqual,
  clamp,
  clampPercent,
  inRange,
  roundTo,
  floorTo,
  ceilTo,
  lerp,
  mapRange,
  percent,
  randomInt,
  randomFloat,
  sum,
  mean,
  median,
  variance,
  stddev,
  minMax,
  quantile,
  gcd,
  lcm,
  isPrime,
  factorialBigInt,
  formatNumber,
  formatCurrency,
  toCurrency,
  formatWithSeparators,
  humanizeBytes,
  bytesToGB,
  humanizeNumber,
  logNumberStats,
  DEFAULT_EPSILON,
});
