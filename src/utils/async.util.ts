/**
 * ------------------------------------------------------------
 * Async Utility – Promise & Concurrency Helpers
 * ------------------------------------------------------------
 *
 * Provides:
 * - Retry with exponential backoff (+ jitter)
 * - Timeout wrapper, delay, safe try/catch (tryAsync)
 * - Debounce / Throttle (async-safe)
 * - Parallel & Map with concurrency limit (order-preserving)
 * - FIFO AsyncQueue with backpressure (enqueue returns Promise)
 *
 * Design:
 * - Fault-tolerant, zero external deps
 * - Strict TypeScript safe, no implicit any
 * - Optimized loops and minimal closures for performance
 */

import logger from '@/services/logger.service';

// ============================================================
// Types
// ============================================================

export type AsyncFn<T> = () => Promise<T>;
type MaybePromise<T> = T | Promise<T>;

export interface RetryOptions {
  retries?: number; // default 3
  delayMs?: number; // initial delay, default 500
  backoffFactor?: number; // default 2
  maxDelayMs?: number; // optional hard cap
  jitterRatio?: number; // add random jitter fraction (0..1), default 0.1
  signal?: AbortSignal; // optional cancellation
  onRetry?(error: Error, attempt: number, nextDelayMs: number): MaybePromise<void>;
}

export interface SafeAsyncOptions {
  /** Friendly label for log output */
  label?: string;
  /** If false, errors are swallowed after logging / next forwarding. */
  rethrow?: boolean;
  /** Optional custom error hook */
  onError?: (error: Error) => MaybePromise<void>;
}

// ============================================================
// Primitives
// ============================================================

/** Sleep utility with optional AbortSignal */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms) as ReturnType<typeof setTimeout>;

    const onAbort = () => {
      cleanup();
      reject(new Error('Delay aborted'));
    };

    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(new Error('Delay aborted'));
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

/** Execute an async function safely and return typed result */
export async function tryAsync<T>(
  fn: AsyncFn<T>,
): Promise<{ ok: true; value: T } | { ok: false; error: Error }> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error('[ASYNC] tryAsync failed', { error: err.message });
    return { ok: false, error: err };
  }
}

/**
 * Wrap an async function and ensure errors are logged + forwarded to Express' next (if present).
 * Useful for route handlers or jobs where unhandled rejections must be avoided.
 */
export function safeAsync<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  options: SafeAsyncOptions = {},
): (...args: Parameters<F>) => Promise<ReturnType<F> | undefined> {
  const { label, rethrow = true, onError } = options;

  return async (...args: Parameters<F>): Promise<ReturnType<F> | undefined> => {
    try {
      return await fn(...args);
    } catch (rawErr) {
      const error = rawErr instanceof Error ? rawErr : new Error(String(rawErr));
      const context = label ?? fn.name ?? 'safeAsync';
      logger.error(`[ASYNC] ${context} failed`, { error: error.message });

      if (onError) {
        try {
          await onError(error);
        } catch (hookErr) {
          const hookError = hookErr instanceof Error ? hookErr : new Error(String(hookErr));
          logger.error('[ASYNC] onError hook failed', { error: hookError.message });
        }
      }

      const maybeNext = args.length > 0 ? args[args.length - 1] : undefined;
      if (typeof maybeNext === 'function') {
        try {
          (maybeNext as (err: unknown) => void)(error);
          return undefined;
        } catch (nextErr) {
          const nextError = nextErr instanceof Error ? nextErr : new Error(String(nextErr));
          logger.error('[ASYNC] Failed to forward error to next()', { error: nextError.message });
        }
      }

      if (rethrow) throw error;
      return undefined;
    }
  };
}

/** Add jitter to delay (improves herd behavior & thundering herd avoidance) */
function withJitter(base: number, ratio: number): number {
  if (ratio <= 0) return base;
  const delta = base * ratio;
  return Math.max(0, Math.floor(base - delta + Math.random() * (2 * delta)));
}

// ============================================================
// Timeout
// ============================================================

/** Enforce a timeout on a promise */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string,
): Promise<T> {
  if (ms <= 0) return promise;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message ?? `Operation timed out after ${ms}ms`));
    }, ms);
  });

  try {
    return (await Promise.race([promise, timeout])) as T;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// ============================================================
// Retry
// ============================================================

/** Retry with exponential backoff (+ optional jitter & abort) */
export async function retry<T>(fn: AsyncFn<T>, opts: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    delayMs = 500,
    backoffFactor = 2,
    maxDelayMs,
    jitterRatio = 0.1,
    signal,
    onRetry,
  } = opts;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    if (signal?.aborted) {
      throw new Error('Retry aborted');
    }

    try {
      const res = await fn();
      if (attempt > 0) {
        logger.info('[ASYNC] Retry succeeded', { attempt });
      }
      return res;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      lastError = err;

      if (attempt === retries) break;

      const rawDelay = delayMs * Math.pow(backoffFactor, attempt);
      const capped = maxDelayMs ? Math.min(rawDelay, maxDelayMs) : rawDelay;
      const nextDelay = withJitter(capped, jitterRatio);

      logger.warn('[ASYNC] Retry attempt failed', {
        attempt: attempt + 1,
        retries,
        nextDelay,
        error: err.message,
      });

      if (onRetry) {
        try {
          await onRetry(err, attempt + 1, nextDelay);
        } catch (hookErr) {
          const he = hookErr instanceof Error ? hookErr : new Error(String(hookErr));
          logger.error('[ASYNC] onRetry hook failed', { error: he.message });
        }
      }

      await delay(nextDelay, signal);
      attempt++;
    }
  }

  throw new Error(
    `[ASYNC] All ${retries + 1} attempts failed: ${lastError ? lastError.message : 'unknown error'}`,
  );
}

/**
 * Retry helper returning a typed result object instead of throwing.
 */
export async function retryAsync<T>(
  fn: AsyncFn<T>,
  retries = 3,
  delayMs = 500,
  options: Omit<RetryOptions, 'retries' | 'delayMs'> = {},
): Promise<{ ok: true; value: T } | { ok: false; error: Error }> {
  try {
    const value = await retry(fn, { retries, delayMs, ...options });
    return { ok: true, value };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { ok: false, error: err };
  }
}

// ============================================================
// Debounce / Throttle
// ============================================================

/**
 * Debounce wrapper for high-frequency events.
 * Executes only after no calls for `delayMs`. Supports async functions.
 */
export function debounce<F extends (...args: any[]) => MaybePromise<unknown>>(
  fn: F,
  delayMs: number,
): (...args: Parameters<F>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        Promise.resolve(fn(...args)).catch((e) => {
          const err = e instanceof Error ? e : new Error(String(e));
          logger.error('[ASYNC] Debounced function failed', { error: err.message });
        });
      } finally {
        timer = null;
      }
    }, delayMs);
  };
}

/**
 * Throttle wrapper – ensures fn runs at most once per interval.
 * Leading edge execution; drops intermediate calls.
 */
export function throttle<F extends (...args: any[]) => MaybePromise<unknown>>(
  fn: F,
  intervalMs: number,
): (...args: Parameters<F>) => void {
  let last = 0;

  return (...args: Parameters<F>) => {
    const now = Date.now();
    if (now - last >= intervalMs) {
      last = now;
      Promise.resolve(fn(...args)).catch((e) => {
        const err = e instanceof Error ? e : new Error(String(e));
        logger.error('[ASYNC] Throttled function failed', { error: err.message });
      });
    }
  };
}

// ============================================================
// Concurrency – parallelLimit / mapLimit
// ============================================================

/**
 * Run tasks with a concurrency limit, preserving order.
 */
export async function parallelLimit<T>(tasks: Array<() => Promise<T>>, limit = 5): Promise<T[]> {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Tasks must be an array of async functions.');
  }
  if (limit <= 0) {
    throw new RangeError('Concurrency limit must be greater than zero.');
  }

  const results: T[] = [];
  let active = 0;
  let index = 0;

  return new Promise<T[]>((resolve, reject) => {
    const next = (): void => {
      // Finish condition
      if (index >= tasks.length && active === 0) {
        resolve(results);
        return;
      }

      // Start tasks while under limit
      while (active < limit && index < tasks.length) {
        const currentIndex = index++;
        const task = tasks[currentIndex];
        if (typeof task !== 'function') {
          logger.warn('[ASYNC] Skipping invalid task', { index: currentIndex });
          continue;
        }

        active++;

        task()
          .then((res) => {
            results[currentIndex] = res;
          })
          .catch((err) => {
            logger.error('[ASYNC] parallelLimit task failed', {
              index: currentIndex,
              error: String(err),
            });
            reject(err);
          })
          .finally(() => {
            active--;
            next();
          });
      }
    };

    next();
  });
}

/**
 * Map with concurrency limit – processes inputs via async mapper, preserves order.
 */
export async function mapLimit<I, O>(
  inputs: readonly I[],
  mapper: (item: I, index: number) => Promise<O>,
  limit = 5,
): Promise<O[]> {
  if (!Array.isArray(inputs)) throw new TypeError('Inputs must be an array.');
  if (limit <= 0) throw new RangeError('Concurrency limit must be greater than zero.');

  const tasks: Array<() => Promise<O>> = [];
  for (let i = 0, len = inputs.length; i < len; i++) {
    const item = inputs[i]!;
    tasks.push(() => mapper(item, i));
  }
  return parallelLimit(tasks, limit);
}

// ============================================================
// AsyncQueue – FIFO with backpressure
// ============================================================

/**
 * FIFO async queue – enqueue returns a Promise that resolves with job result.
 * Backpressure-safe, processes exactly one job at a time.
 */
export class AsyncQueue<T = unknown> {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  constructor(private readonly name = 'AsyncQueue') {}

  /** Enqueue a job; returns a Promise that resolves with the job result */
  enqueue<R>(job: () => Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const wrapped = async () => {
        try {
          const res = await job();
          logger.info(`[ASYNC] Job completed in ${this.name}`);
          resolve(res);
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          logger.error(`[ASYNC] Job failed in ${this.name}`, { error: err.message });
          reject(err);
        }
      };

      this.queue.push(wrapped);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.processNext();
    });
  }

  size(): number {
    return this.queue.length + (this.processing ? 1 : 0);
  }

  private async processNext(): Promise<void> {
    if (this.processing) return;
    const nextJob = this.queue.shift();
    if (!nextJob) return;

    this.processing = true;
    try {
      await nextJob();
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.processNext();
      }
    }
  }
}

// ============================================================
// Default export bundle
// ============================================================

export default Object.freeze({
  delay,
  tryAsync,
  safeAsync,
  withTimeout,
  retry,
  retryAsync,
  debounce,
  throttle,
  parallelLimit,
  mapLimit,
  AsyncQueue,
});
