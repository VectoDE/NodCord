/**
 * ------------------------------------------------------------
 * Socket.IO Service – High-Performance Realtime
 * ------------------------------------------------------------
 *
 * Features:
 * - Secure JWT handshake auth (Authorization: Bearer <token> or query token)
 * - Namespaces & rooms with safe join/leave helpers
 * - Ultra-fast per-socket token-bucket rate limiting (GC-light)
 * - Connection/session registry with Mutex (O(1) hot paths)
 * - Heartbeat/latency tracking & diagnostics
 * - Unified logging and strict TypeScript (TS 5+, exactOptionalPropertyTypes-safe)
 * - Idempotent initialization (Once) and safe async utilities
 *
 * Utilities & Services used:
 * - logger.service         : structured logs
 * - jwt.util               : verifyAccessToken, extractBearer, AccessTokenPayload
 * - async.util             : safeAsync
 * - number.util            : clamp, roundTo
 * - sync.util              : Mutex, Once, microtask
 */

import { Server as IOServer, type ServerOptions, type Socket } from 'socket.io';
import type { IncomingMessage } from 'http';
import type { Server as HTTPServer } from 'http';

import logger from '@/services/logger.service';
import { verifyAccessToken, extractBearer, type AccessTokenPayload } from '@/utils/jwt.util';
import { safeAsync } from '@/utils/async.util';
import { clamp, roundTo } from '@/utils/number.util';
import { Mutex, Once, microtask } from '@/utils/sync.util';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface SocketUser {
  id: string; // maps to JWT 'sub'
  role?: string | undefined;
  roles?: readonly string[] | undefined;
  scopes?: readonly string[] | undefined;
  [k: string]: unknown;
}

export interface SocketAuthContext {
  token: string;
  payload: AccessTokenPayload;
  user: SocketUser;
}

export interface SocketServiceOptions {
  /** Socket.IO server options (CORS, transports, etc.). */
  io?: ServerOptions | undefined;

  /** Per-socket rate limit (token bucket). Defaults: 20 tokens/s, burst 60. */
  rate?:
    | {
        tokensPerSecond?: number | undefined;
        burst?: number | undefined;
      }
    | undefined;

  /** Allowed origins pattern for CORS allow-listing (logged only). */
  allowedOriginsNote?: string | undefined;

  /** Namespace path. Default: '/' */
  namespace?: string | undefined;
}

export interface EmitOptions {
  /** Room or user id (depending on helper). */
  room?: string | undefined;
  /** Whether to skip sender. */
  skipSocketId?: string | undefined;
}

type NormalizedRate = {
  tokensPerSecond: number;
  burst: number;
};

type NormalizedOptions = {
  ioOpts: ServerOptions;
  rate: NormalizedRate;
  namespace: string;
  allowedOriginsNote?: string | undefined;
};

// ------------------------------------------------------------
// Internal state (singleton)
// ------------------------------------------------------------

const initOnce = new Once<void>();
let io: IOServer | null = null;

// userId -> Set<socketId>
const userSockets = new Map<string, Set<string>>();
// socketId -> userId
const socketUser = new Map<string, string>();

// Guard for session maps
const sessionLock = new Mutex();

// ------------------------------------------------------------
// Token-Bucket Rate Limiter (per socket)
// ------------------------------------------------------------

class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly ratePerSec: number;
  private lastTs: number;

  constructor(tokensPerSecond: number, burst: number) {
    this.ratePerSec = Math.max(1, tokensPerSecond | 0);
    this.capacity = Math.max(this.ratePerSec, burst | 0);
    this.tokens = this.capacity;
    this.lastTs = Date.now();
  }

  tryRemove(count = 1): boolean {
    const now = Date.now();
    const elapsed = Math.max(0, now - this.lastTs) / 1000;
    if (elapsed > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.ratePerSec);
      this.lastTs = now;
    }
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  get fillRatio(): number {
    return clamp(this.tokens / this.capacity, 0, 1);
  }
}

// socketId -> limiter
const limiters = new Map<string, TokenBucket>();

function getLimiter(socketId: string, cfg: NormalizedRate): TokenBucket {
  let l = limiters.get(socketId);
  if (!l) {
    l = new TokenBucket(cfg.tokensPerSecond, cfg.burst);
    limiters.set(socketId, l);
  }
  return l;
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function buildDefaultServerOptions(): Partial<ServerOptions> {
  return {
    transports: ['websocket'],
    serveClient: false,
    allowEIO3: false,
    maxHttpBufferSize: 1 * 1024 * 1024,
    pingInterval: 20_000,
    pingTimeout: 20_000,
    cors: {
      origin: true,
      credentials: true,
    },
  };
}

function normalizeOptions(opts?: SocketServiceOptions): NormalizedOptions {
  const defaults = buildDefaultServerOptions();
  const ioOpts: ServerOptions = { ...defaults, ...(opts?.io ?? {}) } as ServerOptions;

  const rate: NormalizedRate = {
    tokensPerSecond: opts?.rate?.tokensPerSecond ?? 20,
    burst: opts?.rate?.burst ?? 60,
  };

  const namespace = opts?.namespace
    ? opts.namespace.startsWith('/')
      ? opts.namespace
      : `/${opts.namespace}`
    : '/';

  return {
    ioOpts,
    rate,
    namespace,
    allowedOriginsNote: opts?.allowedOriginsNote,
  };
}

function parseAuthFromHandshake(req: IncomingMessage): string | null {
  // 1) Authorization header Bearer
  const header = req.headers['authorization'] as string | undefined;
  const fromHeader = extractBearer(header);
  if (fromHeader) return fromHeader;

  // 2) Query token (?token=...)
  const url = req.url ?? '';
  const i = url.indexOf('?');
  if (i >= 0) {
    const qs = new URLSearchParams(url.slice(i));
    const q = qs.get('token');
    if (q && typeof q === 'string' && q.trim().length > 0) return q.trim();
  }

  return null;
}

async function registerSocketUser(socket: Socket, userId: string): Promise<void> {
  await sessionLock.runExclusive(async () => {
    socketUser.set(socket.id, userId);
    let set = userSockets.get(userId);
    if (!set) {
      set = new Set<string>();
      userSockets.set(userId, set);
    }
    set.add(socket.id);
  });
}

async function unregisterSocket(socketId: string): Promise<void> {
  await sessionLock.runExclusive(async () => {
    const userId = socketUser.get(socketId);
    socketUser.delete(socketId);
    limiters.delete(socketId);

    if (!userId) return;
    const set = userSockets.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) userSockets.delete(userId);
  });
}

function socketUserId(socket: Socket): string | null {
  const uid = socketUser.get(socket.id);
  return uid ?? null;
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

/**
 * Initialize Socket.IO server (idempotent).
 * - Sets up handshake JWT auth, rate limiting, and core events.
 */
export async function initSocketIOServer(
  http: HTTPServer,
  options?: SocketServiceOptions,
): Promise<IOServer> {
  await initOnce.run(async () => {
    const cfg = normalizeOptions(options);

    io = new IOServer(http, cfg.ioOpts);
    const ns = io.of(cfg.namespace);

    logger.info('[SOCKET] Server initializing', {
      ns: cfg.namespace,
      transports: cfg.ioOpts.transports,
      allowedOriginsNote: cfg.allowedOriginsNote,
      rate: cfg.rate,
    });

    // -------- Authentication middleware (JWT in handshake) --------
    ns.use(
      safeAsync(async (socket: Socket, next: (err?: Error) => void) => {
        try {
          const token = parseAuthFromHandshake(socket.request as IncomingMessage);
          if (!token) {
            logger.warn('[SOCKET] Missing token in handshake', {
              sid: socket.id,
              ip: socket.handshake.address,
            });
            const err = new Error('Unauthorized');
            (err as any).data = { code: 401 };
            return next(err);
          }

          const payload = verifyAccessToken(token);
          const user: SocketUser = {
            id: payload.sub,
            role: (payload as any).role,
            roles: (payload as any).roles,
            scopes: (payload as any).scopes,
          };

          (socket.data as Record<string, unknown>)['auth'] = {
            token,
            payload,
            user,
          } as SocketAuthContext;

          await registerSocketUser(socket, user.id);
          logger.info('[SOCKET] Auth OK', {
            sid: socket.id,
            uid: user.id,
            ip: socket.handshake.address,
          });
          return next();
        } catch (error) {
          const e = error instanceof Error ? error : new Error(String(error));
          logger.warn('[SOCKET] Auth failed', { sid: socket.id, error: e.message });
          const err = new Error('Unauthorized');
          (err as any).data = { code: 401, message: e.message };
          return next(err);
        }
      }),
    );

    // -------- Connection lifecycle --------
    ns.on(
      'connection',
      safeAsync(async (socket: Socket) => {
        const auth = (socket.data as Record<string, unknown>)['auth'] as
          | SocketAuthContext
          | undefined;
        const uid = auth?.user?.id ?? 'unknown';

        // Per-socket limiter
        const limiter = getLimiter(socket.id, cfg.rate);

        // Attach basic handlers (allocation-light)
        socket.on(
          'ping',
          safeAsync(async (clientTs?: number) => {
            // cheap-limited
            if (!limiter.tryRemove(1)) return;
            const now = Date.now();
            const rtt = typeof clientTs === 'number' ? now - clientTs : 0;
            // micro-protocol: respond with serverTs & measured RTT
            socket.emit('pong', {
              serverTs: now,
              rtt: roundTo(rtt, 2),
              fill: roundTo(limiter.fillRatio * 100, 2),
            });
          }),
        );

        socket.on(
          'join',
          safeAsync(async (room?: string) => {
            if (!limiter.tryRemove(1)) return;
            if (typeof room !== 'string' || room.length === 0) return;
            await socket.join(room);
            logger.debug('[SOCKET] joined room', { sid: socket.id, uid, room });
          }),
        );

        socket.on(
          'leave',
          safeAsync(async (room?: string) => {
            if (!limiter.tryRemove(1)) return;
            if (typeof room !== 'string' || room.length === 0) return;
            await socket.leave(room);
            logger.debug('[SOCKET] left room', { sid: socket.id, uid, room });
          }),
        );

        socket.on(
          'echo',
          safeAsync(async (payload?: unknown) => {
            if (!limiter.tryRemove(1)) return;
            socket.emit('echo', payload);
          }),
        );

        socket.on(
          'disconnect',
          safeAsync(async (reason: string) => {
            logger.info('[SOCKET] disconnected', { sid: socket.id, uid, reason });
            await unregisterSocket(socket.id);
          }),
        );

        // Give the event loop a breath for fairness
        await microtask();

        // initial hello
        socket.emit('hello', { uid, sid: socket.id, ts: Date.now() });
      }),
    );

    logger.info('[SOCKET] Server ready', { ns: cfg.namespace });
  });

  return io as IOServer;
}

/** Emit to a specific user (by userId -> all sockets). */
export async function emitToUser(userId: string, event: string, payload: unknown): Promise<number> {
  const ioRef = io;
  if (!ioRef) return 0;

  let count = 0;
  await sessionLock.runExclusive(async () => {
    const set = userSockets.get(userId);
    if (!set || set.size === 0) return;

    for (const sid of set) {
      const s = ioRef.sockets.sockets.get(sid);
      if (!s) continue;
      s.emit(event, payload);
      count++;
    }
  });

  return count;
}

/** Emit to a room (namespace '/'). */
export function emitToRoom(room: string, event: string, payload: unknown): void {
  const ioRef = io;
  if (!ioRef) return;
  if (!room) return;
  ioRef.to(room).emit(event, payload);
}

/** Broadcast globally (namespace '/'). */
export function broadcast(event: string, payload: unknown): void {
  const ioRef = io;
  if (!ioRef) return;
  ioRef.emit(event, payload);
}

/** Disconnect a user (all sockets). */
export async function disconnectUser(
  userId: string,
  reason = 'server:disconnect',
): Promise<number> {
  const ioRef = io;
  if (!ioRef) return 0;
  let count = 0;

  await sessionLock.runExclusive(async () => {
    const set = userSockets.get(userId);
    if (!set || set.size === 0) return;
    for (const sid of set) {
      const s = ioRef.sockets.sockets.get(sid);
      if (!s) continue;
      try {
        s.disconnect(true);
        count++;
      } catch (e) {
        logger.warn('[SOCKET] disconnectUser error', { sid, error: String(e) });
      }
    }
  });

  return count;
}

/** Snapshot basic metrics (cheap). */
export function snapshotMetrics() {
  const ioRef = io;
  if (!ioRef) return { connections: 0, users: 0 };
  return {
    connections: ioRef.engine.clientsCount,
    users: userSockets.size,
  };
}

/** Close server (idempotent). */
export async function closeSocketIOServer(): Promise<void> {
  if (!io) return;
  const ioRef = io;
  io = null;

  try {
    await new Promise<void>((resolve) => ioRef.close(() => resolve()));
  } catch (e) {
    logger.warn('[SOCKET] close error', { error: String(e) });
  }

  // Clear registries
  await sessionLock.runExclusive(async () => {
    userSockets.clear();
    socketUser.clear();
    limiters.clear();
  });

  logger.info('[SOCKET] Server closed');
}

// ------------------------------------------------------------
// Default export (frozen)
// ------------------------------------------------------------

export default Object.freeze({
  initSocketIOServer,
  closeSocketIOServer,
  emitToUser,
  emitToRoom,
  broadcast,
  disconnectUser,
  snapshotMetrics,
});
