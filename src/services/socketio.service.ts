/**
 * ------------------------------------------------------------
 * Socket.IO Service – Realtime Layer
 * ------------------------------------------------------------
 *
 * Features
 * - Robust initialization (CORS, transports, ping/pong)
 * - Optional JWT auth for handshake (via Authorization: Bearer)
 * - Per-socket rate limiting (token-bucket)
 * - Namespaces & rooms helpers
 * - Centralized observability via Winston logger
 * - Safe file upload route via Multer + disk-space guard
 *
 * How to use
 *   import http from 'http';
 *   import express from 'express';
 *   import { initSocket, registerDefaultHandlers, attachUploadRoute } from '@/services/socketio.service';
 *
 *   const app = express();
 *   const server = http.createServer(app);
 *   const io = initSocket(server);           // 1) init
 *   registerDefaultHandlers(io);             // 2) default connection handlers
 *   attachUploadRoute(app, '/api/uploads');  // 3) HTTP route for file uploads (multer + disk guard)
 *
 *   server.listen(3000);
 */

import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '@/services/logger.service';
import { upload, checkDiskSpaceMiddleware } from '@/services/multer.service';

import type { Express } from 'express';
import type { Socket } from 'socket.io';

// ============================================================
// Configuration
// ============================================================

type SocketAuthPayload = {
    sub?: string;        // User ID
    uid?: string;        // alt user id
    roles?: string[];
    iat?: number;
    exp?: number;
    [key: string]: unknown;
};

export type SocketIOOptions = {
    corsOrigin: string | string[] | RegExp | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    allowRequest?: (req: any, fn: (err: string | null, success?: boolean) => void) => void;
    transports: Array<'polling' | 'websocket'>;
    pingInterval: number;
    pingTimeout: number;
    maxHttpBufferSize: number; // Max message size
    rateLimit: {
        eventsPerInterval: number; // tokens
        intervalMs: number;        // refill period
    };
};

const DEFAULTS: SocketIOOptions = {
    corsOrigin: '*',
    transports: ['websocket', 'polling'],
    pingInterval: 20_000,
    pingTimeout: 25_000,
    maxHttpBufferSize: 1 * 1024 * 1024, // 1 MB per message
    rateLimit: {
        eventsPerInterval: 30,
        intervalMs: 5_000,
    },
};

// JWT secret (optional). If not present, handshake auth is “allow all”
const JWT_SECRET = process.env['JWT_SECRET'];

// ============================================================
// Internal state & helpers
// ============================================================

let ioRef: IOServer | null = null;

/**
 * Lightweight token bucket per socket for event rate limiting.
 */
class SocketRateLimiter {
    private tokens: number;
    private lastRefill: number;

    constructor(private capacity: number, private intervalMs: number) {
        this.tokens = capacity;
        this.lastRefill = Date.now();
    }

    allow(): boolean {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        if (elapsed >= this.intervalMs) {
            const refillCount = Math.floor(elapsed / this.intervalMs);
            this.tokens = Math.min(this.capacity, this.tokens + refillCount * this.capacity);
            this.lastRefill = now;
        }
        if (this.tokens > 0) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }
}

/**
 * Decorate a socket with rate limiter instance.
 */
const limiterMap = new WeakMap<Socket, SocketRateLimiter>();

function getLimiter(socket: Socket, cfg: SocketIOOptions['rateLimit']): SocketRateLimiter {
    let limiter = limiterMap.get(socket);
    if (!limiter) {
        limiter = new SocketRateLimiter(cfg.eventsPerInterval, cfg.intervalMs);
        limiterMap.set(socket, limiter);
    }
    return limiter;
}

// ============================================================
// Auth middleware (optional JWT)
// ============================================================

/**
 * Extract bearer token from handshake (auth.token or headers).
 */
function extractToken(socket: Socket): string | undefined {
    // Prefer explicit auth token provided by the client
    const fromAuth = (socket.handshake.auth?.token as string | undefined) ?? undefined;

    // Or Authorization header: "Bearer <token>"
    const authHeader = socket.handshake.headers?.authorization ?? socket.handshake.headers?.Authorization;
    let fromHeader: string | undefined;
    if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
        fromHeader = authHeader.slice(7);
    }
    return fromAuth ?? fromHeader;
}

/**
 * Verify JWT if secret is configured; otherwise pass-through.
 * Attaches decoded payload to socket.data.user.
 */
async function authMiddleware(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
        if (!JWT_SECRET) {
            // Auth disabled (development / public rooms)
            socket.data.user = { anonymous: true };
            return next();
        }
        const token = extractToken(socket);
        if (!token) {
            return next(new Error('Unauthorized: missing token'));
        }
        const payload = jwt.verify(token, JWT_SECRET) as SocketAuthPayload;
        socket.data.user = {
            id: payload.sub || payload.uid,
            roles: payload.roles ?? [],
            raw: payload,
        };
        return next();
    } catch (err) {
        logger.warn('[SOCKET] Auth failed', { error: (err as Error).message, ip: socket.handshake.address });
        return next(new Error('Unauthorized'));
    }
}

// ============================================================
// Public API – Initialization
// ============================================================

export function initSocket(server: HttpServer, options?: Partial<SocketIOOptions>): IOServer {
    if (ioRef) {
        logger.warn('[SOCKET] initSocket called twice. Reusing existing instance.');
        return ioRef;
    }

    const cfg: SocketIOOptions = { ...DEFAULTS, ...options };

    const io = new IOServer(server, {
        cors: { origin: cfg.corsOrigin, credentials: true },
        transports: cfg.transports,
        pingInterval: cfg.pingInterval,
        pingTimeout: cfg.pingTimeout,
        maxHttpBufferSize: cfg.maxHttpBufferSize,
        allowEIO3: false,
    });

    ioRef = io;

    // Global middleware
    io.use(authMiddleware);
    io.use((socket, next) => {
        // Attach rate limiter
        getLimiter(socket, cfg.rateLimit);
        return next();
    });

    // Connection logging
    io.on('connection', (socket) => {
        const userId = socket.data.user?.id ?? 'anonymous';
        logger.info('[SOCKET] Connected', {
            sid: socket.id,
            userId,
            ip: socket.handshake.address,
            ua: socket.handshake.headers['user-agent'],
        });

        socket.on('disconnect', (reason) => {
            logger.info('[SOCKET] Disconnected', { sid: socket.id, reason });
        });

        socket.on('error', (err) => {
            logger.error('[SOCKET] Error', { sid: socket.id, error: (err as Error).message });
        });
    });

    logger.info('[SOCKET] Socket.IO server initialized.');
    return io;
}

export function getIO(): IOServer {
    if (!ioRef) throw new Error('[SOCKET] IO not initialized. Call initSocket(server) first.');
    return ioRef;
}

// ============================================================
// Public API – Default handlers / Namespaces / Rooms
// ============================================================

/**
 * Registers a set of common events on the default namespace.
 * Includes: ping, join/leave room, broadcast message, typing, rate-limited.
 */
export function registerDefaultHandlers(io: IOServer): void {
    io.on('connection', (socket) => {
        const limiter = getLimiter(socket, DEFAULTS.rateLimit);

        const guarded = (event: string, handler: (...args: any[]) => void) => {
            socket.on(event, (...args) => {
                if (!limiter.allow()) {
                    logger.warn('[SOCKET] Rate limit exceeded', { sid: socket.id, event });
                    return;
                }
                try {
                    handler(...args);
                } catch (err) {
                    logger.error('[SOCKET] Handler error', { event, error: (err as Error).message });
                }
            });
        };

        guarded('ping', (payload) => {
            socket.emit('pong', { t: Date.now(), echo: payload });
        });

        guarded('room:join', (room: string) => {
            if (typeof room !== 'string' || !room) return;
            socket.join(room);
            logger.debug('[SOCKET] Join room', { sid: socket.id, room });
            socket.to(room).emit('room:user:join', { sid: socket.id, room });
        });

        guarded('room:leave', (room: string) => {
            if (typeof room !== 'string' || !room) return;
            socket.leave(room);
            logger.debug('[SOCKET] Leave room', { sid: socket.id, room });
            socket.to(room).emit('room:user:leave', { sid: socket.id, room });
        });

        guarded('message:send', (data: { room?: string; to?: string; text: string }) => {
            const payload = {
                from: socket.data.user?.id ?? 'anonymous',
                text: data?.text?.toString().slice(0, 4000) ?? '',
                ts: Date.now(),
            };
            if (!payload.text) return;

            if (data?.room) {
                io.to(data.room).emit('message:new', { ...payload, scope: 'room', room: data.room });
            } else if (data?.to) {
                socket.to(data.to).emit('message:new', { ...payload, scope: 'direct', to: data.to });
            } else {
                socket.broadcast.emit('message:new', { ...payload, scope: 'broadcast' });
            }
        });

        guarded('user:typing', (room: string) => {
            if (!room) return;
            socket.to(room).emit('user:typing', { sid: socket.id, room });
        });
    });

    logger.info('[SOCKET] Default handlers registered.');
}

/**
 * Create or get a namespace with optional custom connection handler.
 */
export function createNamespace(
    name: string,
    onConnect?: (nsSocket: Socket, namespace: ReturnType<IOServer['of']>) => void
) {
    const io = getIO();
    const nsp = io.of(name);

    nsp.use(authMiddleware);
    nsp.on('connection', (socket) => {
        logger.info('[SOCKET] Namespace connection', { ns: name, sid: socket.id });
        if (onConnect) {
            try {
                onConnect(socket, nsp);
            } catch (err) {
                logger.error('[SOCKET] Namespace onConnect error', { ns: name, error: (err as Error).message });
            }
        }
    });

    logger.info('[SOCKET] Namespace ready', { ns: name });
    return nsp;
}

// ============================================================
// Public API – Emit helpers
// ============================================================

export function emitToRoom(room: string, event: string, data: unknown): void {
    getIO().to(room).emit(event, data);
}

export function emitToAll(event: string, data: unknown): void {
    getIO().emit(event, data);
}

export function emitToSocketId(sid: string, event: string, data: unknown): void {
    const io = getIO();
    const sock = io.sockets.sockets.get(sid);
    if (sock) sock.emit(event, data);
}

// ============================================================
// HTTP Upload Route (Multer Integration)
// ============================================================

/**
 * Binds an Express HTTP route for secure uploads used alongside Socket.IO.
 * After successful upload, emits an event to a room (optional).
 *
 * Client flow:
 *  1) Upload file via HTTP POST to `route` (form field: "file")
 *  2) Server emits `upload:completed` with metadata to room or socket
 */
export function attachUploadRoute(app: Express, route = '/api/uploads'): void {
    logger.info('[SOCKET] Binding upload route', { route });

    app.post(
        route,
        checkDiskSpaceMiddleware,   // guard disk space
        (req, res, next) => {
            // optionally enforce auth here using the same JWT_SECRET
            // e.g., read Authorization header from HTTP request if required
            next();
        },
        upload,                      // multer single('file')
        (req, res) => {
            try {
                const file = (req as any).file as Express.Multer.File | undefined;
                if (!file) {
                    logger.warn('[UPLOAD] No file received');
                    return res.status(400).json({ error: 'No file uploaded' });
                }

                // Optional: choose a room to notify (via query param)
                const room = (req.query?.room as string | undefined) ?? undefined;

                const payload = {
                    filename: file.filename,
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    uploadedAt: Date.now(),
                };

                logger.info('[UPLOAD] File stored', payload);

                if (room) {
                    emitToRoom(room, 'upload:completed', payload);
                }

                return res.status(201).json({ ok: true, ...payload });
            } catch (err) {
                logger.error('[UPLOAD] Handler failed', { error: (err as Error).message });
                return res.status(500).json({ error: 'Upload failed' });
            }
        }
    );
}
