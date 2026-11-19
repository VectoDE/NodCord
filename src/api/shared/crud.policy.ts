/**
 * ------------------------------------------------------------
 * CRUD Policy - Zugriffs- und Feldregeln je Ressource
 * ------------------------------------------------------------
 *
 * Zentrale, typisierte Rechtematrix für die generischen
 * CRUD-Controller (siehe crud.factory.ts und registry.ts).
 *
 * Grundsätze:
 * - Fail-closed: ohne angemeldeten Nutzer 401, ohne passende
 *   Rolle 403. Jede Ressource MUSS eine Policy haben.
 * - access 'admin':       nur privilegierte Rollen (Standard: admin).
 * - access 'owner':       Nutzer sieht und ändert nur eigene Datensätze
 *                         (Besitzerfeld). Privilegierte Rollen dürfen alles.
 *                         Fremde Datensätze liefern 404, damit ihre
 *                         Existenz nicht erkennbar ist.
 * - access 'public-read': jeder angemeldete Nutzer darf lesen, aber nur
 *                         Datensätze, die publicWhere erfüllen. Schreiben
 *                         nur für privilegierte Rollen.
 * - Tenant-Scope: Modelle mit tenantId werden auf den Tenant des Nutzers
 *   eingeschränkt. Ein privilegierter Nutzer ohne Tenant gilt als global.
 * - Ausgabefilter: omit-Felder (Passwörter, Tokens, Schlüssel) verlassen
 *   den Server nie.
 * - Eingabe-Allowlist: nur gelistete Felder werden aus dem Body
 *   übernommen. Besitzer-, Tenant- und Audit-Felder setzt der Server.
 *
 * Dieses Modul ist bewusst frei von Laufzeit-Abhängigkeiten (kein
 * Prisma, kein Logger), damit es isoliert getestet werden kann.
 */

export type CrudResource =
  | 'apiKey'
  | 'blog'
  | 'bug'
  | 'category'
  | 'chat'
  | 'comment'
  | 'company'
  | 'developerProgram'
  | 'favorite'
  | 'feedback'
  | 'file'
  | 'group'
  | 'invoice'
  | 'log'
  | 'newsletter'
  | 'order'
  | 'organization'
  | 'payment'
  | 'product'
  | 'project'
  | 'role'
  | 'subscriber'
  | 'tag'
  | 'task'
  | 'team'
  | 'ticket'
  | 'user';

export type CrudAccess = 'admin' | 'owner' | 'public-read';

export type CrudOperation = 'list' | 'get' | 'create' | 'update' | 'delete';

export interface CrudPolicy {
  access: CrudAccess;
  /** Rollen mit Vollzugriff (Vergleich ohne Groß-/Kleinschreibung). Standard: ['admin']. */
  privilegedRoles?: readonly string[];
  /** Besitzerfeld (Pflicht bei access 'owner'), verweist auf User.id. */
  ownerField?: string;
  /** Operationen, die ein nicht privilegierter Besitzer ausführen darf. Standard: alle. */
  ownerOperations?: readonly CrudOperation[];
  /** Modell hat tenantId: Abfragen und Anlage werden auf den Tenant des Nutzers begrenzt. */
  tenantScoped: boolean;
  /** Zusatzfilter für nicht privilegierte Leser bei access 'public-read'. */
  publicWhere?: Readonly<Record<string, unknown>>;
  /** Felder, die nie ausgegeben werden. Müssen im Prisma-Modell existieren. */
  omit: readonly string[];
  /** Felder, die jeder berechtigte Aufrufer bei create und update setzen darf. */
  writable: readonly string[];
  /** Zusätzliche Felder nur bei create (z. B. Bezug auf Elterndatensatz). */
  createOnly?: readonly string[];
  /** Zusätzliche Felder nur für privilegierte Rollen. */
  privilegedWritable?: readonly string[];
  /** Feld, in das der Server beim create die Nutzer-ID schreibt. */
  createdByField?: string;
  /** Feld, in das der Server beim update die Nutzer-ID schreibt. */
  updatedByField?: string;
  /** Anlage über die generische API gesperrt (eigener Ablauf nötig). */
  allowCreate?: boolean;
}

const DEFAULT_PRIVILEGED_ROLES: readonly string[] = ['admin'];

/** Felder, die in keiner Allowlist stehen dürfen (Prüfung im Test). */
export const SERVER_CONTROLLED_FIELDS: readonly string[] = [
  'id',
  'tenantId',
  'password',
  'passwordHash',
  'accessToken',
  'refreshToken',
  'verificationToken',
  'key',
  'apiKeyId',
  'betaKeyId',
  'loginAttempts',
  'mfaEnabled',
  'isAuthenticated',
  'createdById',
  'updatedById',
  'createdAt',
  'updatedAt',
  'deletedAt',
];

export const crudPolicies: Readonly<Record<CrudResource, CrudPolicy>> = Object.freeze({
  apiKey: {
    access: 'admin',
    tenantScoped: true,
    omit: ['key'],
    writable: ['name', 'expiresAt', 'metadata'],
    // Schlüssel müssen serverseitig erzeugt und nur einmal angezeigt werden.
    allowCreate: false,
  },
  blog: {
    access: 'public-read',
    tenantScoped: true,
    publicWhere: { publishedAt: { not: null }, isArchived: false, deletedAt: null },
    omit: [],
    writable: [
      'picture',
      'title',
      'shortDescription',
      'detailDescription',
      'projectId',
      'author',
      'tags',
      'publishedAt',
      'isArchived',
      'metadata',
    ],
  },
  bug: {
    access: 'admin',
    tenantScoped: false,
    omit: [],
    writable: ['title', 'description', 'severity', 'status', 'projectId'],
  },
  category: {
    access: 'public-read',
    tenantScoped: true,
    publicWhere: { isActive: true },
    omit: [],
    writable: ['name', 'slug', 'description', 'icon', 'isActive', 'metadata'],
    createdByField: 'createdById',
    updatedByField: 'updatedById',
  },
  chat: {
    access: 'owner',
    ownerField: 'createdById',
    tenantScoped: true,
    omit: [],
    writable: ['participants', 'type', 'title', 'topic', 'isArchived', 'archivedAt', 'metadata'],
    updatedByField: 'updatedById',
  },
  comment: {
    access: 'owner',
    ownerField: 'authorId',
    tenantScoped: true,
    omit: [],
    writable: ['content', 'metadata'],
    createOnly: ['blogId', 'parentId'],
    privilegedWritable: ['authorId', 'status'],
    updatedByField: 'updatedById',
  },
  company: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: [
      'name',
      'description',
      'industry',
      'headquarters',
      'foundedDate',
      'employees',
      'website',
      'isArchived',
      'metadata',
    ],
  },
  developerProgram: {
    access: 'owner',
    ownerField: 'userId',
    // Besitzer darf sich bewerben und den eigenen Status lesen, aber nicht freischalten.
    ownerOperations: ['list', 'get', 'create'],
    tenantScoped: false,
    omit: [],
    writable: [],
    privilegedWritable: ['userId', 'isActive'],
  },
  favorite: {
    access: 'owner',
    ownerField: 'userId',
    tenantScoped: false,
    omit: [],
    writable: ['type', 'itemId', 'metadata'],
    privilegedWritable: ['userId'],
  },
  feedback: {
    // userId ist hier eine Discord-ID ohne Relation zu User, daher kein Besitzerbezug.
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: ['userId', 'guildId', 'feedbackText', 'category', 'metadata', 'resolvedAt'],
  },
  file: {
    access: 'admin',
    tenantScoped: false,
    omit: [],
    // path bleibt dem Upload-Ablauf vorbehalten.
    writable: ['filename', 'url'],
    allowCreate: false,
  },
  group: {
    access: 'owner',
    ownerField: 'createdById',
    tenantScoped: true,
    omit: [],
    writable: ['name', 'description', 'members', 'visibility', 'isArchived', 'metadata'],
    updatedByField: 'updatedById',
  },
  invoice: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: [
      'billingProfileId',
      'subscriptionId',
      'number',
      'status',
      'issuedAt',
      'dueDate',
      'paidAt',
      'currency',
      'subtotal',
      'taxTotal',
      'discountTotal',
      'total',
      'deliveryMethod',
      'notes',
      'metadata',
    ],
  },
  log: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: [],
  },
  newsletter: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: ['email', 'name', 'status', 'source', 'unsubscribedAt', 'metadata'],
  },
  order: {
    access: 'admin',
    privilegedRoles: ['admin', 'manager'],
    tenantScoped: true,
    omit: [],
    writable: [
      'customerId',
      'products',
      'totalAmount',
      'status',
      'trackingNumber',
      'isArchived',
      'metadata',
    ],
  },
  organization: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: ['name', 'description', 'foundedDate', 'members', 'isArchived', 'metadata'],
  },
  payment: {
    access: 'admin',
    privilegedRoles: ['admin', 'finance'],
    tenantScoped: true,
    omit: [],
    writable: [
      'userId',
      'amount',
      'method',
      'status',
      'transactionId',
      'billingProfileId',
      'invoiceId',
      'processedAt',
      'isArchived',
      'metadata',
    ],
  },
  product: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: [
      'picture',
      'title',
      'shortDescription',
      'detailDescription',
      'price',
      'category',
      'stock',
      'sku',
      'currency',
      'isArchived',
      'metadata',
    ],
  },
  project: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: [
      'picture',
      'title',
      'shortDescription',
      'detailDescription',
      'status',
      'startDate',
      'endDate',
      'members',
      'tags',
      'isArchived',
      'metadata',
    ],
  },
  role: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    // isSystem bleibt serverseitig, damit Systemrollen nicht über die API entstehen.
    writable: ['name', 'displayName', 'color', 'description', 'permissions', 'isDefault', 'metadata'],
    createdByField: 'createdById',
    updatedByField: 'updatedById',
  },
  subscriber: {
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: ['email', 'name', 'status', 'source', 'unsubscribedAt', 'metadata'],
    createdByField: 'createdById',
    updatedByField: 'updatedById',
  },
  tag: {
    access: 'public-read',
    tenantScoped: true,
    publicWhere: { isActive: true },
    omit: [],
    writable: ['name', 'slug', 'description', 'color', 'isActive', 'metadata'],
    createdByField: 'createdById',
    updatedByField: 'updatedById',
  },
  task: {
    access: 'owner',
    ownerField: 'assignedToId',
    // Zugewiesene Person darf eigene Aufgaben lesen und den Status pflegen.
    ownerOperations: ['list', 'get', 'update'],
    tenantScoped: true,
    omit: [],
    writable: ['status'],
    privilegedWritable: [
      'title',
      'description',
      'category',
      'assignedToId',
      'teamId',
      'dueDate',
      'priority',
      'estimateHours',
      'isArchived',
      'metadata',
    ],
  },
  team: {
    access: 'owner',
    ownerField: 'ownerId',
    tenantScoped: true,
    omit: [],
    writable: ['name', 'description', 'members', 'status', 'type', 'logo', 'isArchived', 'metadata'],
    privilegedWritable: ['ownerId'],
  },
  ticket: {
    // userId ist eine Discord-ID ohne Relation zu User, daher kein Besitzerbezug.
    access: 'admin',
    tenantScoped: true,
    omit: [],
    writable: [
      'guildId',
      'userId',
      'title',
      'description',
      'status',
      'messages',
      'assignedToId',
      'priority',
      'category',
      'slaDueAt',
      'isArchived',
      'metadata',
    ],
  },
  user: {
    access: 'admin',
    tenantScoped: true,
    omit: ['password', 'verificationToken', 'accessToken', 'refreshToken'],
    // Passwörter und Tokens laufen nie über die generische API.
    writable: ['fullname', 'username', 'email', 'bio', 'profilePicture'],
    // Rechte-relevante Felder zusätzlich explizit nur für Admins.
    privilegedWritable: ['role', 'isVerified', 'isBetaTester'],
  },
} satisfies Record<CrudResource, CrudPolicy>);

// ============================================================
// Principal
// ============================================================

export interface CrudPrincipal {
  id: string;
  roles: ReadonlySet<string>;
  tenantId: string | null;
}

/**
 * Liest den angemeldeten Nutzer aus req.user. Gibt null zurück, wenn
 * keine gültige Nutzer-ID vorhanden ist (führt zu 401).
 * Scopes zählen bewusst nicht als Rollen.
 */
export function resolvePrincipal(user: unknown): CrudPrincipal | null {
  if (!user || typeof user !== 'object') return null;
  const record = user as Record<string, unknown>;
  const id = record['id'];
  if (typeof id !== 'string' || id.trim().length === 0) return null;

  const roles = new Set<string>();
  const role = record['role'];
  if (typeof role === 'string' && role.length > 0) roles.add(role.toLowerCase());
  const roleList = record['roles'];
  if (Array.isArray(roleList)) {
    for (const entry of roleList) {
      if (typeof entry === 'string' && entry.length > 0) roles.add(entry.toLowerCase());
    }
  }

  const tenant = record['tenantId'];
  const tenantId = typeof tenant === 'string' && tenant.length > 0 ? tenant : null;

  return { id, roles, tenantId };
}

export function isPrivileged(policy: CrudPolicy, principal: CrudPrincipal): boolean {
  const required = policy.privilegedRoles ?? DEFAULT_PRIVILEGED_ROLES;
  for (const role of required) {
    if (principal.roles.has(role.toLowerCase())) return true;
  }
  return false;
}

// ============================================================
// Entscheidungen
// ============================================================

export type AccessDecision =
  | { allowed: true; privileged: boolean }
  | { allowed: false; status: 401 | 403 | 405 };

export function authorize(
  policy: CrudPolicy,
  principal: CrudPrincipal | null,
  operation: CrudOperation,
): AccessDecision {
  if (!principal) return { allowed: false, status: 401 };
  if (operation === 'create' && policy.allowCreate === false) {
    return { allowed: false, status: 405 };
  }

  const privileged = isPrivileged(policy, principal);
  if (privileged) return { allowed: true, privileged: true };

  switch (policy.access) {
    case 'admin':
      return { allowed: false, status: 403 };
    case 'public-read':
      return operation === 'list' || operation === 'get'
        ? { allowed: true, privileged: false }
        : { allowed: false, status: 403 };
    case 'owner': {
      if (!policy.ownerField) return { allowed: false, status: 403 };
      const ops = policy.ownerOperations;
      if (ops && !ops.includes(operation)) return { allowed: false, status: 403 };
      return { allowed: true, privileged: false };
    }
    default:
      return { allowed: false, status: 403 };
  }
}

/**
 * Filter, der jede Abfrage (list, get, update, delete) auf den
 * zulässigen Ausschnitt begrenzt: Tenant, Besitzer, öffentliche Sicht.
 */
export function buildScopeWhere(
  policy: CrudPolicy,
  principal: CrudPrincipal,
  privileged: boolean,
): Record<string, unknown> {
  const scope: Record<string, unknown> = {};

  if (policy.tenantScoped) {
    // Ein privilegierter Nutzer ohne Tenant ist global; alle anderen
    // sehen nur ihren Tenant bzw. Datensätze ohne Tenant.
    if (!(privileged && principal.tenantId === null)) {
      scope['tenantId'] = principal.tenantId;
    }
  }

  if (!privileged) {
    if (policy.access === 'owner' && policy.ownerField) {
      scope[policy.ownerField] = principal.id;
    }
    if (policy.access === 'public-read' && policy.publicWhere) {
      Object.assign(scope, policy.publicWhere);
    }
  }

  return scope;
}

/**
 * Übernimmt nur erlaubte Felder aus dem Body und setzt Besitzer-,
 * Tenant- und Audit-Felder serverseitig.
 */
export function buildWriteData(
  policy: CrudPolicy,
  principal: CrudPrincipal,
  privileged: boolean,
  body: Record<string, unknown>,
  operation: 'create' | 'update',
): Record<string, unknown> {
  const allowed = new Set<string>(policy.writable);
  if (operation === 'create') for (const f of policy.createOnly ?? []) allowed.add(f);
  if (privileged) for (const f of policy.privilegedWritable ?? []) allowed.add(f);
  for (const f of SERVER_CONTROLLED_FIELDS) allowed.delete(f);

  const data: Record<string, unknown> = {};
  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (operation === 'create') {
    if (policy.ownerField) {
      const provided = data[policy.ownerField];
      // Nur privilegierte Rollen dürfen für andere Nutzer anlegen.
      if (!(privileged && typeof provided === 'string' && provided.length > 0)) {
        data[policy.ownerField] = principal.id;
      }
    }
    if (policy.createdByField) data[policy.createdByField] = principal.id;
    if (policy.tenantScoped && principal.tenantId !== null) {
      data['tenantId'] = principal.tenantId;
    }
  } else {
    if (policy.ownerField && !privileged) delete data[policy.ownerField];
    if (policy.updatedByField) data[policy.updatedByField] = principal.id;
  }

  return data;
}

/** Prisma-omit-Argument oder undefined, wenn nichts auszublenden ist. */
export function buildOmitArg(policy: CrudPolicy): Record<string, true> | undefined {
  if (policy.omit.length === 0) return undefined;
  const omit: Record<string, true> = {};
  for (const field of policy.omit) omit[field] = true;
  return omit;
}

/** Entfernt omit-Felder zusätzlich im Speicher (Verteidigung in der Tiefe). */
export function stripOmitted<T>(policy: CrudPolicy, record: T): T {
  if (policy.omit.length === 0 || !record || typeof record !== 'object') return record;
  const copy: Record<string, unknown> = { ...(record as Record<string, unknown>) };
  for (const field of policy.omit) delete copy[field];
  return copy as T;
}
