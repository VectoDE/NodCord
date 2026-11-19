import type { NextFunction, Request, Response } from 'express';

import {
  createCrudController,
  type CrudController,
  type CrudDelegate,
} from '@/api/shared/crud.factory';
import { crudPolicies, type CrudPolicy } from '@/api/shared/crud.policy';

type Row = Record<string, unknown>;

// ------------------------------------------------------------
// In-Memory-Delegate: wertet where wie Prisma für flache Filter,
// AND und { not: null } aus. So prüfen die Tests echte Scope-Wirkung.
// ------------------------------------------------------------

function matches(row: Row, where: unknown): boolean {
  if (!where || typeof where !== 'object') return true;
  for (const [key, cond] of Object.entries(where as Row)) {
    if (key === 'AND') {
      if (!(cond as unknown[]).every((part) => matches(row, part))) return false;
      continue;
    }
    if (cond !== null && typeof cond === 'object' && 'not' in (cond as Row)) {
      if (row[key] === (cond as Row)['not'] || (row[key] ?? null) === (cond as Row)['not']) {
        return false;
      }
      continue;
    }
    if ((row[key] ?? null) !== cond) return false;
  }
  return true;
}

interface MemoryDelegate {
  rows: Row[];
  findMany: jest.Mock;
  count: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

function memoryDelegate(seed: Row[]): MemoryDelegate {
  const rows = seed.map((row) => ({ ...row }));
  const argWhere = (args: unknown): unknown => (args as { where?: unknown } | undefined)?.where;
  const notFound = () => Object.assign(new Error('Record not found'), { code: 'P2025' });

  return {
    rows,
    findMany: jest.fn(async (args?: unknown) => rows.filter((r) => matches(r, argWhere(args)))),
    count: jest.fn(async (args?: unknown) => rows.filter((r) => matches(r, argWhere(args))).length),
    findFirst: jest.fn(async (args: unknown) => rows.find((r) => matches(r, argWhere(args))) ?? null),
    create: jest.fn(async (args: unknown) => {
      const row = { id: `new-${rows.length + 1}`, ...(args as { data: Row }).data };
      rows.push(row);
      return row;
    }),
    update: jest.fn(async (args: unknown) => {
      const row = rows.find((r) => matches(r, argWhere(args)));
      if (!row) throw notFound();
      Object.assign(row, (args as { data: Row }).data);
      return row;
    }),
    delete: jest.fn(async (args: unknown) => {
      const index = rows.findIndex((r) => matches(r, argWhere(args)));
      if (index < 0) throw notFound();
      const [removed] = rows.splice(index, 1);
      return removed;
    }),
  };
}

function controllerFor(
  resource: string,
  policy: CrudPolicy,
  delegate: MemoryDelegate,
  extra: { readOnly?: boolean; allowDelete?: boolean } = {},
): CrudController {
  return createCrudController({
    resource,
    delegate: delegate as unknown as CrudDelegate,
    policy,
    defaultOrderBy: { id: 'desc' },
    ...extra,
  });
}

// ------------------------------------------------------------
// Express-Attrappen
// ------------------------------------------------------------

interface Captured {
  status: number;
  body: { code: number; data?: unknown; message: string };
}

function makeReq(opts: { user?: Row; id?: string; body?: unknown; query?: Row }): Request {
  return {
    user: opts.user,
    params: opts.id ? { id: opts.id } : {},
    query: opts.query ?? {},
    body: opts.body ?? {},
  } as unknown as Request;
}

async function run(
  handler: CrudController['list'],
  req: Request,
): Promise<Captured> {
  const captured: Partial<Captured> = {};
  interface FakeRes {
    status(code: number): FakeRes;
    json(body: Captured['body']): FakeRes;
  }
  const res: FakeRes = {
    status(code: number) {
      captured.status = code;
      return res;
    },
    json(body: Captured['body']) {
      captured.body = body;
      return res;
    },
  };
  const next = jest.fn() as unknown as NextFunction;
  await handler(req, res as unknown as Response, next);
  if (captured.status === undefined || !captured.body) {
    throw new Error('handler sent no response');
  }
  return captured as Captured;
}

const userA = { id: 'user-a', role: 'USER' };
const userB = { id: 'user-b', role: 'USER' };
const admin = { id: 'admin-1', role: 'ADMIN' };

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('CRUD factory: Authentifizierung', () => {
  it('liefert 401 ohne Nutzer und fragt die Datenbank nicht ab', async () => {
    const db = memoryDelegate([{ id: 't1', name: 'x', isActive: true, tenantId: null }]);
    const ctrl = controllerFor('tag', crudPolicies.tag, db);

    for (const handler of [ctrl.list, ctrl.get, ctrl.create, ctrl.update, ctrl.remove]) {
      const out = await run(handler, makeReq({ id: 't1', body: { name: 'y' } }));
      expect(out.status).toBe(401);
    }
    expect(db.findMany).not.toHaveBeenCalled();
    expect(db.findFirst).not.toHaveBeenCalled();
    expect(db.create).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
    expect(db.delete).not.toHaveBeenCalled();
  });
});

describe('CRUD factory: admin-only', () => {
  it('Nicht-Admin erhält 403 auf user, role, apiKey', async () => {
    for (const name of ['user', 'role', 'apiKey'] as const) {
      const db = memoryDelegate([{ id: 'r1', tenantId: null }]);
      const ctrl = controllerFor(name, crudPolicies[name], db);
      expect((await run(ctrl.list, makeReq({ user: userA }))).status).toBe(403);
      expect((await run(ctrl.get, makeReq({ user: userA, id: 'r1' }))).status).toBe(403);
      expect((await run(ctrl.remove, makeReq({ user: userA, id: 'r1' }))).status).toBe(403);
      expect(db.findMany).not.toHaveBeenCalled();
      expect(db.delete).not.toHaveBeenCalled();
    }
  });

  it('Admin (Rolle aus Prisma-Enum, Großschreibung) erhält Zugriff', async () => {
    const db = memoryDelegate([{ id: 'u1', email: 'a@example.test', tenantId: null }]);
    const ctrl = controllerFor('user', crudPolicies.user, db);
    const out = await run(ctrl.list, makeReq({ user: admin }));
    expect(out.status).toBe(200);
  });
});

describe('CRUD factory: IDOR bei owner-Ressourcen', () => {
  const seed = (): Row[] => [
    { id: 'fav-a', userId: 'user-a', type: 'BLOG', itemId: '1' },
    { id: 'fav-b', userId: 'user-b', type: 'BLOG', itemId: '2' },
  ];

  it('list zeigt nur eigene Datensätze', async () => {
    const db = memoryDelegate(seed());
    const ctrl = controllerFor('favorite', crudPolicies.favorite, db);
    const out = await run(ctrl.list, makeReq({ user: userA }));
    const data = out.body.data as { items: Row[]; pagination: { total: number } };
    expect(data.items.map((r) => r['id'])).toEqual(['fav-a']);
    expect(data.pagination.total).toBe(1);
  });

  it('fremder Datensatz: get, update und delete liefern 404', async () => {
    const db = memoryDelegate(seed());
    const ctrl = controllerFor('favorite', crudPolicies.favorite, db);

    expect((await run(ctrl.get, makeReq({ user: userA, id: 'fav-b' }))).status).toBe(404);
    expect(
      (await run(ctrl.update, makeReq({ user: userA, id: 'fav-b', body: { itemId: 'x' } }))).status,
    ).toBe(404);
    expect((await run(ctrl.remove, makeReq({ user: userA, id: 'fav-b' }))).status).toBe(404);

    expect(db.update).not.toHaveBeenCalled();
    expect(db.delete).not.toHaveBeenCalled();
    expect(db.rows.find((r) => r['id'] === 'fav-b')).toMatchObject({ itemId: '2' });
  });

  it('eigener Datensatz bleibt bearbeitbar; Scope steht auch im Update', async () => {
    const db = memoryDelegate(seed());
    const ctrl = controllerFor('favorite', crudPolicies.favorite, db);
    const out = await run(
      ctrl.update,
      makeReq({ user: userA, id: 'fav-a', body: { itemId: '9' } }),
    );
    expect(out.status).toBe(200);
    expect(db.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'fav-a', userId: 'user-a' } }),
    );
  });

  it('Admin darf fremde Datensätze lesen', async () => {
    const db = memoryDelegate(seed());
    const ctrl = controllerFor('favorite', crudPolicies.favorite, db);
    expect((await run(ctrl.get, makeReq({ user: admin, id: 'fav-b' }))).status).toBe(200);
  });

  it('ownerOperations: Zugewiesene dürfen Aufgaben nicht löschen oder anlegen', async () => {
    const db = memoryDelegate([{ id: 'task-1', assignedToId: 'user-a', tenantId: null }]);
    const ctrl = controllerFor('task', crudPolicies.task, db);
    expect((await run(ctrl.remove, makeReq({ user: userA, id: 'task-1' }))).status).toBe(403);
    expect((await run(ctrl.create, makeReq({ user: userA, body: { title: 't' } }))).status).toBe(
      403,
    );
    expect((await run(ctrl.get, makeReq({ user: userB, id: 'task-1' }))).status).toBe(404);
  });
});

describe('CRUD factory: Mass Assignment', () => {
  it('create ignoriert role, tenantId, userId und unbekannte Felder', async () => {
    const db = memoryDelegate([]);
    const ctrl = controllerFor('favorite', crudPolicies.favorite, db);
    const out = await run(
      ctrl.create,
      makeReq({
        user: userA,
        body: {
          type: 'BLOG',
          itemId: '5',
          metadata: {},
          userId: 'user-b',
          tenantId: 'tenant-x',
          role: 'ADMIN',
          isAdmin: true,
          id: 'chosen-id',
        },
      }),
    );
    expect(out.status).toBe(201);
    expect(db.create).toHaveBeenCalledWith({
      data: { type: 'BLOG', itemId: '5', metadata: {}, userId: 'user-a' },
    });
  });

  it('update kann Besitzer nicht umhängen', async () => {
    const db = memoryDelegate([
      { id: 'team-1', ownerId: 'user-a', name: 'A', tenantId: null },
    ]);
    const ctrl = controllerFor('team', crudPolicies.team, db);
    await run(
      ctrl.update,
      makeReq({ user: userA, id: 'team-1', body: { name: 'B', ownerId: 'user-b', tenantId: 't9' } }),
    );
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ data: { name: 'B' } }));
    expect(db.rows[0]).toMatchObject({ ownerId: 'user-a', name: 'B', tenantId: null });
  });
});

describe('CRUD factory: Ausgabefilter (omit)', () => {
  const secretUser = {
    id: 'u1',
    email: 'a@example.test',
    password: 'hash',
    verificationToken: 'v',
    accessToken: 'a',
    refreshToken: 'r',
    tenantId: null,
  };

  it('keine Passwörter oder Tokens in list, get, create und update', async () => {
    const db = memoryDelegate([secretUser]);
    const ctrl = controllerFor('user', crudPolicies.user, db);

    const listed = await run(ctrl.list, makeReq({ user: admin }));
    const got = await run(ctrl.get, makeReq({ user: admin, id: 'u1' }));
    const updated = await run(
      ctrl.update,
      makeReq({ user: admin, id: 'u1', body: { fullname: 'N', password: 'plain' } }),
    );
    const created = await run(
      ctrl.create,
      makeReq({ user: admin, body: { fullname: 'C', email: 'c@example.test', password: 'p' } }),
    );

    const serialized = JSON.stringify([listed.body, got.body, updated.body, created.body]);
    for (const secret of ['password', 'verificationToken', 'accessToken', 'refreshToken']) {
      expect(serialized).not.toContain(secret);
    }
    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        omit: { password: true, verificationToken: true, accessToken: true, refreshToken: true },
      }),
    );
    expect(db.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ omit: expect.objectContaining({ password: true }) }),
    );
    // Passwort aus dem Body wird nicht gespeichert.
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({ data: { fullname: 'N' } }));
  });
});

describe('CRUD factory: Tenant-Scope', () => {
  const tenantUser = { id: 'user-a', role: 'USER', tenantId: 'tenant-1' };

  it('list und get bleiben im eigenen Tenant', async () => {
    const db = memoryDelegate([
      { id: 'tag-1', isActive: true, tenantId: 'tenant-1' },
      { id: 'tag-2', isActive: true, tenantId: 'tenant-2' },
      { id: 'tag-3', isActive: false, tenantId: 'tenant-1' },
    ]);
    const ctrl = controllerFor('tag', crudPolicies.tag, db);

    const out = await run(ctrl.list, makeReq({ user: tenantUser }));
    const items = (out.body.data as { items: Row[] }).items;
    expect(items.map((r) => r['id'])).toEqual(['tag-1']);

    expect((await run(ctrl.get, makeReq({ user: tenantUser, id: 'tag-2' }))).status).toBe(404);
    // public-read: inaktive Datensätze nur für Admins
    expect((await run(ctrl.get, makeReq({ user: tenantUser, id: 'tag-3' }))).status).toBe(404);
  });

  it('create setzt den Tenant des Nutzers, nicht den aus dem Body', async () => {
    const db = memoryDelegate([]);
    const ctrl = controllerFor('team', crudPolicies.team, db);
    await run(
      ctrl.create,
      makeReq({ user: tenantUser, body: { name: 'T', description: 'D', members: [], tenantId: 'tenant-2' } }),
    );
    expect(db.create).toHaveBeenCalledWith({
      data: { name: 'T', description: 'D', members: [], ownerId: 'user-a', tenantId: 'tenant-1' },
    });
  });

  it('Tenant-Admin sieht keine fremden Tenants', async () => {
    const db = memoryDelegate([
      { id: 'u1', tenantId: 'tenant-1' },
      { id: 'u2', tenantId: 'tenant-2' },
    ]);
    const ctrl = controllerFor('user', crudPolicies.user, db);
    const tenantAdmin = { id: 'admin-t1', role: 'admin', tenantId: 'tenant-1' };
    expect((await run(ctrl.get, makeReq({ user: tenantAdmin, id: 'u2' }))).status).toBe(404);
    expect((await run(ctrl.remove, makeReq({ user: tenantAdmin, id: 'u2' }))).status).toBe(404);
    expect(db.delete).not.toHaveBeenCalled();
  });
});

describe('CRUD factory: gesperrte Operationen', () => {
  it('public-read: Schreiben nur für Admins', async () => {
    const db = memoryDelegate([]);
    const ctrl = controllerFor('category', crudPolicies.category, db);
    expect((await run(ctrl.create, makeReq({ user: userA, body: { name: 'c' } }))).status).toBe(403);
    expect(db.create).not.toHaveBeenCalled();
  });

  it('apiKey-Anlage ist über die generische API gesperrt', async () => {
    const db = memoryDelegate([]);
    const ctrl = controllerFor('apiKey', crudPolicies.apiKey, db);
    expect((await run(ctrl.create, makeReq({ user: admin, body: { name: 'k' } }))).status).toBe(405);
    expect(db.create).not.toHaveBeenCalled();
  });

  it('log bleibt read-only, auch für Admins', async () => {
    const db = memoryDelegate([{ id: 'l1', tenantId: null }]);
    const ctrl = controllerFor('log', crudPolicies.log, db, { readOnly: true, allowDelete: false });
    expect((await run(ctrl.create, makeReq({ user: admin, body: {} }))).status).toBe(405);
    expect((await run(ctrl.remove, makeReq({ user: admin, id: 'l1' }))).status).toBe(405);
    expect((await run(ctrl.create, makeReq({ user: userA, body: {} }))).status).toBe(403);
  });
});
