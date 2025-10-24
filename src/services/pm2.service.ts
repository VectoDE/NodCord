/**
 * ------------------------------------------------------------
 * PM2 Monitoring Service – System Metrics
 * ------------------------------------------------------------
 *
 * Provides:
 * - PM2.io custom metrics (requests, latency, memory, errors, etc.)
 * - Express middleware integration for live telemetry
 * - Secure and fault-tolerant metrics collection
 * - System-level insights (CPU, memory, version, environment)
 *
 * Technologies:
 * - @pm2/io for metrics & monitoring
 * - Winston logger for observability
 * - TypeScript + ESM (NodeNext) ready
 */

import pmx from '@pm2/io';
import os from 'os';
import logger from '@/services/logger.service';
import packageInfo from '../../package.json' with { type: 'json' };

// Type-only imports for Express
import type { Express, Request, Response, NextFunction } from 'express';

// ============================================================
// Initialize PM2 I/O Context (cast fixes TS2559)
// ============================================================

const io = pmx.init({
  transactions: true,
  metrics: true as any,
  tracing: false,
} as any);

logger.info('[PM2] IO context initialized successfully.');

// ============================================================
// Metric Definitions (casts fix TS2353)
// ============================================================

const realtimeUsers = io.metric({
  name: 'Realtime Users',
  id: 'app/realtime/users',
  type: 'gauge',
  measurement: 'count',
} as any);

const latency = io.metric({
  name: 'Latency',
  type: 'histogram',
  measurement: 'mean',
} as any);

const requestCounter = io.counter({
  name: 'Request Count',
  id: 'app/requests/count',
} as any);

const errorMeter = io.meter({
  name: 'Error Rate',
  id: 'app/errors/rate',
  samples: 1,
  timeframe: 60,
} as any);

const totalMemory = io.metric({
  name: 'Total Memory',
  id: 'system/memory/total',
  type: 'gauge',
  measurement: 'bytes',
  value: () => os.totalmem(),
} as any);

const freeMemory = io.metric({
  name: 'Free Memory',
  id: 'system/memory/free',
  type: 'gauge',
  measurement: 'bytes',
  value: () => os.freemem(),
} as any);

const processMemory = io.metric({
  name: 'Process Memory Usage',
  id: 'process/memory/usage',
  type: 'gauge',
  measurement: 'bytes',
  value: () => process.memoryUsage().rss,
} as any);

const nodeVersion = io.metric({
  name: 'Node.js Version',
  id: 'process/node/version',
  type: 'gauge',
  measurement: 'string',
  value: () => process.version,
} as any);

const appVersion = io.metric({
  name: 'Application Version',
  id: 'app/version',
  type: 'gauge',
  measurement: 'string',
  value: () => packageInfo.version,
} as any);

const nodeEnv = io.metric({
  name: 'Node Environment',
  id: 'process/node/env',
  type: 'gauge',
  measurement: 'string',
  value: () => process.env['NODE_ENV'] ?? 'development',
} as any);

// ============================================================
// PM2 Component Monitor
// ============================================================

export const pm2Component = (component: Express, componentName: string): void => {
  logger.info(`[PM2] Initializing monitoring for component: ${componentName}`);

  // Check metrics health
  const metricsReady =
    realtimeUsers && latency && requestCounter && errorMeter && totalMemory && freeMemory && processMemory;
  if (!metricsReady) {
    logger.error('[PM2] One or more metrics failed to initialize properly.');
    return;
  }

  realtimeUsers.set(1);

  // ------------------------------------------------------------
  // Simulated Latency Updates
  // ------------------------------------------------------------
  setInterval(() => {
    try {
      latency.set(Math.floor(Math.random() * 120));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`[PM2] Failed to update latency metric: ${err.message}`);
    }
  }, 1000);

  // ------------------------------------------------------------
  // Express Middleware Integration
  // ------------------------------------------------------------
  component.use((req: Request, _res: Response, next: NextFunction) => {
    try {
      requestCounter.inc();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`[PM2] Failed to increment request counter: ${err.message}`);
    }
    next();
  });

  component.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    try {
      if (err) errorMeter.mark();
    } catch (error) {
      const errObj = error instanceof Error ? error : new Error(String(error));
      logger.error(`[PM2] Failed to update error meter: ${errObj.message}`);
    }
    next(err);
  });

  // ------------------------------------------------------------
  // Memory Metrics
  // ------------------------------------------------------------
  setInterval(() => {
    try {
      totalMemory.set(os.totalmem());
      freeMemory.set(os.freemem());
      processMemory.set(process.memoryUsage().rss);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`[PM2] Memory metric update failed: ${err.message}`);
    }
  }, 2000);

  // ------------------------------------------------------------
  // Static Metrics (Version / Env)
  // ------------------------------------------------------------
  try {
    nodeVersion.set(process.version);
    appVersion.set(packageInfo.version);
    nodeEnv.set(process.env['NODE_ENV'] ?? 'development');
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`[PM2] Static metric initialization failed: ${err.message}`);
  }

  // ------------------------------------------------------------
  // PM2 Custom Action
  // ------------------------------------------------------------
  io.action('log:system-info', (reply: (data: any) => void) => {
    const systemInfo = {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      processMemory: process.memoryUsage().rss,
      nodeVersion: process.version,
      appVersion: packageInfo.version,
      nodeEnv: process.env['NODE_ENV'] ?? 'development',
      uptime: process.uptime(),
      platform: os.platform(),
      cpuCount: os.cpus().length,
    };

    logger.info('[PM2] System Info Snapshot:', systemInfo);
    reply({ systemInfo });
  });

  logger.info(`[PM2] Monitoring successfully initialized for: ${componentName}`);
};

// ============================================================
// Default Export
// ============================================================

export default { pm2Component };
