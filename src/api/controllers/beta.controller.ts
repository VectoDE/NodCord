import type { Request, Response } from 'express';

import { prisma } from '@/services/prisma.service';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';

function generateBetaKey(): string {
  const segment = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BETA-${segment}`;
}

export const listBetaKeys = safeAsync(
  async (_req: Request, res: Response) => {
    const keys = await prisma.betaKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return standardResponse(res, 200, { items: keys }, 'Beta keys fetched');
  },
  { label: 'beta#listKeys' },
);

export const createBetaKey = safeAsync(
  async (req: Request, res: Response) => {
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const rawName = payload['name'];
    const rawKey = payload['key'];
    const rawActive = payload['isActive'];

    if (typeof rawName !== 'string' || rawName.trim().length === 0) {
      return standardResponse(res, 400, { error: 'Name is required' }, 'Invalid payload');
    }

    const created = await prisma.betaKey.create({
      data: {
        name: rawName.trim(),
        key:
          typeof rawKey === 'string' && rawKey.trim().length > 0
            ? rawKey.trim()
            : generateBetaKey(),
        isActive: typeof rawActive === 'boolean' ? rawActive : true,
      },
    });

    return standardResponse(res, 201, created, 'Beta key created');
  },
  { label: 'beta#createKey' },
);

export const updateBetaKey = safeAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return standardResponse(res, 400, { error: 'Missing beta key id' }, 'Invalid payload');

    const payload = (req.body ?? {}) as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    const nameValue = payload['name'];
    const activeValue = payload['isActive'];
    const keyValue = payload['key'];
    if (typeof nameValue === 'string') data['name'] = nameValue.trim();
    if (typeof activeValue === 'boolean') data['isActive'] = activeValue;
    if (typeof keyValue === 'string') data['key'] = keyValue.trim();
    if (Object.keys(data).length === 0) {
      return standardResponse(res, 400, { error: 'No updates provided' }, 'Invalid payload');
    }

    const updated = await prisma.betaKey.update({
      where: { id },
      data,
    });

    return standardResponse(res, 200, updated, 'Beta key updated');
  },
  { label: 'beta#updateKey' },
);

export const deleteBetaKey = safeAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return standardResponse(res, 400, { error: 'Missing beta key id' }, 'Invalid payload');

    await prisma.betaKey.delete({ where: { id } });
    return standardResponse(res, 200, { id }, 'Beta key removed');
  },
  { label: 'beta#deleteKey' },
);

export const getBetaSystem = safeAsync(
  async (_req: Request, res: Response) => {
    const system = await prisma.betaSystem.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return standardResponse(res, 200, system ?? null, 'Beta system fetched');
  },
  { label: 'beta#getSystem' },
);

export const updateBetaSystem = safeAsync(
  async (req: Request, res: Response) => {
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const isActive = payload['isActive'];
    const metadata = payload['metadata'];

    const updates: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') updates['isActive'] = isActive;
    if (metadata && typeof metadata === 'object') updates['metadata'] = metadata;

    try {
      const existing = await prisma.betaSystem.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        const updated = await prisma.betaSystem.update({
          where: { id: existing.id },
          data: updates,
        });
        return standardResponse(res, 200, updated, 'Beta system updated');
      }

      const created = await prisma.betaSystem.create({
        data: {
          isActive: typeof isActive === 'boolean' ? isActive : true,
          metadata: (updates['metadata'] as Record<string, unknown> | undefined) ?? {},
        },
      });
      return standardResponse(res, 201, created, 'Beta system created');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('[BETA] Failed to update system', { error: err.message });
      return standardResponse(res, 500, { error: err.message }, 'Failed to update beta system');
    }
  },
  { label: 'beta#updateSystem' },
);

export default Object.freeze({
  listBetaKeys,
  createBetaKey,
  updateBetaKey,
  deleteBetaKey,
  getBetaSystem,
  updateBetaSystem,
});
