/**
 * ------------------------------------------------------------
 * Sync Utility – Synchronization Primitives
 * ------------------------------------------------------------
 *
 * Features:
 * - Ultra-fast FIFO Mutex / Semaphore / RWLock / Barrier / Once
 * - O(1) hot paths, zero deps
 * - Safe under TS strict + exactOptionalPropertyTypes
 * - Fully typed & no compiler warnings (TS5.5+)
 */

import logger from '@/services/logger.service';

// ============================================================
// Deferred + Helpers
// ============================================================

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (err?: unknown) => void;
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: (v: T | PromiseLike<T>) => void;
  let reject!: (e?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export function microtask(): Promise<void> {
  return Promise.resolve();
}

// ============================================================
// FastQueue (Ring Buffer)
// ============================================================

class FastQueue<T> {
  private buf: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private mask: number;

  constructor(capacityPow2 = 8) {
    let size = 1;
    while (size < capacityPow2) size <<= 1;
    this.buf = new Array<T | undefined>(size);
    this.mask = size - 1;
  }

  get size(): number {
    return (this.tail - this.head) & this.mask;
  }

  enqueue(x: T): void {
    if (((this.tail + 1) & this.mask) === this.head) this.grow();
    this.buf[this.tail] = x;
    this.tail = (this.tail + 1) & this.mask;
  }

  dequeue(): T | undefined {
    if (this.head === this.tail) return undefined;
    const v = this.buf[this.head];
    this.buf[this.head] = undefined;
    this.head = (this.head + 1) & this.mask;
    return v;
  }

  private grow(): void {
    const old = this.buf;
    const newLen = old.length << 1;
    const next = new Array<T | undefined>(newLen);
    let i = 0;
    for (let v = this.dequeue(); v !== undefined; v = this.dequeue()) {
      next[i++] = v;
    }
    this.buf = next;
    this.head = 0;
    this.tail = i;
    this.mask = newLen - 1;
  }
}

// ============================================================
// Mutex
// ============================================================

type Releaser = () => void;
type WaiterFn = (release: Releaser) => void;

export class Mutex {
  private locked = false;
  private waiters = new FastQueue<WaiterFn>();

  acquire(): Promise<Releaser> {
    if (!this.locked) {
      this.locked = true;
      let released = false;
      const release: Releaser = () => {
        if (released) return;
        released = true;
        const next = this.waiters.dequeue();
        if (next) {
          try {
            next(release);
          } catch (err) {
            logger.error('[Mutex] waiter error', { error: String(err) });
            release();
          }
        } else {
          this.locked = false;
        }
      };
      return Promise.resolve(release);
    }

    const d = createDeferred<Releaser>();
    this.waiters.enqueue((release) => d.resolve(release));
    return d.promise;
  }

  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  tryAcquire(): Releaser | null {
    if (this.locked) return null;
    this.locked = true;
    let released = false;
    const release: Releaser = () => {
      if (released) return;
      released = true;
      const next = this.waiters.dequeue();
      if (next) {
        try {
          next(release);
        } catch (err) {
          logger.error('[Mutex] waiter error', { error: String(err) });
          release();
        }
      } else {
        this.locked = false;
      }
    };
    return release;
  }
}

// ============================================================
// Semaphore
// ============================================================

export class Semaphore {
  private permits: number;
  private waiters = new FastQueue<WaiterFn>();

  constructor(permits: number) {
    if (!(Number.isFinite(permits) && permits >= 1))
      throw new RangeError('Semaphore requires permits >= 1');
    this.permits = Math.floor(permits);
  }

  acquire(): Promise<Releaser> {
    if (this.permits > 0) {
      this.permits--;
      let released = false;
      const release: Releaser = () => {
        if (released) return;
        released = true;
        const next = this.waiters.dequeue();
        if (next) {
          try {
            next(release);
          } catch (err) {
            logger.error('[Semaphore] waiter error', { error: String(err) });
            release();
          }
        } else {
          this.permits++;
        }
      };
      return Promise.resolve(release);
    }

    const d = createDeferred<Releaser>();
    this.waiters.enqueue((release) => d.resolve(release));
    return d.promise;
  }

  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  tryAcquire(): Releaser | null {
    if (this.permits <= 0) return null;
    this.permits--;
    let released = false;
    const release: Releaser = () => {
      if (released) return;
      released = true;
      const next = this.waiters.dequeue();
      if (next) {
        try {
          next(release);
        } catch (err) {
          logger.error('[Semaphore] waiter error', { error: String(err) });
          release();
        }
      } else {
        this.permits++;
      }
    };
    return release;
  }

  drain(): number {
    const free = this.permits;
    this.permits = 0;
    return free;
  }

  currentPermits(): number {
    return this.permits;
  }
}

// ============================================================
// Read/Write Lock
// ============================================================

export class ReadWriteLock {
  private activeReaders = 0;
  private writerActive = false;
  private readerQueue = new FastQueue<() => void>();
  private writerQueue = new FastQueue<WaiterFn>();

  async acquireRead(): Promise<Releaser> {
    if (!this.writerActive && this.writerQueue.size === 0) {
      this.activeReaders++;
      return () => this.releaseRead();
    }
    const d = createDeferred<void>();
    this.readerQueue.enqueue(() => d.resolve());
    await d.promise;
    this.activeReaders++;
    return () => this.releaseRead();
  }

  private releaseRead(): void {
    this.activeReaders--;
    if (this.activeReaders === 0) this.flushQueues();
  }

  async acquireWrite(): Promise<Releaser> {
    if (!this.writerActive && this.activeReaders === 0) {
      this.writerActive = true;
      return () => this.releaseWrite();
    }
    const d = createDeferred<Releaser>();
    this.writerQueue.enqueue((release) => d.resolve(release));
    return d.promise;
  }

  private releaseWrite(): void {
    this.writerActive = false;
    this.flushQueues();
  }

  private flushQueues(): void {
    const w = this.writerQueue.dequeue();
    if (w && !this.writerActive && this.activeReaders === 0) {
      this.writerActive = true;
      const release: Releaser = () => {
        this.writerActive = false;
        this.flushQueues();
      };
      try {
        w(release);
      } catch (err) {
        logger.error('[RWLock] writer waiter error', { error: String(err) });
        release();
      }
      return;
    }

    if (!this.writerActive) {
      for (let r = this.readerQueue.dequeue(); r !== undefined; r = this.readerQueue.dequeue()) {
        try {
          r();
        } catch (err) {
          logger.error('[RWLock] reader waiter error', { error: String(err) });
        }
        this.activeReaders++;
      }
    }
  }

  async read<T>(fn: () => Promise<T> | T): Promise<T> {
    const release = await this.acquireRead();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  async write<T>(fn: () => Promise<T> | T): Promise<T> {
    const release = await this.acquireWrite();
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

// ============================================================
// Barrier / Latch
// ============================================================

export class Barrier {
  private count: number;
  private waiters = new FastQueue<() => void>();

  constructor(parties: number) {
    if (!(Number.isFinite(parties) && parties >= 1))
      throw new RangeError('Barrier requires parties >= 1');
    this.count = Math.floor(parties);
  }

  async arrive(): Promise<void> {
    this.count--;
    if (this.count <= 0) {
      for (let w = this.waiters.dequeue(); w !== undefined; w = this.waiters.dequeue()) {
        try {
          w();
        } catch (err) {
          logger.error('[Barrier] waiter error', { error: String(err) });
        }
      }
      return;
    }
    const d = createDeferred<void>();
    this.waiters.enqueue(() => d.resolve());
    return d.promise;
  }
}

export class CountDownLatch {
  private count: number;
  private waiters = new FastQueue<() => void>();

  constructor(count: number) {
    if (!(Number.isFinite(count) && count >= 0))
      throw new RangeError('CountDownLatch requires count >= 0');
    this.count = Math.floor(count);
  }

  countDown(n = 1): void {
    if (!(Number.isFinite(n) && n >= 1)) return;
    this.count -= Math.floor(n);
    if (this.count <= 0) {
      for (let w = this.waiters.dequeue(); w !== undefined; w = this.waiters.dequeue()) {
        try {
          w();
        } catch (err) {
          logger.error('[CountDownLatch] waiter error', { error: String(err) });
        }
      }
    }
  }

  async awaitZero(): Promise<void> {
    if (this.count <= 0) return;
    const d = createDeferred<void>();
    this.waiters.enqueue(() => d.resolve());
    return d.promise;
  }
}

// ============================================================
// Once (idempotent initializer)
// ============================================================

export class Once<T> {
  private state: 'idle' | 'pending' | 'fulfilled' | 'rejected' = 'idle';
  private value: T | undefined;
  private error: unknown;
  private pending: Promise<T> | undefined;

  run(init: () => Promise<T> | T): Promise<T> {
    if (this.state === 'fulfilled' && this.value !== undefined) return Promise.resolve(this.value);
    if (this.state === 'rejected') return Promise.reject(this.error);
    if (this.state === 'pending' && this.pending) return this.pending;

    try {
      const out = init();
      if (out instanceof Promise) {
        this.state = 'pending';
        this.pending = out.then(
          (v) => {
            this.state = 'fulfilled';
            this.value = v;
            this.pending = undefined;
            return v;
          },
          (e) => {
            this.state = 'rejected';
            this.error = e;
            this.pending = undefined;
            throw e;
          },
        );
        return this.pending;
      } else {
        this.state = 'fulfilled';
        this.value = out;
        return Promise.resolve(out);
      }
    } catch (err) {
      this.state = 'rejected';
      this.error = err;
      return Promise.reject(err);
    }
  }

  reset(): void {
    this.state = 'idle';
    this.value = undefined;
    this.error = undefined;
    this.pending = undefined;
  }
}

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  createDeferred,
  microtask,
  Mutex,
  Semaphore,
  ReadWriteLock,
  Barrier,
  CountDownLatch,
  Once,
});
