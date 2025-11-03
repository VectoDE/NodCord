/**
 * ------------------------------------------------------------
 * PM2 Monitoring Service – System Telemetry
 * ------------------------------------------------------------
 *
 * Features:
 * - PM2.io live metrics integration (CPU, memory, latency, errors)
 * - Express middleware for telemetry instrumentation
 * - Async-safe metric updates with graceful error handling
 * - Structured metrics logging (Winston)
 * - Mutex-protected update cycles
 * - Utility integration: async, sync, number, response, baseUrl
 *
 * Tech:
 * - Node.js 20+
 * - TypeScript 5.x strict (verbatimModuleSyntax)
 * - PM2.io, Winston
 */

import { createRequire } from 'node:module';
import os from 'os';

import pmx from '@pm2/io';
import pm2 from 'pm2';
import type { ProcessDescription } from 'pm2';

import logger from '@/services/logger.service';

// Type-only imports
import type { Express, Request, Response, NextFunction } from 'express';

// Utils
import { tryAsync } from '@/utils/async.util';
import { Mutex } from '@/utils/sync.util';
import { bytesToGB, clampPercent } from '@/utils/number.util';
import responseUtil from '@/utils/response.util';
import { getBaseUrl } from '@/utils/baseUrl.util';

const require = createRequire(import.meta.url);
const packageInfo = require('../../package.json') as { version?: string; name?: string };

// ============================================================
// Initialize PM2 Context
// ============================================================

const io = pmx.init({
  transactions: true,
  metrics: true as any,
  tracing: false,
} as any);

logger.info('[PM2] IO context initialized successfully.');

// ============================================================
// Metric Definitions
// ============================================================

const metrics = {
  realtimeUsers: io.metric({
    name: 'Realtime Users',
    id: 'app/realtime/users',
    type: 'gauge',
  } as any),
  latency: io.metric({ name: 'Latency (ms)', type: 'histogram', measurement: 'mean' } as any),
  requests: io.counter({ name: 'Request Count', id: 'app/requests/count' } as any),
  errorRate: io.meter({
    name: 'Error Rate',
    id: 'app/errors/rate',
    samples: 1,
    timeframe: 60,
  } as any),
  totalMemory: io.metric({
    name: 'Total Memory (GB)',
    id: 'system/memory/total',
    type: 'gauge',
    value: () => bytesToGB(os.totalmem()),
  } as any),
  freeMemory: io.metric({
    name: 'Free Memory (GB)',
    id: 'system/memory/free',
    type: 'gauge',
    value: () => bytesToGB(os.freemem()),
  } as any),
  processMemory: io.metric({
    name: 'Process Memory (MB)',
    id: 'process/memory/usage',
    type: 'gauge',
    value: () => (process.memoryUsage().rss / 1_048_576).toFixed(2),
  } as any),
  cpuUsage: io.metric({
    name: 'CPU Usage (%)',
    id: 'system/cpu/usage',
    type: 'gauge',
  } as any),
  nodeVersion: io.metric({
    name: 'Node.js Version',
    id: 'process/node/version',
    type: 'gauge',
    value: () => process.version,
  } as any),
  appVersion: io.metric({
    name: 'App Version',
    id: 'app/version',
    type: 'gauge',
    value: () => packageInfo.version,
  } as any),
  environment: io.metric({
    name: 'Node Environment',
    id: 'process/node/env',
    type: 'gauge',
    value: () => process.env['NODE_ENV'] ?? 'development',
  } as any),
};

// ============================================================
// Internal Locks & Helpers
// ============================================================

const metricLock = new Mutex();

// Safely derive CPU info type from os.cpus()
type CpuInfo = ReturnType<typeof os.cpus>[number];
let lastCpuTimes: CpuInfo[] | null = null;

async function updateSystemMetrics(): Promise<void> {
  await metricLock.runExclusive(async () => {
    try {
      const cpus = os.cpus();
      if (!Array.isArray(cpus) || cpus.length === 0) {
        logger.warn('[PM2] No CPU data detected.');
        return;
      }

      const total = os.totalmem();
      const free = os.freemem();
      const usedPct = clampPercent(((total - free) / total) * 100);

      // --- CPU Usage Calculation ---
      let cpuUsagePct = 0;

      if (lastCpuTimes && lastCpuTimes.length === cpus.length) {
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

        if (totalDiff > 0) {
          cpuUsagePct = clampPercent(100 - (idleDiff / totalDiff) * 100);
        }
      } else {
        // First measurement: initialize baseline and skip calculation
        lastCpuTimes = cpus;
        return;
      }

      // Cache current CPU times for next delta calculation
      lastCpuTimes = cpus;

      // --- Update PM2 Metrics ---
      metrics.cpuUsage.set(Number(cpuUsagePct.toFixed(2)));
      metrics.totalMemory.set(bytesToGB(total));
      metrics.freeMemory.set(bytesToGB(free));
      metrics.processMemory.set((process.memoryUsage().rss / 1_048_576).toFixed(2));

      logger.debug('[PM2] System metrics updated', {
        cpuUsage: `${cpuUsagePct.toFixed(2)}%`,
        ramUsed: `${usedPct.toFixed(2)}%`,
        freeGB: bytesToGB(free).toFixed(2),
        totalGB: bytesToGB(total).toFixed(2),
      });
    } catch (error) {
      const e = error instanceof Error ? error : new Error(String(error));
      logger.error('[PM2] Failed to update system metrics', { error: e.message });
    }
  });
}

// ============================================================
// Express Integration
// ============================================================

export const pm2Component = (app: Express, componentName: string): void => {
  logger.info(`[PM2] Initializing monitoring for component: ${componentName}`);

  // Track requests
  app.use((req: Request, _res: Response, next: NextFunction) => {
    try {
      metrics.requests.inc();
      metrics.realtimeUsers.set(1);
    } catch (error) {
      const e = error instanceof Error ? error : new Error(String(error));
      logger.warn('[PM2] Failed to increment request metric', { error: e.message });
    }
    next();
  });

  // Track errors
  app.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    if (err) {
      try {
        metrics.errorRate.mark();
      } catch (error) {
        const e = error instanceof Error ? error : new Error(String(error));
        logger.error('[PM2] Error metric update failed', { error: e.message });
      }
    }
    next(err);
  });

  // Periodic metric updates
  setInterval(() => {
    void updateSystemMetrics().catch((error) => {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('[PM2] Scheduled metric update failed', { error: err.message });
    });
  }, 2000);

  // Latency Simulation Metric (Optional Demo)
  setInterval(() => {
    const latencyVal = Math.floor(Math.random() * 150);
    metrics.latency.set(latencyVal);
  }, 1000);

  // Static metrics init
  metrics.nodeVersion.set(process.version);
  metrics.appVersion.set(packageInfo.version);
  metrics.environment.set(process.env['NODE_ENV'] ?? 'development');

  // ------------------------------------------------------------
  // PM2 Custom Action: "log:system-info"
  // ------------------------------------------------------------
  io.action('log:system-info', async (reply: (data: any) => void) => {
    const systemInfo = {
      uptime: process.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      totalMemoryGB: bytesToGB(os.totalmem()),
      freeMemoryGB: bytesToGB(os.freemem()),
      usedMemoryPct: clampPercent(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
      processMemoryMB: (process.memoryUsage().rss / 1_048_576).toFixed(2),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0]?.model ?? 'Unknown',
      baseUrl: getBaseUrl(),
      appVersion: packageInfo.version,
      nodeVersion: process.version,
      nodeEnv: process.env['NODE_ENV'] ?? 'development',
    };

    logger.info('[PM2] System Snapshot', systemInfo);
    reply({ systemInfo });
  });

  logger.info(`[PM2] Monitoring active for: ${componentName}`);
};

// ============================================================
// API Endpoint (Optional)
// ============================================================

export const getMetricsSnapshot = async (_req: Request, res: Response): Promise<void> => {
  const result = await tryAsync(async () => {
    const cpuMetric = metrics.cpuUsage as unknown as { val?: () => number };
    const requestMetric = metrics.requests as unknown as { val?: () => number };
    const errorRateMetric = metrics.errorRate as unknown as { val?: () => number };

    const cpuUsage = typeof cpuMetric?.val === 'function' ? Number(cpuMetric.val()) : undefined;
    const requests =
      typeof requestMetric?.val === 'function' ? Number(requestMetric.val()) : undefined;
    const errorRate =
      typeof errorRateMetric?.val === 'function' ? Number(errorRateMetric.val()) : undefined;

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    return {
      cpuUsage,
      memory: {
        total: totalMemory,
        free: freeMemory,
        process: process.memoryUsage().rss,
      },
      uptime: process.uptime(),
      appVersion: packageInfo.version,
      nodeVersion: process.version,
      env: process.env['NODE_ENV'] ?? 'development',
      requests,
      errorRate,
    };
  });

  if (!result.ok) {
    logger.error('[PM2] Failed to get metrics snapshot', { error: result.error.message });
    responseUtil.standardResponse(
      res,
      500,
      { error: 'Failed to collect metrics.' },
      'Failed to collect metrics.',
    );
    return;
  }

  responseUtil.standardResponse(
    res,
    200,
    { ...result.value, timestamp: new Date().toISOString() },
    'PM2 metrics snapshot retrieved',
  );
};

export interface Pm2ProcessSummary {
  name: string;
  pmId: number;
  pid: number;
  status: string;
  cpu: number;
  memoryBytes: number;
  uptimeMs: number;
  restartCount: number;
  namespace?: string;
}

function toNumber(value: unknown, fallback = 0): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export async function listProcesses(): Promise<Pm2ProcessSummary[]> {
  return new Promise((resolve) => {
    pm2.connect((connectErr) => {
      if (connectErr) {
        const err = connectErr instanceof Error ? connectErr : new Error(String(connectErr));
        logger.error('[PM2] Unable to connect to PM2 daemon', { error: err.message });
        return resolve([]);
      }

      pm2.list((err, processList: ProcessDescription[]) => {
        if (err) {
          const listError = err instanceof Error ? err : new Error(String(err));
          logger.error('[PM2] Failed to list processes', { error: listError.message });
          pm2.disconnect();
          return resolve([]);
        }

        const processes: Pm2ProcessSummary[] = processList.map((proc) => {
          const env = (proc.pm2_env ?? {}) as Record<string, unknown>;
          const monit = (proc.monit ?? {}) as Record<string, unknown>;

          const pmUptime =
            typeof env['pm_uptime'] === 'number' ? (env['pm_uptime'] as number) : undefined;
          const uptimeMs = pmUptime ? Math.max(0, Date.now() - pmUptime) : 0;

          const summary: Pm2ProcessSummary = {
            name: typeof proc.name === 'string' ? proc.name : 'process',
            pmId: typeof proc.pm_id === 'number' ? proc.pm_id : -1,
            pid: typeof proc.pid === 'number' ? proc.pid : 0,
            status: typeof env['status'] === 'string' ? (env['status'] as string) : 'unknown',
            cpu: toNumber(monit['cpu']),
            memoryBytes: toNumber(monit['memory']),
            uptimeMs,
            restartCount:
              typeof env['restart_time'] === 'number' ? (env['restart_time'] as number) : 0,
          };

          if (typeof env['namespace'] === 'string' && env['namespace']) {
            summary.namespace = env['namespace'] as string;
          }

          return summary;
        });

        pm2.disconnect();
        resolve(processes);
      });
    });
  });
}

export const monitorComponent = pm2Component;

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  pm2Component,
  monitorComponent,
  getMetricsSnapshot,
  updateSystemMetrics,
  listProcesses,
});
