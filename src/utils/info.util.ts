/**
 * ------------------------------------------------------------
 * Info Utility — System & Bot Metadata Helpers
 * ------------------------------------------------------------
 *
 * Responsibilities:
 * - Provide aggregated information about the running Discord bot
 * - Collect environment and runtime/system metrics for views
 * - Gracefully handle missing integrations (bot not started, etc.)
 *
 * Dependencies:
 * - Node.js core modules (os)
 * - systeminformation (disk + cpu load metrics)
 * - logger.service for structured logging
 */

import os from 'os';
import { createRequire } from 'module';
import si from 'systeminformation';

import logger from '@/services/logger.service';
import { getBaseUrl } from '@/utils/baseUrl.util';
import { roundTo } from '@/utils/number.util';

// ============================================================
// Types
// ============================================================

export interface BotInfo {
  name: string | null;
  username: string | null;
  tokenMasked: string | null;
  guildsCount: number;
  botsOnline: number;
  membersTracked: number;
  serversTracked: number;
  lastUpdated: string;
}

export interface ApiInfo {
  version: string | null;
  baseUrl: string;
  apiStatus: 'online' | 'offline' | 'unknown';
  environment: string;
  dbStatus: 'connected' | 'disconnected' | 'unknown';
}

export interface DiskInfo {
  device: string;
  size: number;
  used: number;
  available: number;
  usePercent: number;
}

export interface SystemInfo {
  cpuCores: number;
  cpuModel: string | null;
  cpuLoad: number | 'N/A';
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  uptimeSeconds: number;
  platform: NodeJS.Platform;
  arch: string;
  hostname: string;
  disk: DiskInfo[];
  systemName: string | null;
  systemManufacturer: string | null;
}

type BotModule = {
  getBots?: () => Promise<{ botData: Array<Record<string, unknown>> }>;
  getMembers?: () => Promise<{ memberData: Array<Record<string, unknown>> }>;
  getServers?: () => Promise<{ serverData: Array<Record<string, unknown>> }>;
};

// ============================================================
// Internal helpers
// ============================================================

const require = createRequire(import.meta.url);
let cachedBotModule: BotModule | null | undefined;

function resolveBotModule(): BotModule | null {
  if (cachedBotModule !== undefined) return cachedBotModule;

  try {
    cachedBotModule = require('../bot/bot') as BotModule;
    logger.debug('[INFO] Discord bot module loaded for info utilities');
    return cachedBotModule;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[INFO] Discord bot module not available', { error: err.message });
    cachedBotModule = null;
    return null;
  }
}

function maskToken(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  if (value.length <= 6) return '*'.repeat(value.length);
  return `${value.slice(0, 3)}****${value.slice(-3)}`;
}

// ============================================================
// Public API
// ============================================================

export async function getBotInfo(): Promise<BotInfo> {
  const fallback: BotInfo = {
    name: null,
    username: null,
    tokenMasked: null,
    guildsCount: 0,
    botsOnline: 0,
    membersTracked: 0,
    serversTracked: 0,
    lastUpdated: new Date().toISOString(),
  };

  const botModule = resolveBotModule();
  if (!botModule) return fallback;

  try {
    const [botsResult, membersResult, serversResult] = await Promise.all([
      botModule.getBots?.() ?? Promise.resolve({ botData: [] }),
      botModule.getMembers?.() ?? Promise.resolve({ memberData: [] }),
      botModule.getServers?.() ?? Promise.resolve({ serverData: [] }),
    ]);

    const firstBot = botsResult.botData.at(0) ?? {};
    const firstBotRecord = firstBot as Record<string, unknown>;
    const guilds = new Set<string>();
    for (const entry of botsResult.botData) {
      const entryRecord = entry as Record<string, unknown>;
      const guildId =
        typeof entryRecord['guildId'] === 'string' ? (entryRecord['guildId'] as string) : null;
      if (guildId) guilds.add(guildId);
    }

    return {
      name:
        typeof firstBotRecord['displayName'] === 'string'
          ? (firstBotRecord['displayName'] as string)
          : null,
      username:
        typeof firstBotRecord['username'] === 'string'
          ? (firstBotRecord['username'] as string)
          : null,
      tokenMasked: maskToken(firstBotRecord['token']),
      guildsCount: guilds.size,
      botsOnline: botsResult.botData.length,
      membersTracked: membersResult.memberData.length,
      serversTracked: serversResult.serverData.length,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[INFO] Failed to gather bot info', { error: err.message });
    return fallback;
  }
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const cpus = os.cpus() ?? [];
  let cpuLoad: number | 'N/A' = 'N/A';

  try {
    const load = await si.currentLoad();
    cpuLoad = roundTo(load.currentLoad, 2);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[INFO] Failed to retrieve CPU load', { error: err.message });
  }

  let disk: DiskInfo[] = [];
  try {
    const fsSize = await si.fsSize();
    disk = fsSize.map((entry) => ({
      device: entry.fs,
      size: entry.size,
      used: entry.used,
      available: entry.size - entry.used,
      usePercent: entry.use,
    }));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.warn('[INFO] Failed to retrieve disk info', { error: err.message });
  }

  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  return {
    cpuCores: cpus.length,
    cpuModel: cpus[0]?.model ?? null,
    cpuLoad,
    totalMemory: totalMem,
    freeMemory: freeMem,
    usedMemory: totalMem - freeMem,
    uptimeSeconds: Math.floor(process.uptime()),
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    disk,
    systemName: os.type(),
    systemManufacturer: os.release(), // best-effort; real manufacturer requires extra tooling
  };
}

export async function getApiInfo(): Promise<ApiInfo> {
  const environment = process.env['NODE_ENV'] ?? 'development';
  const dbStatus = process.env['DATABASE_STATUS'] ?? 'unknown';
  const apiStatus = process.env['API_STATUS'] ?? 'unknown';

  return {
    version: process.env['API_VERSION'] ?? null,
    baseUrl: getBaseUrl(),
    apiStatus: apiStatus === 'online' || apiStatus === 'offline' ? apiStatus : 'unknown',
    environment,
    dbStatus: dbStatus === 'connected' || dbStatus === 'disconnected' ? dbStatus : 'unknown',
  };
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  getBotInfo,
  getSystemInfo,
  getApiInfo,
});
