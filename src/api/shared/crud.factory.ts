/**
 * ------------------------------------------------------------
 * CRUD Factory - Generic Prisma-backed controllers
 * ------------------------------------------------------------
 *
 * Provides configurable request handlers for common REST
 * resources backed by Prisma delegates. Designed to minimise
 * boilerplate across the API layer while keeping strict typing
 * and consistent responses.
 *
 * Jeder Controller braucht eine CrudPolicy (crud.policy.ts):
 * - Rechteprüfung je Operation (401 ohne Nutzer, 403 ohne Rolle),
 * - Datensatz-Scope (Besitzer, Tenant, öffentliche Sicht) in jeder
 *   Abfrage; fremde Datensätze ergeben 404,
 * - Ausgabefilter (omit) für Geheimnisse,
 * - Eingabe-Allowlist für create und update.
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';
import {
  authorize,
  buildOmitArg,
  buildScopeWhere,
  buildWriteData,
  resolvePrincipal,
  stripOmitted,
  type CrudOperation,
  type CrudPolicy,
  type CrudPrincipal,
} from '@/api/shared/crud.policy';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void | undefined>;

export interface CrudDelegate<TRecord = Record<string, unknown>> {
  findMany(args?: unknown): Promise<TRecord[]>;
  count(args?: unknown): Promise<number>;
  findFirst(args: unknown): Promise<TRecord | null>;
  create(args: unknown): Promise<TRecord>;
  update(args: unknown): Promise<TRecord>;
  delete(args: unknown): Promise<TRecord>;
}

export interface CrudControllerOptions<TRecord = Record<string, unknown>> {
  resource: string;
  plural?: string;
  delegate: CrudDelegate<TRecord>;
  /** Zugriffs- und Feldregeln (Pflicht, fail-closed). */
  policy: CrudPolicy;
  /** Express path parameter used for lookups (default: "id"). */
  idParam?: string;
  /** Prisma field used for lookups (default: same as idParam). */
  idField?: string;
  /** Optional id parser (e.g. Number). */
  parseId?: (raw: string) => string | number;
  /** Default order for index queries. */
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
  /** Additional include for list queries (select/omit/where are ignored). */
  listQueryArgs?: (req: Request) => Record<string, unknown> | undefined;
  /** Additional include for detail queries (select/omit/where are ignored). */
  detailQueryArgs?: (req: Request) => Record<string, unknown> | undefined;
  /** Build Prisma where clause for list queries (combined with the policy scope). */
  where?: (req: Request) => Record<string, unknown> | undefined;
  /** Disable mutating operations. */
  readOnly?: boolean;
  /** Disable deletions explicitly. */
  allowDelete?: boolean;
}

export interface CrudController {
  list: Handler;
  get: Handler;
  create: Handler;
  update: Handler;
  remove: Handler;
  /** Zugehörige Policy (nur lesend, z. B. für Doku und Tests). */
  readonly policy: CrudPolicy;
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

function isRecordNotFound(err: unknown): boolean {
  return !!err && typeof err === 'object' && (err as Record<string, unknown>)['code'] === 'P2025';
}

/** Nur include und ähnliches durchlassen; select würde omit aushebeln. */
function sanitizeExtraArgs(
  extra: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!extra) return undefined;
  const rest: Record<string, unknown> = { ...extra };
  delete rest['select'];
  delete rest['omit'];
  delete rest['where'];
  return rest;
}

function combineWhere(
  ...parts: Array<Record<string, unknown> | undefined>
): Record<string, unknown> {
  const filled = parts.filter(
    (part): part is Record<string, unknown> => !!part && Object.keys(part).length > 0,
  );
  if (filled.length === 0) return {};
  if (filled.length === 1) return filled[0] ?? {};
  return { AND: filled };
}

export function createCrudController<TRecord = Record<string, unknown>>(
  opts: CrudControllerOptions<TRecord>,
): CrudController {
  const {
    resource,
    plural = `${resource}s`,
    delegate,
    policy,
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

  if (!policy) {
    throw new Error(`CRUD controller "${resource}" requires a policy`);
  }

  const resourceLabel = resource.charAt(0).toUpperCase() + resource.slice(1);
  const omitArg = buildOmitArg(policy);
  const withOmit = (args: Record<string, unknown>): Record<string, unknown> =>
    omitArg ? { ...args, omit: omitArg } : args;

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

  /**
   * Prüft Anmeldung und Rolle. Sendet bei Ablehnung die Antwort selbst
   * und liefert null.
   */
  const guard = (
    req: Request,
    res: Response,
    operation: CrudOperation,
  ): { principal: CrudPrincipal; privileged: boolean } | null => {
    const principal = resolvePrincipal(req.user);
    const decision = authorize(policy, principal, operation);
    if (!decision.allowed || !principal) {
      const status = decision.allowed ? 401 : decision.status;
      const message =
        status === 401 ? 'Unauthorized' : status === 405 ? 'Method Not Allowed' : 'Forbidden';
      standardResponse(res, status, { error: message }, message);
      return null;
    }
    return { principal, privileged: decision.privileged };
  };

  const notFound = (res: Response, id: string | number) =>
    standardResponse(res, 404, { id }, `${resourceLabel} not found`);

  /** Datensatz im erlaubten Ausschnitt suchen (für update und delete). */
  const findScoped = (id: string | number, scope: Record<string, unknown>) =>
    delegate.findFirst({
      where: combineWhere({ [idField]: id }, scope),
      select: { [idField]: true },
    } as unknown);

  const list: Handler = safeAsync(
    async (req, res) => {
      const ctx = guard(req, res, 'list');
      if (!ctx) return;

      const page = parsePositiveInt(req.query['page'], 1, 1, 10_000);
      const limit = parsePositiveInt(req.query['limit'], 25, 1, 250);
      const skip = (page - 1) * limit;

      const scope = buildScopeWhere(policy, ctx.principal, ctx.privileged);
      const whereClause = combineWhere(buildWhere(req), scope);
      const extra = sanitizeExtraArgs(listQueryArgs ? listQueryArgs(req) : undefined);

      const queryArgs = withOmit({
        ...(extra ?? {}),
        where: whereClause,
        orderBy: defaultOrderBy,
        take: limit,
        skip,
      });

      const [items, total] = await Promise.all([
        delegate.findMany(queryArgs as unknown),
        delegate.count({ where: whereClause } as unknown),
      ]);

      return standardResponse(
        res,
        200,
        {
          items: items.map((item) => stripOmitted(policy, item)),
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
      const ctx = guard(req, res, 'get');
      if (!ctx) return;

      const id = getId(req);
      const scope = buildScopeWhere(policy, ctx.principal, ctx.privileged);
      const extra = sanitizeExtraArgs(detailQueryArgs ? detailQueryArgs(req) : undefined);
      const record = await delegate.findFirst(
        withOmit({
          ...(extra ?? {}),
          where: combineWhere({ [idField]: id }, scope),
        }) as unknown,
      );

      if (!record) return notFound(res, id);

      return standardResponse(res, 200, stripOmitted(policy, record), `${resourceLabel} fetched`);
    },
    { label: `${resource}#get` },
  ) as Handler;

  const create: Handler = safeAsync(
    async (req, res) => {
      const ctx = guard(req, res, 'create');
      if (!ctx) return;
      if (readOnly) {
        return standardResponse(
          res,
          405,
          { error: 'Read only resource' },
          `${resourceLabel} creation disabled`,
        );
      }

      const body = ensureObject(req.body);
      const data = buildWriteData(policy, ctx.principal, ctx.privileged, body, 'create');
      const created = await delegate.create(withOmit({ data }) as unknown);
      return standardResponse(res, 201, stripOmitted(policy, created), `${resourceLabel} created`);
    },
    { label: `${resource}#create` },
  ) as Handler;

  const update: Handler = safeAsync(
    async (req, res) => {
      const ctx = guard(req, res, 'update');
      if (!ctx) return;
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
      const scope = buildScopeWhere(policy, ctx.principal, ctx.privileged);

      const existing = await findScoped(id, scope);
      if (!existing) return notFound(res, id);

      const data = buildWriteData(policy, ctx.principal, ctx.privileged, body, 'update');
      try {
        // Scope auch im Update selbst, damit zwischen Prüfung und Schreiben
        // kein fremder Datensatz getroffen werden kann.
        const updated = await delegate.update(
          withOmit({ where: { ...scope, [idField]: id }, data }) as unknown,
        );
        return standardResponse(res, 200, stripOmitted(policy, updated), `${resourceLabel} updated`);
      } catch (err) {
        if (isRecordNotFound(err)) return notFound(res, id);
        throw err;
      }
    },
    { label: `${resource}#update` },
  ) as Handler;

  const remove: Handler = safeAsync(
    async (req, res) => {
      const ctx = guard(req, res, 'delete');
      if (!ctx) return;
      if (readOnly || !allowDelete) {
        return standardResponse(
          res,
          405,
          { error: 'Deletion disabled' },
          `${resourceLabel} deletion disabled`,
        );
      }

      const id = getId(req);
      const scope = buildScopeWhere(policy, ctx.principal, ctx.privileged);

      const existing = await findScoped(id, scope);
      if (!existing) return notFound(res, id);

      try {
        await delegate.delete({ where: { ...scope, [idField]: id } } as unknown);
      } catch (err) {
        if (isRecordNotFound(err)) return notFound(res, id);
        throw err;
      }
      return standardResponse(res, 200, { id }, `${resourceLabel} removed`);
    },
    { label: `${resource}#remove` },
  ) as Handler;

  return { list, get, create, update, remove, policy };
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
