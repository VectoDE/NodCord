/**
 * ------------------------------------------------------------
 * CRUD Factory - Generic Prisma-backed controllers
 * ------------------------------------------------------------
 *
 * Provides configurable request handlers for common REST
 * resources backed by Prisma delegates. Designed to minimise
 * boilerplate across the API layer while keeping strict typing
 * and consistent responses.
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void | undefined>;

export interface CrudDelegate<TRecord = Record<string, unknown>> {
  findMany(args?: unknown): Promise<TRecord[]>;
  count(args?: unknown): Promise<number>;
  findUnique(args: unknown): Promise<TRecord | null>;
  create(args: unknown): Promise<TRecord>;
  update(args: unknown): Promise<TRecord>;
  delete(args: unknown): Promise<TRecord>;
}

export interface CrudControllerOptions<TRecord = Record<string, unknown>> {
  resource: string;
  plural?: string;
  delegate: CrudDelegate<TRecord>;
  /** Express path parameter used for lookups (default: "id"). */
  idParam?: string;
  /** Prisma field used for lookups (default: same as idParam). */
  idField?: string;
  /** Optional id parser (e.g. Number). */
  parseId?: (raw: string) => string | number;
  /** Default order for index queries. */
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
  /** Additional include/select for list queries. */
  listQueryArgs?: (req: Request) => Record<string, unknown> | undefined;
  /** Additional include/select for detail queries. */
  detailQueryArgs?: (req: Request) => Record<string, unknown> | undefined;
  /** Build Prisma where clause for list queries. */
  where?: (req: Request) => Record<string, unknown> | undefined;
  /** Disable mutating operations. */
  readOnly?: boolean;
  /** Disable deletions explicitly. */
  allowDelete?: boolean;
}

export interface CrudController<TRecord = Record<string, unknown>> {
  list: Handler;
  get: Handler;
  create: Handler;
  update: Handler;
  remove: Handler;
}

function ensureObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Payload must be a JSON object');
  }
  return input as Record<string, unknown>;
}

function parsePositiveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}

export function createCrudController<TRecord = Record<string, unknown>>(
  opts: CrudControllerOptions<TRecord>,
): CrudController<TRecord> {
  const {
    resource,
    plural = `${resource}s`,
    delegate,
    idParam = 'id',
    idField = idParam,
    parseId,
    defaultOrderBy = { id: 'asc' },
    listQueryArgs,
    detailQueryArgs,
    where,
    readOnly = false,
    allowDelete = true,
  } = opts;

  const resourceLabel = resource.charAt(0).toUpperCase() + resource.slice(1);

  const getId = (req: Request): string | number => {
    const raw = req.params[idParam];
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      throw new TypeError(`Missing path parameter "${idParam}"`);
    }
    return parseId ? parseId(raw) : raw;
  };

  const buildWhere = (req: Request): Record<string, unknown> | undefined => {
    try {
      return where ? where(req) : undefined;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.warn('[CRUD] where builder failed', { resource, error: error.message });
      return undefined;
    }
  };

  const list: Handler = safeAsync(
    async (req, res) => {
      const page = parsePositiveInt(req.query.page, 1, 1, 10_000);
      const limit = parsePositiveInt(req.query.limit, 25, 1, 250);
      const skip = (page - 1) * limit;

      const whereClause = buildWhere(req);
      const extra = listQueryArgs ? listQueryArgs(req) : undefined;

      const queryArgs = {
        ...(whereClause ? { where: whereClause } : {}),
        ...(extra ?? {}),
        orderBy: defaultOrderBy,
        take: limit,
        skip,
      };

      const [items, total] = await Promise.all([
        delegate.findMany(queryArgs as unknown),
        delegate.count(whereClause ? ({ where: whereClause } as unknown) : undefined),
      ]);

      return standardResponse(
        res,
        200,
        {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          },
        },
        `${plural} fetched`,
      );
    },
    { label: `${resource}#list` },
  ) as Handler;

  const get: Handler = safeAsync(
    async (req, res) => {
      const id = getId(req);
      const extra = detailQueryArgs ? detailQueryArgs(req) : undefined;
      const record = await delegate.findUnique({
        where: { [idField]: id },
        ...(extra ?? {}),
      } as unknown);

      if (!record) {
        return standardResponse(res, 404, { id }, `${resourceLabel} not found`);
      }

      return standardResponse(res, 200, record, `${resourceLabel} fetched`);
    },
    { label: `${resource}#get` },
  ) as Handler;

  const create: Handler = safeAsync(
    async (req, res) => {
      if (readOnly) {
        return standardResponse(
          res,
          405,
          { error: 'Read only resource' },
          `${resourceLabel} creation disabled`,
        );
      }
      const body = ensureObject(req.body);
      const created = await delegate.create({ data: body } as unknown);
      return standardResponse(res, 201, created, `${resourceLabel} created`);
    },
    { label: `${resource}#create` },
  ) as Handler;

  const update: Handler = safeAsync(
    async (req, res) => {
      if (readOnly) {
        return standardResponse(
          res,
          405,
          { error: 'Read only resource' },
          `${resourceLabel} updates disabled`,
        );
      }
      const id = getId(req);
      const body = ensureObject(req.body);
      const updated = await delegate.update({
        where: { [idField]: id },
        data: body,
      } as unknown);
      return standardResponse(res, 200, updated, `${resourceLabel} updated`);
    },
    { label: `${resource}#update` },
  ) as Handler;

  const remove: Handler = safeAsync(
    async (req, res) => {
      if (!allowDelete) {
        return standardResponse(
          res,
          405,
          { error: 'Deletion disabled' },
          `${resourceLabel} deletion disabled`,
        );
      }
      const id = getId(req);
      await delegate.delete({ where: { [idField]: id } } as unknown);
      return standardResponse(res, 200, { id }, `${resourceLabel} removed`);
    },
    { label: `${resource}#remove` },
  ) as Handler;

  return { list, get, create, update, remove };
}

export function createCrudRouter(controller: CrudController, options?: { idParam?: string }) {
  const router = Router();
  const idParam = options?.idParam ?? 'id';

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get(`/:${idParam}`, controller.get);
  router.put(`/:${idParam}`, controller.update);
  router.patch(`/:${idParam}`, controller.update);
  router.delete(`/:${idParam}`, controller.remove);

  return router;
}

export default Object.freeze({
  createCrudController,
  createCrudRouter,
});
