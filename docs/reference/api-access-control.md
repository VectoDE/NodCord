# API Access Control for Generic CRUD Resources

The 27 generic REST resources under `/api/v1/*` are built by `createCrudController`
(`src/api/shared/crud.factory.ts`). Every controller requires a policy from the central
table in `src/api/shared/crud.policy.ts`. Without a policy the controller cannot be created.

## Rules

| Situation                                      | Response                         |
| ---------------------------------------------- | -------------------------------- |
| No authenticated user (`req.user` without id)  | `401 Unauthorized`               |
| Role does not permit the operation             | `403 Forbidden`                  |
| Record outside the caller's scope (owner, tenant, public filter) | `404 Not Found` (existence is not revealed) |
| Operation disabled for the resource            | `405 Method Not Allowed`         |

- **Roles** come from `req.user.role` and `req.user.roles`, compared case-insensitively
  (`ADMIN` from the Prisma enum equals `admin`). Token scopes are not treated as roles.
- **access `admin`**: only privileged roles (default `admin`, per resource extendable).
- **access `owner`**: non-privileged users see and change only records whose owner field
  equals their user id. The filter is part of `list`, `get`, `update` and `delete`.
  `ownerOperations` can restrict which operations an owner may run.
- **access `public-read`**: every authenticated user may read records matching `publicWhere`
  (for example published, not archived). Writes need a privileged role.
- **Tenant scope**: for models with `tenantId`, queries are limited to the caller's tenant.
  Users without a tenant only see records without a tenant. A privileged user without a
  tenant is global. New records get the caller's tenant; a `tenantId` in the body is ignored.
- **Output filter**: fields listed in `omit` (passwords, tokens, API key values) are excluded
  via Prisma `omit` and removed again before the response is sent.
- **Input allowlist**: `create` and `update` only take fields from `writable`
  (plus `createOnly` on create and `privilegedWritable` for privileged roles). Everything else
  is dropped. Owner, tenant and audit fields (`createdById`, `updatedById`) are set by the server.

## Matrix

| Resource          | Access      | Privileged roles  | Owner field    | Tenant | Omitted fields                                              |
| ----------------- | ----------- | ----------------- | -------------- | ------ | ----------------------------------------------------------- |
| apiKey            | admin       | admin             | –              | yes    | key (create disabled, keys need a dedicated issuing flow)   |
| blog              | public-read | admin             | –              | yes    | – (public: published, not archived, not deleted)            |
| bug               | admin       | admin             | –              | no     | –                                                           |
| category          | public-read | admin             | –              | yes    | – (public: active)                                          |
| chat              | owner       | admin             | createdById    | yes    | –                                                           |
| comment           | owner       | admin             | authorId       | yes    | – (status only for admins)                                  |
| company           | admin       | admin             | –              | yes    | –                                                           |
| developerProgram  | owner       | admin             | userId         | no     | – (owner: list, get, create; activation only by admins)     |
| favorite          | owner       | admin             | userId         | no     | –                                                           |
| feedback          | admin       | admin             | –              | yes    | – (userId is a Discord id, not a user relation)             |
| file              | admin       | admin             | –              | no     | – (create disabled, path is set by the upload flow)         |
| group             | owner       | admin             | createdById    | yes    | –                                                           |
| invoice           | admin       | admin             | –              | yes    | –                                                           |
| log               | admin       | admin             | –              | yes    | – (read only)                                               |
| newsletter        | admin       | admin             | –              | yes    | –                                                           |
| order             | admin       | admin, manager    | –              | yes    | –                                                           |
| organization      | admin       | admin             | –              | yes    | –                                                           |
| payment           | admin       | admin, finance    | –              | yes    | –                                                           |
| product           | admin       | admin             | –              | yes    | –                                                           |
| project           | admin       | admin             | –              | yes    | –                                                           |
| role              | admin       | admin             | –              | yes    | – (isSystem is server-only)                                 |
| subscriber        | admin       | admin             | –              | yes    | –                                                           |
| tag               | public-read | admin             | –              | yes    | – (public: active)                                          |
| task              | owner       | admin             | assignedToId   | yes    | – (owner: list, get, update of status)                      |
| team              | owner       | admin             | ownerId        | yes    | –                                                           |
| ticket            | admin       | admin             | –              | yes    | – (userId is a Discord id, not a user relation)             |
| user              | admin       | admin             | –              | yes    | password, verificationToken, accessToken, refreshToken      |

The writable fields per resource are maintained only in `crud.policy.ts`; tests in
`src/api/shared/__tests__/` check that no allowlist contains server-controlled fields.

## Adding a resource

1. Add the name to `CrudResource` and a policy to `crudPolicies` in `crud.policy.ts`.
   Start with `access: 'admin'` and widen only with a documented reason.
2. List every secret column of the model in `omit`. Names must exist in the Prisma model.
3. Register the controller in `src/api/controllers/registry.ts` with `policy: crudPolicies.<name>`.
4. Extend the tests and this matrix.
