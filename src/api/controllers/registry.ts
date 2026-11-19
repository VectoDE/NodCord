import prisma from '@/services/prisma.service';
import {
  createCrudController,
  type CrudController,
  type CrudDelegate,
} from '@/api/shared/crud.factory';
import { crudPolicies, type CrudResource } from '@/api/shared/crud.policy';

export type { CrudResource } from '@/api/shared/crud.policy';

const delegate = (value: unknown): CrudDelegate => value as CrudDelegate;

const controllers: Record<CrudResource, CrudController> = {
  apiKey: createCrudController({
    resource: 'apiKey',
    plural: 'API keys',
    delegate: delegate(prisma.apiKey),
    policy: crudPolicies.apiKey,
    defaultOrderBy: { id: 'desc' },
  }),
  blog: createCrudController({
    resource: 'blog',
    plural: 'blogs',
    delegate: delegate(prisma.blog),
    policy: crudPolicies.blog,
    defaultOrderBy: { id: 'desc' },
  }),
  bug: createCrudController({
    resource: 'bug',
    plural: 'bugs',
    delegate: delegate(prisma.bug),
    policy: crudPolicies.bug,
    defaultOrderBy: { id: 'desc' },
  }),
  category: createCrudController({
    resource: 'category',
    plural: 'categories',
    delegate: delegate(prisma.category),
    policy: crudPolicies.category,
    defaultOrderBy: { id: 'desc' },
  }),
  chat: createCrudController({
    resource: 'chat',
    plural: 'chats',
    delegate: delegate(prisma.chat),
    policy: crudPolicies.chat,
    defaultOrderBy: { id: 'desc' },
  }),
  comment: createCrudController({
    resource: 'comment',
    plural: 'comments',
    delegate: delegate(prisma.comment),
    policy: crudPolicies.comment,
    defaultOrderBy: { id: 'desc' },
  }),
  company: createCrudController({
    resource: 'company',
    plural: 'companies',
    delegate: delegate(prisma.company),
    policy: crudPolicies.company,
    defaultOrderBy: { id: 'desc' },
  }),
  developerProgram: createCrudController({
    resource: 'developerProgram',
    plural: 'developer programs',
    delegate: delegate(prisma.developerProgram),
    policy: crudPolicies.developerProgram,
    defaultOrderBy: { id: 'desc' },
  }),
  favorite: createCrudController({
    resource: 'favorite',
    plural: 'favorites',
    delegate: delegate(prisma.favorite),
    policy: crudPolicies.favorite,
    defaultOrderBy: { id: 'desc' },
  }),
  feedback: createCrudController({
    resource: 'feedback',
    plural: 'feedback entries',
    delegate: delegate(prisma.feedback),
    policy: crudPolicies.feedback,
    defaultOrderBy: { id: 'desc' },
  }),
  file: createCrudController({
    resource: 'file',
    plural: 'files',
    delegate: delegate(prisma.file),
    policy: crudPolicies.file,
    defaultOrderBy: { id: 'desc' },
  }),
  group: createCrudController({
    resource: 'group',
    plural: 'groups',
    delegate: delegate(prisma.group),
    policy: crudPolicies.group,
    defaultOrderBy: { id: 'desc' },
  }),
  invoice: createCrudController({
    resource: 'invoice',
    plural: 'invoices',
    delegate: delegate(prisma.invoice),
    policy: crudPolicies.invoice,
    defaultOrderBy: { id: 'desc' },
  }),
  log: createCrudController({
    resource: 'log',
    plural: 'logs',
    delegate: delegate(prisma.log),
    policy: crudPolicies.log,
    defaultOrderBy: { id: 'desc' },
    readOnly: true,
    allowDelete: false,
  }),
  newsletter: createCrudController({
    resource: 'newsletter',
    plural: 'newsletter entries',
    delegate: delegate(prisma.newsletter),
    policy: crudPolicies.newsletter,
    defaultOrderBy: { id: 'desc' },
  }),
  order: createCrudController({
    resource: 'order',
    plural: 'orders',
    delegate: delegate(prisma.order),
    policy: crudPolicies.order,
    defaultOrderBy: { id: 'desc' },
  }),
  organization: createCrudController({
    resource: 'organization',
    plural: 'organizations',
    delegate: delegate(prisma.organization),
    policy: crudPolicies.organization,
    defaultOrderBy: { id: 'desc' },
  }),
  payment: createCrudController({
    resource: 'payment',
    plural: 'payments',
    delegate: delegate(prisma.payment),
    policy: crudPolicies.payment,
    defaultOrderBy: { id: 'desc' },
  }),
  product: createCrudController({
    resource: 'product',
    plural: 'products',
    delegate: delegate(prisma.product),
    policy: crudPolicies.product,
    defaultOrderBy: { id: 'desc' },
  }),
  project: createCrudController({
    resource: 'project',
    plural: 'projects',
    delegate: delegate(prisma.project),
    policy: crudPolicies.project,
    defaultOrderBy: { id: 'desc' },
  }),
  role: createCrudController({
    resource: 'role',
    plural: 'roles',
    delegate: delegate(prisma.role),
    policy: crudPolicies.role,
    defaultOrderBy: { id: 'desc' },
  }),
  subscriber: createCrudController({
    resource: 'subscriber',
    plural: 'subscribers',
    delegate: delegate(prisma.subscriber),
    policy: crudPolicies.subscriber,
    defaultOrderBy: { id: 'desc' },
  }),
  tag: createCrudController({
    resource: 'tag',
    plural: 'tags',
    delegate: delegate(prisma.tag),
    policy: crudPolicies.tag,
    defaultOrderBy: { id: 'desc' },
  }),
  task: createCrudController({
    resource: 'task',
    plural: 'tasks',
    delegate: delegate(prisma.task),
    policy: crudPolicies.task,
    defaultOrderBy: { id: 'desc' },
  }),
  team: createCrudController({
    resource: 'team',
    plural: 'teams',
    delegate: delegate(prisma.team),
    policy: crudPolicies.team,
    defaultOrderBy: { id: 'desc' },
  }),
  ticket: createCrudController({
    resource: 'ticket',
    plural: 'tickets',
    delegate: delegate(prisma.ticket),
    policy: crudPolicies.ticket,
    defaultOrderBy: { id: 'desc' },
  }),
  user: createCrudController({
    resource: 'user',
    plural: 'users',
    delegate: delegate(prisma.user),
    policy: crudPolicies.user,
    defaultOrderBy: { id: 'desc' },
  }),
};

export const controllerRegistry: Record<CrudResource, CrudController> = controllers;

export function getController<R extends CrudResource>(resource: R): CrudController {
  return controllers[resource];
}

export default controllers;
