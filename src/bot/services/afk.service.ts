import axios from 'axios';
import logger from '@/services/logger.service';

export interface AfkStatus {
  id: string;
  guildId: string;
  userId: string;
  message: string;
  setAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env['API_BASE_URL'] ?? 'http://localhost:8080';
const BOT_API_KEY = process.env['BOT_API_KEY'] ?? process.env['API_KEY'] ?? '';

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

if (BOT_API_KEY) {
  http.defaults.headers.common['x-api-key'] = BOT_API_KEY;
}

const cache = new Map<string, AfkStatus | null>();

function cacheKey(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

function storeCache(status: AfkStatus | null): void {
  if (!status) return;
  cache.set(cacheKey(status.guildId, status.userId), status);
}

export function setCacheEntry(guildId: string, userId: string, status: AfkStatus | null): void {
  cache.set(cacheKey(guildId, userId), status);
}

export function getCachedAfkStatus(guildId: string, userId: string): AfkStatus | null | undefined {
  return cache.get(cacheKey(guildId, userId));
}

export async function setAfkStatus(
  guildId: string,
  userId: string,
  message: string,
): Promise<AfkStatus> {
  const response = await http.put<AfkStatus>(`/api/v1/afk/${guildId}/${userId}`, { message });
  storeCache(response.data);
  return response.data;
}

export async function clearAfkStatus(guildId: string, userId: string): Promise<void> {
  try {
    await http.delete(`/api/v1/afk/${guildId}/${userId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      /* ignore */
    } else {
      logger.warn('[AFK] Failed to clear AFK status', { guildId, userId, error });
    }
  } finally {
    cache.set(cacheKey(guildId, userId), null);
  }
}

export async function fetchAfkStatus(guildId: string, userId: string): Promise<AfkStatus | null> {
  const cacheEntry = getCachedAfkStatus(guildId, userId);
  if (cacheEntry !== undefined) {
    return cacheEntry;
  }

  try {
    const response = await http.get<AfkStatus>(`/api/v1/afk/${guildId}/${userId}`);
    storeCache(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      cache.set(cacheKey(guildId, userId), null);
      return null;
    }
    logger.error('[AFK] Failed to fetch AFK status', { guildId, userId, error });
    throw error;
  }
}

export async function listGuildAfkStatuses(guildId: string): Promise<AfkStatus[]> {
  const response = await http.get<AfkStatus[]>(`/api/v1/afk/${guildId}`);
  response.data.forEach((status) => storeCache(status));
  return response.data;
}

export default Object.freeze({
  setAfkStatus,
  clearAfkStatus,
  fetchAfkStatus,
  listGuildAfkStatuses,
  getCachedAfkStatus,
  setCacheEntry,
});
