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

export class AfkServiceError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'AfkServiceError';
  }
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

function normalizeError(error: unknown, fallback: string): AfkServiceError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as { error?: string; message?: string } | undefined;
    const detail = payload?.error ?? payload?.message ?? error.response?.statusText ?? error.message;
    return new AfkServiceError(detail || fallback, status);
  }

  if (error instanceof AfkServiceError) {
    return error;
  }

  logger.error('[AFK] Unexpected service error', { error });
  return new AfkServiceError(fallback);
}

export async function setAfkStatus(
  guildId: string,
  userId: string,
  message: string,
): Promise<AfkStatus> {
  try {
    const response = await http.put<AfkStatus>(`/api/v1/afk/${guildId}/${userId}`, { message });
    storeCache(response.data);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to update AFK status.');
  }
}

export async function clearAfkStatus(guildId: string, userId: string): Promise<void> {
  try {
    await http.delete(`/api/v1/afk/${guildId}/${userId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Already cleared; treat as success
    } else {
      throw normalizeError(error, 'Failed to clear AFK status.');
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
    throw normalizeError(error, 'Failed to fetch AFK status.');
  }
}

export async function listGuildAfkStatuses(guildId: string): Promise<AfkStatus[]> {
  try {
    const response = await http.get<AfkStatus[]>(`/api/v1/afk/${guildId}`);
    response.data.forEach((status) => storeCache(status));
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to list AFK statuses.');
  }
}

export default Object.freeze({
  setAfkStatus,
  clearAfkStatus,
  fetchAfkStatus,
  listGuildAfkStatuses,
  getCachedAfkStatus,
  setCacheEntry,
});
