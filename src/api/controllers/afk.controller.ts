import type { Request, Response } from 'express';

import prisma from '@/services/prisma.service';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';

const DEFAULT_MESSAGE = "I'm currently AFK.";
const MAX_MESSAGE_LENGTH = 500;
const MAX_LIST_LIMIT = 200;

const sanitizeId = (value?: string): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const sanitizeMessage = (value: string): string =>
  value.replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE_LENGTH);

export const upsertAfkStatus = safeAsync(async (req: Request, res: Response) => {
  const { guildId: guildParam, userId: userParam } = req.params as Record<string, string | undefined>;
  const guildId = sanitizeId(guildParam);
  const userId = sanitizeId(userParam);
  const body = req.body as { message?: string } | undefined;

  if (!guildId || !userId) {
    standardResponse(res, 400, { error: 'guildId and userId are required' }, 'Invalid request');
    return;
  }

  const rawMessage = typeof body?.message === 'string' ? body.message : '';
  const normalizedMessage = sanitizeMessage(rawMessage || DEFAULT_MESSAGE);

  try {
    const entry = await prisma.afkStatus.upsert({
      where: { guildId_userId: { guildId, userId } },
      update: {
        message: normalizedMessage,
        setAt: new Date(),
      },
      create: {
        guildId,
        userId,
        message: normalizedMessage,
      },
    });

    logger.info('[AFK] Status updated', { guildId, userId });
    standardResponse(res, 200, entry, 'AFK status updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save AFK status';
    logger.error('[AFK] Upsert failed', { guildId, userId, error: message });
    standardResponse(res, 500, { error: message }, 'Failed to update AFK status');
  }
});

export const deleteAfkStatus = safeAsync(async (req: Request, res: Response) => {
  const { guildId: guildParam, userId: userParam } = req.params as Record<string, string | undefined>;
  const guildId = sanitizeId(guildParam);
  const userId = sanitizeId(userParam);

  if (!guildId || !userId) {
    standardResponse(res, 400, { error: 'guildId and userId are required' }, 'Invalid request');
    return;
  }

  try {
    const existing = await prisma.afkStatus.findUnique({
      where: { guildId_userId: { guildId, userId } },
    });

    if (!existing) {
      standardResponse(res, 404, { guildId, userId }, 'AFK status not found');
      return;
    }

    await prisma.afkStatus.delete({ where: { guildId_userId: { guildId, userId } } });
    logger.info('[AFK] Status cleared', { guildId, userId });
    standardResponse(res, 200, { guildId, userId }, 'AFK status cleared');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clear AFK status';
    logger.error('[AFK] Delete failed', { guildId, userId, error: message });
    standardResponse(res, 500, { error: message }, 'Failed to clear AFK status');
  }
});

export const getAfkStatus = safeAsync(async (req: Request, res: Response) => {
  const { guildId: guildParam, userId: userParam } = req.params as Record<string, string | undefined>;
  const guildId = sanitizeId(guildParam);
  const userId = sanitizeId(userParam);

  if (!guildId || !userId) {
    standardResponse(res, 400, { error: 'guildId and userId are required' }, 'Invalid request');
    return;
  }

  try {
    const entry = await prisma.afkStatus.findUnique({
      where: { guildId_userId: { guildId, userId } },
    });

    if (!entry) {
      standardResponse(res, 404, { guildId, userId }, 'AFK status not found');
      return;
    }

    standardResponse(res, 200, entry, 'AFK status fetched');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch AFK status';
    logger.error('[AFK] Fetch failed', { guildId, userId, error: message });
    standardResponse(res, 500, { error: message }, 'Failed to fetch AFK status');
  }
});

export const listGuildAfkStatuses = safeAsync(async (req: Request, res: Response) => {
  const { guildId: guildParam } = req.params as Record<string, string | undefined>;
  const guildId = sanitizeId(guildParam);
  const query = req.query as Record<string, string | string[] | undefined>;
  const limitSource = query['limit'];
  const limitParam = Array.isArray(limitSource) ? limitSource[0] : limitSource;
  const parsedLimit = limitParam !== undefined ? Number(limitParam) : 50;
  const safeLimit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(Math.floor(parsedLimit), MAX_LIST_LIMIT)
      : 50;

  if (!guildId) {
    standardResponse(res, 400, { error: 'guildId is required' }, 'Invalid request');
    return;
  }

  try {
    const entries = await prisma.afkStatus.findMany({
      where: { guildId },
      orderBy: { setAt: 'desc' },
      take: safeLimit,
    });

    standardResponse(res, 200, entries, 'AFK statuses fetched');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch AFK statuses';
    logger.error('[AFK] Guild list failed', { guildId, error: message });
    standardResponse(res, 500, { error: message }, 'Failed to fetch AFK statuses');
  }
});

export default Object.freeze({
  upsertAfkStatus,
  deleteAfkStatus,
  getAfkStatus,
  listGuildAfkStatuses,
});
