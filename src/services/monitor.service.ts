/**
 * ------------------------------------------------------------
 * Monitor Service – Health & Metrics
 * ------------------------------------------------------------
 *
 * Endpoints:
 * - GET /health      → Liveness probe (fast)
 * - GET /ready       → Readiness probe (checks registered deps)
 * - GET /metrics     → Detailed metrics (JWT-protected optional)
 *
 * Utilities used:
 * - async.util:        safeAsync
 * - number.util:       percent, roundTo, humanizeBytes
 * - response.util:     standardResponse
 * - routesCollector:   extractRoutes
 * - sync.util:         Mutex, Once, microtask
 * - jwt.util:          extractBearer, verifyAccessToken
 */

import os from 'os';
import process from 'process';
import { createRequire } from 'module';
import type { Express, Request, Response, NextFunction, Application } from 'express';

import logger from '@/services/logger.service';

import { safeAsync } from '@/utils/async.util';
import { percent, roundTo, humanizeBytes } from '@/utils/number.util';
import { standardResponse } from '@/utils/response.util';
import { extractRoutes } from '@/utils/routesCollector.util';
import { Mutex, Once, microtask } from '@/utils/sync.util';
import { extractBearer, verifyAccessToken } from '@/utils/jwt.util';

// ============================================================
// Types
// ============================================================

export interface DependencyCheck {
  name: string;
  check: () => Promise<{
    ok: boolean;
    latencyMs?: number;
    info?: Record<string, unknown>;
  }>;
  timeoutMs?: number;
}

export interface MonitorOptions {
  protectMetrics?: boolean;
  routePrefix?: string;
  metricsIntervalMs?: number;
}

interface MetricsSnapshot {
  ts: string;
  pid: number;
  uptimeSec: number;

  cpuUsagePct: number;
  memRssBytes: number;
  memHeapUsedBytes: number;
  memHeapTotalBytes: number;

  systemTotalMemBytes: number;
  systemFreeMemBytes: number;

  eventLoopLagMs: number;

  routes?: { count: number };
}

interface ReadinessDependencySnapshot {
  ok: boolean;
  latencyMs?: number;
  info?: Record<string, unknown>;
}

export interface ReadinessSnapshot {
  ok: boolean;
  dependencies: Record<string, ReadinessDependencySnapshot>;
}

export interface StatusSummary {
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: MetricsSnapshot;
  readiness: ReadinessSnapshot;
  routes?: { count: number };
  timestamp: string;
}

type BotModule = {
  getBots?: () => Promise<{ botData: Array<Record<string, unknown>> }>;
  getMembers?: () => Promise<{ memberData: Array<Record<string, unknown>> }>;
  getServers?: () => Promise<{ serverData: Array<Record<string, unknown>> }>;
};

export interface CloudNetNode {
  name: string;
  status: 'online' | 'offline' | 'unknown';
  services: number;
  memoryUsedMb: number;
  memoryMaxMb: number;
  lastHeartbeat?: string;
}

export interface CloudNetService {
  name: string;
  task: string;
  node: string;
  status: 'online' | 'offline' | 'starting' | 'stopped' | 'unknown';
  players: number;
  memoryMb: number;
  startedAt?: string;
}

export interface CloudNetStatusSummary {
  status: 'online' | 'offline' | 'unknown';
  version: string | null;
  nodes: CloudNetNode[];
  services: CloudNetService[];
  lastUpdated: string;
}

// ============================================================
// Internal State
// ============================================================

const DEFAULTS = Object.freeze({
  routePrefix: '/monitor',
  metricsIntervalMs: 2000,
});

const deps: Map<string, DependencyCheck> = new Map();
const metricLock = new Mutex();
const startOnce = new Once<void>();
const stopOnce = new Once<void>();

type CpuInfo = ReturnType<typeof os.cpus>[number];

let metricsTimer: NodeJS.Timeout | null = null;
let lastCpuTimes: CpuInfo[] | undefined;
let lastSnapshot: MetricsSnapshot | undefined;
let eventLoopLagAvg = 0;

let lagTimer: NodeJS.Timeout | null = null;
const LAG_INTERVAL = 250;
const LAG_ALPHA = 0.2;

const require = createRequire(import.meta.url);
let cachedBotModule: BotModule | null | undefined;

function resolveBotModule(): BotModule | null {
  if (cachedBotModule !== undefined) return cachedBotModule;

  try {
    cachedBotModule = require('../bot/bot') as BotModule;
    logger.debug('[MONITOR] Discord bot module loaded');
    return cachedBotModule;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[MONITOR] Discord bot module unavailable', { error: err.message });
    cachedBotModule = null;
    return null;
  }
}

function parseCloudNetEnv<T>(key: string, fallback: T): T {
  const raw = process.env[key];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[MONITOR] Failed to parse CloudNet env', { key, error: err.message });
    return fallback;
  }
}

// ============================================================
// Helpers
// ============================================================

function clampPct(n: number): number {
  return n < 0 ? 0 : n > 100 ? 100 : n;
}

/** Event loop lag via setTimeout drift and EWMA smoothing */
function startLagSampler(): void {
  if (lagTimer) return;
  let expected = Date.now() + LAG_INTERVAL;
  lagTimer = setInterval(() => {
    const now = Date.now();
    const drift = Math.max(0, now - expected);
    eventLoopLagAvg =
      eventLoopLagAvg === 0 ? drift : LAG_ALPHA * drift + (1 - LAG_ALPHA) * eventLoopLagAvg;
    expected = now + LAG_INTERVAL;
  }, LAG_INTERVAL);
}

function stopLagSampler(): void {
  if (lagTimer) clearInterval(lagTimer);
  lagTimer = null;
  eventLoopLagAvg = 0;
}

/** Compute CPU usage delta */
function computeCpuUsagePct(cpus: CpuInfo[]): number {
  if (!Array.isArray(cpus) || cpus.length === 0) return 0;

  if (!lastCpuTimes || lastCpuTimes.length !== cpus.length) {
    lastCpuTimes = cpus;
    return 0;
  }

  let idleDiff = 0;
  let totalDiff = 0;

  for (let i = 0; i < cpus.length; i++) {
    const prev = lastCpuTimes[i];
    const curr = cpus[i];
    if (!prev || !curr) continue;

    const prevTimes = prev.times;
    const currTimes = curr.times;
    const idle = currTimes.idle - prevTimes.idle;
    const totalNow =
      currTimes.user +
      currTimes.nice +
      currTimes.sys +
      currTimes.idle +
      currTimes.irq -
      (prevTimes.user + prevTimes.nice + prevTimes.sys + prevTimes.idle + prevTimes.irq);

    idleDiff += idle;
    totalDiff += totalNow;
  }

  lastCpuTimes = cpus;
  if (totalDiff <= 0) return 0;

  const usage = clampPct(100 - (idleDiff / totalDiff) * 100);
  return roundTo(usage, 2);
}

/** Metrics collector */
async function collectMetrics(): Promise<MetricsSnapshot> {
  return metricLock.runExclusive(async () => {
    const cpus = os.cpus() ?? [];
    const cpuUsagePct = computeCpuUsagePct(cpus);

    const mem = process.memoryUsage();
    const total = os.totalmem();
    const free = os.freemem();

    const snapshot: MetricsSnapshot = {
      ts: new Date().toISOString(),
      pid: process.pid,
      uptimeSec: Math.floor(process.uptime()),

      cpuUsagePct,
      memRssBytes: mem.rss,
      memHeapUsedBytes: mem.heapUsed,
      memHeapTotalBytes: mem.heapTotal,

      systemTotalMemBytes: total,
      systemFreeMemBytes: free,

      eventLoopLagMs: roundTo(eventLoopLagAvg, 2),
    };

    lastSnapshot = snapshot;
    return snapshot;
  });
}

/** Timeout wrapper */
async function withTimeout<T>(p: Promise<T>, ms = 3000): Promise<T> {
  if (!(ms > 0)) return p;
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// ============================================================
// Dependency Registry
// ============================================================

export function registerDependency(check: DependencyCheck): void {
  if (!check?.name || typeof check.check !== 'function') {
    throw new TypeError('[MONITOR] Invalid dependency check registration');
  }
  deps.set(check.name, check);
  logger.info('[MONITOR] Registered dependency', { name: check.name });
}

export function clearDependencies(): void {
  deps.clear();
  logger.info('[MONITOR] Cleared all registered dependencies');
}

// ============================================================
// Health / Readiness
// ============================================================

export const getLiveness = safeAsync(async () => {
  const snap = lastSnapshot ?? (await collectMetrics());
  if (!snap) {
    throw new Error('[MONITOR] Unable to compute liveness snapshot');
  }
  return {
    ok: true,
    uptimeSec: snap.uptimeSec,
    eventLoopLagMs: snap.eventLoopLagMs,
    memory: {
      rss: humanizeBytes(snap.memRssBytes),
      heapUsed: humanizeBytes(snap.memHeapUsedBytes),
    },
  };
});

export const getReadiness = safeAsync(async () => {
  const results: Record<string, ReadinessDependencySnapshot> = {};
  let allOk = true;

  for (const [name, dep] of deps.entries()) {
    const t0 = performance.now();
    try {
      const res = await withTimeout(dep.check(), dep.timeoutMs ?? 3000);
      const latencyMs = Math.max(0, performance.now() - t0);
      const snapshot: ReadinessDependencySnapshot = {
        ok: !!res.ok,
        latencyMs: roundTo(latencyMs, 2),
      };
      if (res.info) snapshot.info = res.info;
      results[name] = snapshot;
      if (!res.ok) allOk = false;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      const latencyMs = Math.max(0, performance.now() - t0);
      results[name] = {
        ok: false,
        latencyMs: roundTo(latencyMs, 2),
        info: { error: e.message },
      };
      allOk = false;
    }
  }

  return { ok: allOk, dependencies: results };
});

// ============================================================
// Express Handlers
// ============================================================

function jwtGuard(enabled: boolean) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!enabled) return next();
    try {
      const token = extractBearer(req.headers['authorization'] as string | undefined);
      if (!token) {
        standardResponse(res, 401, 'Unauthorized');
        return;
      }
      verifyAccessToken(token);
      return next();
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.warn('[MONITOR] JWT guard failed', { error: e.message });
      standardResponse(res, 401, 'Unauthorized');
    }
  };
}

function routeSummary(app: Express | Application): { count: number } {
  try {
    const routes = extractRoutes(app as unknown as Express);
    return { count: routes.length };
  } catch (err: unknown) {
    logger.debug('[MONITOR] Route extraction failed');
    return { count: 0 };
  }
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function sanitizeNodeStatus(value: unknown): 'online' | 'offline' | 'unknown' {
  return value === 'online' || value === 'offline' ? (value as 'online' | 'offline') : 'unknown';
}

function sanitizeServiceStatus(
  value: unknown,
): 'online' | 'offline' | 'starting' | 'stopped' | 'unknown' {
  if (value === 'online' || value === 'offline' || value === 'starting' || value === 'stopped') {
    return value;
  }
  return 'unknown';
}

function sanitizeString(value: unknown, fallback = 'unknown'): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

// ============================================================
// Public Data Helpers
// ============================================================

export async function getStatusSummary(app?: Express | Application): Promise<StatusSummary> {
  const snapshotCandidate = await collectMetrics();
  const metrics = snapshotCandidate ?? lastSnapshot;
  if (!metrics) {
    throw new Error('[MONITOR] Metrics snapshot unavailable');
  }

  let readiness: ReadinessSnapshot;
  try {
    const readinessRaw = await getReadiness();
    readiness = readinessRaw ?? { ok: false, dependencies: {} };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[MONITOR] Readiness check failed', { error: err.message });
    readiness = { ok: false, dependencies: {} };
  }

  const dependencyValues = Object.values(readiness.dependencies);
  const unhealthyCount = dependencyValues.filter((dep) => !dep.ok).length;
  let status: StatusSummary['status'] = readiness.ok ? 'healthy' : 'degraded';
  if (dependencyValues.length > 0 && unhealthyCount === dependencyValues.length) {
    status = 'unhealthy';
  }

  const routes = app ? routeSummary(app) : metrics.routes;

  const summary: StatusSummary = {
    status,
    metrics,
    readiness,
    timestamp: metrics.ts,
  };

  if (routes) {
    summary.routes = routes;
  }

  return summary;
}

export async function getBots(): Promise<{ botData: Array<Record<string, unknown>> }> {
  const mod = resolveBotModule();
  if (!mod?.getBots) return { botData: [] };

  try {
    const result = await mod.getBots();
    const botData = Array.isArray(result?.botData) ? result.botData : [];
    return { botData };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[MONITOR] Failed to retrieve bots', { error: err.message });
    return { botData: [] };
  }
}

export async function getMembers(): Promise<{ memberData: Array<Record<string, unknown>> }> {
  const mod = resolveBotModule();
  if (!mod?.getMembers) return { memberData: [] };

  try {
    const result = await mod.getMembers();
    const memberData = Array.isArray(result?.memberData) ? result.memberData : [];
    return { memberData };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[MONITOR] Failed to retrieve members', { error: err.message });
    return { memberData: [] };
  }
}

export async function getServers(): Promise<{ serverData: Array<Record<string, unknown>> }> {
  const mod = resolveBotModule();
  if (!mod?.getServers) return { serverData: [] };

  try {
    const result = await mod.getServers();
    const serverData = Array.isArray(result?.serverData) ? result.serverData : [];
    return { serverData };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[MONITOR] Failed to retrieve servers', { error: err.message });
    return { serverData: [] };
  }
}

export async function getCloudNetNodes(): Promise<CloudNetNode[]> {
  const raw = parseCloudNetEnv<unknown[]>('CLOUDNET_NODES_JSON', []);
  return raw
    .filter(
      (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null,
    )
    .map((entry) => {
      const node: CloudNetNode = {
        name: sanitizeString(entry['name'], 'node'),
        status: sanitizeNodeStatus(entry['status']),
        services: sanitizeNumber(entry['services'], 0),
        memoryUsedMb: sanitizeNumber(entry['memoryUsedMb'] ?? entry['memoryUsed'], 0),
        memoryMaxMb: sanitizeNumber(entry['memoryMaxMb'] ?? entry['memoryMax'], 0),
      };

      const heartbeat =
        typeof entry['lastHeartbeat'] === 'string' && entry['lastHeartbeat'].length > 0
          ? (entry['lastHeartbeat'] as string)
          : undefined;
      if (heartbeat) {
        node.lastHeartbeat = heartbeat;
      }

      return node;
    });
}

export async function getCloudNetServices(): Promise<CloudNetService[]> {
  const raw = parseCloudNetEnv<unknown[]>('CLOUDNET_SERVICES_JSON', []);
  return raw
    .filter(
      (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null,
    )
    .map((entry) => {
      const service: CloudNetService = {
        name: sanitizeString(entry['name'], 'service'),
        task: sanitizeString(entry['task'], 'task'),
        node: sanitizeString(entry['node'], 'node'),
        status: sanitizeServiceStatus(entry['status']),
        players: sanitizeNumber(entry['players'], 0),
        memoryMb: sanitizeNumber(entry['memoryMb'] ?? entry['memory'], 0),
      };

      const startedAt =
        typeof entry['startedAt'] === 'string' && entry['startedAt'].length > 0
          ? (entry['startedAt'] as string)
          : undefined;
      if (startedAt) {
        service.startedAt = startedAt;
      }

      return service;
    });
}

export async function getCloudNetServiceByName(name: string): Promise<CloudNetService | undefined> {
  if (!name) return undefined;
  const services = await getCloudNetServices();
  return services.find((service) => service.name.toLowerCase() === name.toLowerCase());
}

export async function getCloudNetStatus(): Promise<CloudNetStatusSummary> {
  const [nodes, services] = await Promise.all([getCloudNetNodes(), getCloudNetServices()]);
  const statusEnv = sanitizeNodeStatus(process.env['CLOUDNET_STATUS']);
  const status: CloudNetStatusSummary['status'] =
    statusEnv !== 'unknown'
      ? statusEnv
      : nodes.length > 0 || services.length > 0
        ? 'online'
        : 'unknown';

  return {
    status,
    version: process.env['CLOUDNET_VERSION'] ?? null,
    nodes,
    services,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================
// Bootstrap / Wiring
// ============================================================

export async function startMonitor(app: Express, options?: MonitorOptions): Promise<void> {
  await startOnce.run(async () => {
    const cfg = {
      routePrefix: options?.routePrefix ?? DEFAULTS.routePrefix,
      metricsIntervalMs: options?.metricsIntervalMs ?? DEFAULTS.metricsIntervalMs,
      protectMetrics: options?.protectMetrics ?? false,
    };

    if (!metricsTimer) {
      await collectMetrics();
      metricsTimer = setInterval(() => {
        collectMetrics().catch((e: unknown) =>
          logger.warn('[MONITOR] Metrics tick failed', { error: String(e) }),
        );
      }, cfg.metricsIntervalMs);
    }

    startLagSampler();

    const base = cfg.routePrefix;

    app.get(
      `${base}/health`,
      safeAsync(async (_req: Request, res: Response) => {
        const data = await getLiveness();
        standardResponse(res, 200, data);
      }),
    );

    app.get(
      `${base}/ready`,
      safeAsync(async (_req: Request, res: Response) => {
        const data = await getReadiness();
        if (!data) {
          throw new Error('[MONITOR] Unable to compute readiness snapshot');
        }
        standardResponse(res, data.ok ? 200 : 503, data);
      }),
    );

    app.get(
      `${base}/metrics`,
      jwtGuard(cfg.protectMetrics),
      safeAsync(async (req: Request, res: Response) => {
        const snap = lastSnapshot ?? (await collectMetrics());
        if (!snap) {
          throw new Error('[MONITOR] Unable to compute metrics snapshot');
        }
        const routes = routeSummary(req.app);

        const sysUsedPct = percent(
          snap.systemTotalMemBytes - snap.systemFreeMemBytes,
          snap.systemTotalMemBytes,
        );

        const body = {
          ...snap,
          mem: {
            rss: humanizeBytes(snap.memRssBytes),
            heapUsed: humanizeBytes(snap.memHeapUsedBytes),
            heapTotal: humanizeBytes(snap.memHeapTotalBytes),
            system: {
              total: humanizeBytes(snap.systemTotalMemBytes),
              free: humanizeBytes(snap.systemFreeMemBytes),
              usedPct: roundTo(sysUsedPct, 2),
            },
          },
          routes,
          node: {
            version: process.version,
            pid: snap.pid,
            platform: process.platform,
          },
        };

        standardResponse(res, 200, body);
      }),
    );

    logger.info('[MONITOR] Service started', {
      prefix: cfg.routePrefix,
      intervalMs: cfg.metricsIntervalMs,
      protectMetrics: cfg.protectMetrics,
    });

    await microtask();
  });
}

export async function stopMonitor(): Promise<void> {
  await stopOnce.run(async () => {
    if (metricsTimer) clearInterval(metricsTimer);
    metricsTimer = null;
    stopLagSampler();
    logger.info('[MONITOR] Service stopped');
  });
}

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  startMonitor,
  stopMonitor,
  registerDependency,
  clearDependencies,
  getLiveness,
  getReadiness,
  getStatusSummary,
  getBots,
  getMembers,
  getServers,
  getCloudNetStatus,
  getCloudNetNodes,
  getCloudNetServices,
  getCloudNetServiceByName,
});
