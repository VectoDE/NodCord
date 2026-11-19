import {
  SERVER_CONTROLLED_FIELDS,
  authorize,
  buildScopeWhere,
  buildWriteData,
  crudPolicies,
  resolvePrincipal,
  stripOmitted,
  type CrudPolicy,
  type CrudResource,
} from '@/api/shared/crud.policy';

const entries = Object.entries(crudPolicies) as Array<[CrudResource, CrudPolicy]>;

describe('crudPolicies (Rechtematrix)', () => {
  it('deckt alle 27 generischen Ressourcen ab', () => {
    expect(entries).toHaveLength(27);
  });

  it('jede owner-Ressource hat ein Besitzerfeld', () => {
    for (const [name, policy] of entries) {
      if (policy.access === 'owner') {
        expect({ name, ownerField: policy.ownerField }).toEqual({
          name,
          ownerField: expect.any(String),
        });
      }
    }
  });

  it('keine Allowlist enthält serverseitige Felder', () => {
    for (const [name, policy] of entries) {
      const lists = [
        ...policy.writable,
        ...(policy.createOnly ?? []),
        ...(policy.privilegedWritable ?? []),
      ];
      const forbidden = lists.filter((field) => SERVER_CONTROLLED_FIELDS.includes(field));
      expect({ name, forbidden }).toEqual({ name, forbidden: [] });
    }
  });

  it('Besitzerfeld ist für Nicht-Admins nie frei beschreibbar', () => {
    for (const [name, policy] of entries) {
      if (!policy.ownerField) continue;
      const open = [...policy.writable, ...(policy.createOnly ?? [])];
      expect({ name, open: open.includes(policy.ownerField) }).toEqual({ name, open: false });
    }
  });

  it('blendet Passwörter, Tokens und Schlüssel aus', () => {
    expect(crudPolicies.user.omit).toEqual(
      expect.arrayContaining(['password', 'verificationToken', 'accessToken', 'refreshToken']),
    );
    expect(crudPolicies.apiKey.omit).toContain('key');
    expect(crudPolicies.user.writable).not.toContain('password');
  });

  it('Verwaltungsressourcen sind admin-only', () => {
    const adminOnly: CrudResource[] = [
      'user',
      'role',
      'apiKey',
      'log',
      'invoice',
      'payment',
      'order',
      'subscriber',
      'newsletter',
    ];
    for (const name of adminOnly) {
      expect({ name, access: crudPolicies[name].access }).toEqual({ name, access: 'admin' });
    }
  });
});

describe('resolvePrincipal', () => {
  it('liefert null ohne gültige Nutzer-ID', () => {
    expect(resolvePrincipal(undefined)).toBeNull();
    expect(resolvePrincipal({})).toBeNull();
    expect(resolvePrincipal({ id: '' })).toBeNull();
    expect(resolvePrincipal({ id: 42 })).toBeNull();
  });

  it('normalisiert Rollen und liest den Tenant', () => {
    const p = resolvePrincipal({ id: 'u1', role: 'ADMIN', roles: ['Manager'], tenantId: 't1' });
    expect(p?.roles.has('admin')).toBe(true);
    expect(p?.roles.has('manager')).toBe(true);
    expect(p?.tenantId).toBe('t1');
  });

  it('wertet Scopes nicht als Rollen', () => {
    const p = resolvePrincipal({ id: 'u1', scopes: ['admin'] });
    expect(p?.roles.size).toBe(0);
  });
});

describe('authorize', () => {
  const user = resolvePrincipal({ id: 'u1', role: 'user' });
  const admin = resolvePrincipal({ id: 'a1', role: 'admin' });

  it('401 ohne Nutzer', () => {
    expect(authorize(crudPolicies.tag, null, 'list')).toEqual({ allowed: false, status: 401 });
  });

  it('403 für Nicht-Admins auf admin-Ressourcen', () => {
    expect(authorize(crudPolicies.user, user, 'get')).toEqual({ allowed: false, status: 403 });
    expect(authorize(crudPolicies.user, admin, 'get')).toEqual({ allowed: true, privileged: true });
  });

  it('public-read erlaubt nur Lesen', () => {
    expect(authorize(crudPolicies.tag, user, 'list')).toEqual({ allowed: true, privileged: false });
    expect(authorize(crudPolicies.tag, user, 'create')).toEqual({ allowed: false, status: 403 });
  });

  it('beachtet ownerOperations', () => {
    expect(authorize(crudPolicies.task, user, 'update')).toEqual({
      allowed: true,
      privileged: false,
    });
    expect(authorize(crudPolicies.task, user, 'create')).toEqual({ allowed: false, status: 403 });
    expect(authorize(crudPolicies.developerProgram, user, 'update')).toEqual({
      allowed: false,
      status: 403,
    });
  });

  it('erkennt zusätzliche privilegierte Rollen je Ressource', () => {
    const finance = resolvePrincipal({ id: 'f1', role: 'finance' });
    expect(authorize(crudPolicies.payment, finance, 'list')).toEqual({
      allowed: true,
      privileged: true,
    });
    expect(authorize(crudPolicies.invoice, finance, 'list')).toEqual({
      allowed: false,
      status: 403,
    });
  });

  it('405, wenn Anlage über die generische API gesperrt ist', () => {
    expect(authorize(crudPolicies.apiKey, admin, 'create')).toEqual({
      allowed: false,
      status: 405,
    });
  });
});

describe('buildScopeWhere', () => {
  it('Besitzer- und Tenant-Filter für normale Nutzer', () => {
    const p = resolvePrincipal({ id: 'u1', tenantId: 't1' });
    if (!p) throw new Error('principal');
    expect(buildScopeWhere(crudPolicies.team, p, false)).toEqual({ tenantId: 't1', ownerId: 'u1' });
  });

  it('Nutzer ohne Tenant sieht nur Datensätze ohne Tenant', () => {
    const p = resolvePrincipal({ id: 'u1' });
    if (!p) throw new Error('principal');
    expect(buildScopeWhere(crudPolicies.chat, p, false)).toEqual({
      tenantId: null,
      createdById: 'u1',
    });
  });

  it('Admin mit Tenant bleibt im Tenant, globaler Admin ohne Filter', () => {
    const tenantAdmin = resolvePrincipal({ id: 'a1', role: 'admin', tenantId: 't1' });
    const globalAdmin = resolvePrincipal({ id: 'a2', role: 'admin' });
    if (!tenantAdmin || !globalAdmin) throw new Error('principal');
    expect(buildScopeWhere(crudPolicies.user, tenantAdmin, true)).toEqual({ tenantId: 't1' });
    expect(buildScopeWhere(crudPolicies.user, globalAdmin, true)).toEqual({});
  });

  it('public-read zeigt Nicht-Admins nur veröffentlichte Datensätze', () => {
    const p = resolvePrincipal({ id: 'u1', tenantId: 't1' });
    if (!p) throw new Error('principal');
    expect(buildScopeWhere(crudPolicies.blog, p, false)).toEqual({
      tenantId: 't1',
      publishedAt: { not: null },
      isArchived: false,
      deletedAt: null,
    });
  });
});

describe('buildWriteData', () => {
  const p = resolvePrincipal({ id: 'u1', tenantId: 't1' });
  const admin = resolvePrincipal({ id: 'a1', role: 'admin', tenantId: 't1' });

  it('verwirft nicht erlaubte Felder und setzt Besitzer und Tenant', () => {
    if (!p) throw new Error('principal');
    const data = buildWriteData(
      crudPolicies.favorite,
      p,
      false,
      { type: 'BLOG', itemId: 'i1', metadata: {}, userId: 'u2', tenantId: 't2', role: 'admin', id: 'x' },
      'create',
    );
    expect(data).toEqual({ type: 'BLOG', itemId: 'i1', metadata: {}, userId: 'u1' });
  });

  it('Tenant kommt immer vom Server', () => {
    if (!p) throw new Error('principal');
    const data = buildWriteData(
      crudPolicies.team,
      p,
      false,
      { name: 'A', description: 'B', members: [], tenantId: 't2', ownerId: 'u2' },
      'create',
    );
    expect(data).toEqual({ name: 'A', description: 'B', members: [], ownerId: 'u1', tenantId: 't1' });
  });

  it('Besitzer kann Besitzerfeld beim Update nicht ändern', () => {
    if (!p) throw new Error('principal');
    const data = buildWriteData(crudPolicies.team, p, false, { name: 'N', ownerId: 'u2' }, 'update');
    expect(data).toEqual({ name: 'N' });
  });

  it('Admin darf für andere Nutzer anlegen, Audit-Felder setzt der Server', () => {
    if (!admin) throw new Error('principal');
    const data = buildWriteData(
      crudPolicies.comment,
      admin,
      true,
      { content: 'c', blogId: 'b1', authorId: 'u9', updatedById: 'u9' },
      'create',
    );
    expect(data).toEqual({ content: 'c', blogId: 'b1', authorId: 'u9', tenantId: 't1' });

    const upd = buildWriteData(crudPolicies.role, admin, true, { name: 'r', isSystem: true }, 'update');
    expect(upd).toEqual({ name: 'r', updatedById: 'a1' });
  });

  it('createOnly-Felder gelten nicht beim Update', () => {
    if (!p) throw new Error('principal');
    const data = buildWriteData(crudPolicies.comment, p, false, { content: 'c', blogId: 'b2' }, 'update');
    expect(data).toEqual({ content: 'c', updatedById: 'u1' });
  });

  it('Passwort, Rolle und Rechte-Felder sind ohne Admin-Rolle nie setzbar', () => {
    if (!p || !admin) throw new Error('principal');
    const body = {
      fullname: 'X',
      password: 'secret',
      role: 'ADMIN',
      isVerified: true,
      isAdmin: true,
      verified: true,
      balance: 100,
    };
    expect(buildWriteData(crudPolicies.user, p, false, body, 'update')).toEqual({ fullname: 'X' });
    expect(buildWriteData(crudPolicies.user, admin, true, body, 'update')).toEqual({
      fullname: 'X',
      role: 'ADMIN',
      isVerified: true,
    });
  });
});

describe('stripOmitted', () => {
  it('entfernt Geheimnisse aus Datensätzen', () => {
    const out = stripOmitted(crudPolicies.user, {
      id: 'u1',
      email: 'a@example.test',
      password: 'hash',
      refreshToken: 'r',
    });
    expect(out).toEqual({ id: 'u1', email: 'a@example.test' });
  });
});
