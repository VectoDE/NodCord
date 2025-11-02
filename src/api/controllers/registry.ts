import prisma from '@/services/prisma.service';
import {
  createCrudController,
  type CrudController,
  type CrudDelegate,
} from '@/api/shared/crud.factory';

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

const delegate = (value: unknown): CrudDelegate => value as CrudDelegate;

const controllers: Record<CrudResource, CrudController> = {
  apiKey: createCrudController({
    resource: 'apiKey',
    plural: 'API keys',
    delegate: delegate(prisma.apiKey),
    defaultOrderBy: { id: 'desc' },
  }),
  blog: createCrudController({
    resource: 'blog',
    plural: 'blogs',
    delegate: delegate(prisma.blog),
    defaultOrderBy: { id: 'desc' },
  }),
  bug: createCrudController({
    resource: 'bug',
    plural: 'bugs',
    delegate: delegate(prisma.bug),
    defaultOrderBy: { id: 'desc' },
  }),
  category: createCrudController({
    resource: 'category',
    plural: 'categories',
    delegate: delegate(prisma.category),
    defaultOrderBy: { id: 'desc' },
  }),
  chat: createCrudController({
    resource: 'chat',
    plural: 'chats',
    delegate: delegate(prisma.chat),
    defaultOrderBy: { id: 'desc' },
  }),
  comment: createCrudController({
    resource: 'comment',
    plural: 'comments',
    delegate: delegate(prisma.comment),
    defaultOrderBy: { id: 'desc' },
  }),
  company: createCrudController({
    resource: 'company',
    plural: 'companies',
    delegate: delegate(prisma.company),
    defaultOrderBy: { id: 'desc' },
  }),
  developerProgram: createCrudController({
    resource: 'developerProgram',
    plural: 'developer programs',
    delegate: delegate(prisma.developerProgram),
    defaultOrderBy: { id: 'desc' },
  }),
  favorite: createCrudController({
    resource: 'favorite',
    plural: 'favorites',
    delegate: delegate(prisma.favorite),
    defaultOrderBy: { id: 'desc' },
  }),
  feedback: createCrudController({
    resource: 'feedback',
    plural: 'feedback entries',
    delegate: delegate(prisma.feedback),
    defaultOrderBy: { id: 'desc' },
  }),
  file: createCrudController({
    resource: 'file',
    plural: 'files',
    delegate: delegate(prisma.file),
    defaultOrderBy: { id: 'desc' },
  }),
  group: createCrudController({
    resource: 'group',
    plural: 'groups',
    delegate: delegate(prisma.group),
    defaultOrderBy: { id: 'desc' },
  }),
  invoice: createCrudController({
    resource: 'invoice',
    plural: 'invoices',
    delegate: delegate(prisma.invoice),
    defaultOrderBy: { id: 'desc' },
  }),
  log: createCrudController({
    resource: 'log',
    plural: 'logs',
    delegate: delegate(prisma.log),
    defaultOrderBy: { id: 'desc' },
    readOnly: true,
    allowDelete: false,
  }),
  newsletter: createCrudController({
    resource: 'newsletter',
    plural: 'newsletter entries',
    delegate: delegate(prisma.newsletter),
    defaultOrderBy: { id: 'desc' },
  }),
  order: createCrudController({
    resource: 'order',
    plural: 'orders',
    delegate: delegate(prisma.order),
    defaultOrderBy: { id: 'desc' },
  }),
  organization: createCrudController({
    resource: 'organization',
    plural: 'organizations',
    delegate: delegate(prisma.organization),
    defaultOrderBy: { id: 'desc' },
  }),
  payment: createCrudController({
    resource: 'payment',
    plural: 'payments',
    delegate: delegate(prisma.payment),
    defaultOrderBy: { id: 'desc' },
  }),
  product: createCrudController({
    resource: 'product',
    plural: 'products',
    delegate: delegate(prisma.product),
    defaultOrderBy: { id: 'desc' },
  }),
  project: createCrudController({
    resource: 'project',
    plural: 'projects',
    delegate: delegate(prisma.project),
    defaultOrderBy: { id: 'desc' },
  }),
  role: createCrudController({
    resource: 'role',
    plural: 'roles',
    delegate: delegate(prisma.role),
    defaultOrderBy: { id: 'desc' },
  }),
  subscriber: createCrudController({
    resource: 'subscriber',
    plural: 'subscribers',
    delegate: delegate(prisma.subscriber),
    defaultOrderBy: { id: 'desc' },
  }),
  tag: createCrudController({
    resource: 'tag',
    plural: 'tags',
    delegate: delegate(prisma.tag),
    defaultOrderBy: { id: 'desc' },
  }),
  task: createCrudController({
    resource: 'task',
    plural: 'tasks',
    delegate: delegate(prisma.task),
    defaultOrderBy: { id: 'desc' },
  }),
  team: createCrudController({
    resource: 'team',
    plural: 'teams',
    delegate: delegate(prisma.team),
    defaultOrderBy: { id: 'desc' },
  }),
  ticket: createCrudController({
    resource: 'ticket',
    plural: 'tickets',
    delegate: delegate(prisma.ticket),
    defaultOrderBy: { id: 'desc' },
  }),
  user: createCrudController({
    resource: 'user',
    plural: 'users',
    delegate: delegate(prisma.user),
    defaultOrderBy: { id: 'desc' },
  }),
};

export const controllerRegistry: Record<CrudResource, CrudController> = controllers;

export function getController<R extends CrudResource>(resource: R): CrudController {
  return controllers[resource];
}

export default controllers;
