import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';
import prisma from '@/services/prisma.service';

import type { Request, Response } from 'express';

export const upsertAfkStatus = safeAsync(async (req: Request, res: Response) => {
  const { guildId, userId } = req.params;
  const { message } = (req.body as { message?: string }) ?? {};

  if (!guildId || !userId) {
    standardResponse(res, 400, { error: 'guildId and userId are required' }, 'Invalid request');
    return;
  }

  const trimmedMessage = (message ?? '').trim() || "I'm currently AFK.";

  const entry = await prisma.afkStatus.upsert({
    where: { guildId_userId: { guildId, userId } },
    update: { message: trimmedMessage, setAt: new Date() },
    create: { guildId, userId, message: trimmedMessage },
  });

  standardResponse(res, 200, entry, 'AFK status updated');
});

export const deleteAfkStatus = safeAsync(async (req: Request, res: Response) => {
  const { guildId, userId } = req.params;
  if (!guildId || !userId) {
    standardResponse(res, 400, { error: 'guildId and userId are required' }, 'Invalid request');
    return;
  }

  const existing = await prisma.afkStatus.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (!existing) {
    standardResponse(res, 404, { guildId, userId }, 'AFK status not found');
    return;
  }

  await prisma.afkStatus.delete({ where: { guildId_userId: { guildId, userId } } });

  standardResponse(res, 200, { guildId, userId }, 'AFK status cleared');
});

export const getAfkStatus = safeAsync(async (req: Request, res: Response) => {
  const { guildId, userId } = req.params;
  if (!guildId || !userId) {
    standardResponse(res, 400, { error: 'guildId and userId are required' }, 'Invalid request');
    return;
  }

  const entry = await prisma.afkStatus.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (!entry) {
    standardResponse(res, 404, { guildId, userId }, 'AFK status not found');
    return;
  }

  standardResponse(res, 200, entry, 'AFK status fetched');
});

export const listGuildAfkStatuses = safeAsync(async (req: Request, res: Response) => {
  const { guildId } = req.params;
  if (!guildId) {
    standardResponse(res, 400, { error: 'guildId is required' }, 'Invalid request');
    return;
  }

  const entries = await prisma.afkStatus.findMany({
    where: { guildId },
    orderBy: { setAt: 'desc' },
  });

  standardResponse(res, 200, entries, 'AFK statuses fetched');
});

export default Object.freeze({
  upsertAfkStatus,
  deleteAfkStatus,
  getAfkStatus,
  listGuildAfkStatuses,
});
